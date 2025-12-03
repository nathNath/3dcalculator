import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Calculator, Clock, CheckCircle } from 'lucide-react';

const DEFAULTS = {
  materialCost: 110.0, // R$/kg
  printSpeed: 50,    // mm/s (não usado no cálculo de custo, mas mantido para redefinição)
  hourlyRate: 5.0,  // R$/h
  powerCost: 0.588,    // R$/kWh
  printerPower: 300, // W (Valor padrão em Watts, ex: 150W)
  markupPercentage: 50.0, // Markup padrão de 50%
};

// Enumeração para as diferentes telas do aplicativo
const VIEWS = {
  SETTINGS: 'SETTINGS',
  INPUT: 'INPUT',
  RESULTS: 'RESULTS',
};

// Componente principal do aplicativo
const App = () => {
  // Estados para Configurações
  const [materialCost, setMaterialCost] = useState(DEFAULTS.materialCost);
  const [printSpeed, setPrintSpeed] = useState(DEFAULTS.printSpeed);
  const [hourlyRate, setHourlyRate] = useState(DEFAULTS.hourlyRate);
  const [powerCost, setPowerCost] = useState(DEFAULTS.powerCost);
  const [printerPower, setPrinterPower] = useState(DEFAULTS.printerPower); 
  // Porcentagem de Markup
  const [markupPercentage, setMarkupPercentage] = useState(DEFAULTS.markupPercentage); 
  
  // Estados para os inputs do cálculo
  const [printDurationHours, setPrintDurationHours] = useState(4.5); // Horas
  const [filamentWeight, setFilamentWeight] = useState(50.0); // Gramas

  // Estado para controlar a visualização atual
  const [currentView, setCurrentView] = useState(VIEWS.SETTINGS);

  // --- Funções de Cálculo ---
  const results = useMemo(() => {
    // Conversões e Constantes
    const materialCostPerGram = materialCost / 1000; // R$/g
    
    // 1. Custo do Material
    const materialCostTotal = filamentWeight * materialCostPerGram;

    // CONVERSÃO: Convertendo Watts (W) para Kilowatts (kW)
    const printerPowerKw = printerPower / 1000; 

    // 2. Custo da Eletricidade
    const powerConsumptionKwh = printerPowerKw * printDurationHours; 
    const powerCostTotal = powerConsumptionKwh * powerCost;

    // 3. Custo do Tempo de Impressora (Mão de Obra/Depreciação)
    const timeCostTotal = printDurationHours * hourlyRate;

    // Custo Total de Produção (Material + Energia + Tempo) -> USADO PARA TUDO
    const totalCost = materialCostTotal + powerCostTotal + timeCostTotal;
    
    // CÁLCULO: Preço de Venda (baseado no totalCost)
    const sellingPrice = totalCost * (1 + (markupPercentage / 100));
    
    // CÁLCULO: Lucro Estimado (Preço de Venda - Custo Total)
    const profit = sellingPrice - totalCost;

    return {
      materialCostTotal,
      powerCostTotal,
      timeCostTotal, // Custo do tempo
      totalCost,     // Custo Total (Material + Energia + Hora)
      sellingPrice, 
      profit,
    };
  }, [materialCost, printDurationHours, filamentWeight, hourlyRate, powerCost, printerPower, markupPercentage]);

  // Função para formatar moeda
  const formatCurrency = (value) => {
    // Retorna string formatada (ex: R$ 10,50)
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Função auxiliar para formatar números para CSV (usando vírgula como separador decimal)
  const formatNumberForCSV = (value) => {
    return String(value).replace('.', ',');
  };
  
  // FUNÇÃO DE EXPORTAÇÃO PARA CSV
  const exportToCSV = () => {
    // Dados de entrada e resultado
    const data = [
      // Configurações
      { label: 'Custo do Material (R$/kg)', value: materialCost, currency: true },
      { label: 'Taxa Horária (R$/h)', value: hourlyRate, currency: true },
      { label: 'Custo da Energia (R$/kWh)', value: powerCost, currency: true },
      { label: 'Potência da Impressora (W)', value: printerPower, currency: false },
      { label: 'Markup (%)', value: markupPercentage, currency: false },
      // Dados da Impressão
      { label: 'Duração da Impressão (Horas)', value: printDurationHours, currency: false },
      { label: 'Peso do Filamento (Gramas)', value: filamentWeight, currency: false },
      // Resultados (Usando valores numéricos crus para melhor análise no Excel)
      { label: '---', value: '---' },
      { label: 'Custo Total Material (R$)', value: results.materialCostTotal, currency: true },
      { label: 'Custo Total Energia (R$)', value: results.powerCostTotal, currency: true },
      { label: 'Custo Total Tempo Impressora (R$)', value: results.timeCostTotal, currency: true }, 
      // Retorna ao nome original
      { label: 'Custo Total Produção (R$)', value: results.totalCost, currency: true },
      { label: '---', value: '---' },
      { label: 'Preço de Venda Sugerido (R$)', value: results.sellingPrice, currency: true },
      { label: 'Lucro Estimado (R$)', value: results.profit, currency: true },
    ];

    // Cria o cabeçalho CSV (usando ; como separador)
    let csvContent = "Detalhe;Valor\n";

    // Adiciona as linhas de dados
    data.forEach(item => {
      // Formata o valor: usa o número cru para R$, mas substitui ponto por vírgula.
      let value = item.value === '---' ? '---' : formatNumberForCSV(item.value);
      
      // Se for valor monetário, prefixa com R$
      if (item.currency && item.value !== '---' && !isNaN(item.value)) {
        value = 'R$ ' + value;
      }

      csvContent += `${item.label};${value}\n`;
    });

    // Cria o Blob e o link para download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Configura o download
    link.setAttribute('href', url);
    link.setAttribute('download', `custo_impressao_${new Date().toISOString().slice(0, 10)}.csv`);
    
    // Anexa o link, clica e remove (para iniciar o download)
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Função para redefinir todas as configurações e valores de cálculo
  const resetAll = () => {
    setMaterialCost(DEFAULTS.materialCost);
    setPrintSpeed(DEFAULTS.printSpeed);
    setHourlyRate(DEFAULTS.hourlyRate);
    setPowerCost(DEFAULTS.powerCost);
    setPrinterPower(DEFAULTS.printerPower);
    setMarkupPercentage(DEFAULTS.markupPercentage); 
    setPrintDurationHours(4.5);
    setFilamentWeight(50.0);
    setCurrentView(VIEWS.SETTINGS); // Volta para o início após redefinir
  };
  
  // --- Componentes de Renderização ---

  const StatItem = ({ label, value, note = null }) => (
    <div className="stat-item">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {note && <div className="stat-note">{note}</div>}
    </div>
  );
  
  // Renderiza a seção de Configurações
  const renderSettingsView = () => (
    // Estilização inline para garantir que o card fique centralizado e em coluna
    <div className="card-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="card-title">
        <Settings className="icon-small icon-accent" />
        Configurações Padrão
      </h2>

      {/* Custo do Material */}
      <div className="input-group">
        <label className="label-text" htmlFor="materialCost">Custo do Material (R$/kg)</label>
        <input
          id="materialCost"
          type="number"
          step="0.1"
          min="0"
          className="input-field"
          value={materialCost}
          onChange={(e) => setMaterialCost(Number(e.target.value))}
        />
      </div>

      {/* Taxa Horária da Impressora (Agora incluída no custo total) */}
      <div className="input-group">
        <label className="label-text" htmlFor="hourlyRate">Taxa Horária (R$/h)</label>
        <input
          id="hourlyRate"
          type="number"
          step="0.1"
          min="0"
          className="input-field"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(Number(e.target.value))}
        />
      </div>
      
      {/* Custo da Energia */}
      <div className="input-group">
        <label className="label-text" htmlFor="powerCost">Custo da Energia (R$/kWh)</label>
        <input
          id="powerCost"
          type="number"
          step="0.01"
          min="0"
          className="input-field"
          value={powerCost}
          onChange={(e) => setPowerCost(Number(e.target.value))}
        />
      </div>
      
      {/* Consumo da Impressora - EM WATTS (W) */}
      <div className="input-group">
        <label className="label-text" htmlFor="printerPower">Potência da Impressora (W)</label> 
        <input
          id="printerPower"
          type="number"
          step="1"
          min="0"
          className="input-field"
          value={printerPower}
          onChange={(e) => setPrinterPower(Number(e.target.value))}
        />
      </div>

      {/* Markup (%) */}
      <div className="input-group">
        <label className="label-text" htmlFor="markup">Markup (%)</label> 
        <input
          id="markup"
          type="number"
          step="1"
          min="0"
          className="input-field"
          value={markupPercentage}
          onChange={(e) => setMarkupPercentage(Number(e.target.value))}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button className="secondary-button" onClick={resetAll} style={{ width: '40%' }}>
          Redefinir
        </button>
        <button className="primary-button" onClick={() => setCurrentView(VIEWS.INPUT)} style={{ width: '60%' }}>
          Próximo: Dados da Impressão
        </button>
      </div>
    </div>
  );

  // Renderiza a seção de Entrada de Dados
  const renderInputView = () => (
    // Estilização inline para garantir que o card fique centralizado e em coluna
    <div className="card-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="card-title">
        <Calculator className="icon-small icon-accent" />
        Dados da Impressão
      </h2>

      {/* Duração da Impressão */}
      <div className="input-group">
        <label className="label-text" htmlFor="duration">Duração da Impressão (Horas)</label>
        <input
          id="duration"
          type="number"
          step="0.1"
          min="0"
          className="input-field"
          value={printDurationHours}
          onChange={(e) => setPrintDurationHours(Number(e.target.value))}
        />
      </div>

      {/* Peso do Filamento */}
      <div className="input-group">
        <label className="label-text" htmlFor="weight">Peso do Filamento (Gramas)</label>
        <input
          id="weight"
          type="number"
          step="1"
          min="0"
          className="input-field"
          value={filamentWeight}
          onChange={(e) => setFilamentWeight(Number(e.target.value))}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button className="secondary-button" onClick={() => setCurrentView(VIEWS.SETTINGS)} style={{ width: '40%', backgroundColor: 'var(--color-bg-medium)' }}>
          Voltar
        </button>
        <button className="primary-button" onClick={() => setCurrentView(VIEWS.RESULTS)} style={{ width: '60%' }}>
          Calcular Custo
        </button>
      </div>
    </div>
  );

  // Renderiza a seção de Resultados
  const renderResultsView = () => (
    // Estilização inline para garantir que o conteúdo fique centralizado e em coluna
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* PAINEL DE RESULTADOS DE CUSTO */}
      <div className="card-panel">
        <h2 className="card-title">
          <Clock className="icon-small icon-accent" />
          Custo de Produção
        </h2>
        
        {/* Exibição do Custo Total */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-400">CUSTO TOTAL DE PRODUÇÃO (MATERIAL + ENERGIA + HORA)</p>
          <h3 style={{ fontSize: '3rem', fontWeight: '800', color: results.totalCost > 0 ? 'var(--color-accent-light)' : 'var(--color-text-muted)' }}>
            {formatCurrency(results.totalCost)}
          </h3>
        </div>
        
        {/* Grid de Estatísticas Detalhadas */}
        <div className="stats-grid">
          <StatItem 
            label="Material" 
            value={formatCurrency(results.materialCostTotal)} 
          />
          <StatItem 
            label="Energia" 
            value={formatCurrency(results.powerCostTotal)} 
          />
          <StatItem 
            label="Tempo Impressora" 
            value={formatCurrency(results.timeCostTotal)} 
          />
        </div>
      </div>
      
      {/* PAINEL DE VENDA E LUCRO */}
      <div className="card-panel text-center">
        <h2 className="card-title">
          <CheckCircle className="icon-small icon-accent" />
          Preço de Venda
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Baseado no Custo Total de {formatCurrency(results.totalCost)} e Markup de {markupPercentage}%, aqui estão as sugestões:
        </p>

        {/* Preço de Venda Sugerido */}
        <div className="mb-4">
          <p className="text-sm text-gray-400">PREÇO DE VENDA SUGERIDO</p>
          <h4 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
            {formatCurrency(results.sellingPrice)}
          </h4>
        </div>

        {/* Lucro Estimado */}
        <div className="mb-6">
          <p className="text-sm text-gray-400">LUCRO ESTIMADO</p>
          <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>
            {formatCurrency(results.profit)}
          </h4>
        </div>

        {/* Botões */}
        <button className="primary-button" onClick={exportToCSV} style={{ marginBottom: '10px' }}>
          Exportar Detalhes
        </button>
        <button className="secondary-button" onClick={() => setCurrentView(VIEWS.INPUT)} style={{ backgroundColor: 'var(--color-bg-medium)' }}>
          Fazer Novo Cálculo
        </button>
      </div>
    </div>
  );

  // Função de renderização principal que decide qual tela mostrar
  const renderCurrentView = () => {
    switch (currentView) {
      case VIEWS.SETTINGS:
        return renderSettingsView();
      case VIEWS.INPUT:
        return renderInputView();
      case VIEWS.RESULTS:
        return renderResultsView();
      default:
        return <div className="card-panel">Erro ao carregar a visualização.</div>;
    }
  };

  return (
    <div className="app-main-container">
      {/* Layout adaptado para visualização em coluna única e centralizada */}
      <div className="main-content-wrapper" style={{ flexDirection: 'column', alignItems: 'center' }}>
        
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent-light)', marginBottom: '30px' }}>
            Calculadora de Custo de Impressão 3D
        </h1>

        {/* Renderiza o conteúdo da tela atual */}
        {renderCurrentView()}

      </div>
    </div>
  );
};

export default App;