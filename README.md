# 3D Calculator

Calculadora interativa para estimativa de custos de impressão 3D com interface intuitiva em React.

## Funcionalidades

- **Configuração de Parâmetros**: Define custos de material, energia, taxa horária e potência da impressora
- **Cálculo de Custos**: Calcula automaticamente custos de produção (material, energia, tempo)
- **Markup Dinâmico**: Aplica percentual de lucro configurável ao preço final
- **Exportação CSV**: Exporta resultados detalhados para análise em planilhas

## Tecnologias

- React 19
- Vite
- CSS Personalizado
- Lucide React (ícones)

## Instalação

```bash
cd 3d-project-master
npm install
```

## Desenvolvimento

```bash
npm run dev    # Inicia servidor de desenvolvimento
npm run build  # Constrói para produção
npm run lint   # Verifica código com ESLint
```

## Como Usar

1. Configure os parâmetros padrão (material, energia, taxa horária, potência)
2. Insira dados da impressão (duração e peso do filamento)
3. Visualize custos, preço sugerido e lucro estimado
4. Exporte os detalhes em CSV
