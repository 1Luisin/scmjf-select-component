# SCMJF Select Component

Componente React reutilizavel com o design de select usado nas aplicacoes da
Santa Casa. O pacote entrega a logica do select, busca interna, suporte a
formularios, estado disabled/required e o CSS isolado do visual.

## Instalacao

```bash
npm install github:1Luisin/scmjf-select-component
```

## Uso

Importe o componente e o CSS uma vez na aplicacao:

```jsx
import { useState } from "react";
import ScmjfSelect from "@scmjf/select-component";
import "@scmjf/select-component/styles.css";

export default function Exemplo() {
  const [setor, setSetor] = useState("");

  return (
    <ScmjfSelect
      name="setor"
      value={setor}
      onChange={(event) => setSetor(event.target.value)}
      required
    >
      <option value="">Selecione o setor</option>
      <option value="1">Internacao</option>
      <option value="2">Ambulatorio</option>
    </ScmjfSelect>
  );
}
```

Tambem pode receber `options`:

```jsx
<ScmjfSelect
  value={medico}
  onChange={(event) => setMedico(event.target.value)}
  options={[
    { value: "", label: "Selecione o medico" },
    { value: "CRM001", label: "Dra. Maria" },
    { value: "CRM002", label: "Dr. Joao", disabled: true }
  ]}
/>
```

## Props principais

- `value`: valor selecionado.
- `onChange`: recebe um evento compativel com select nativo em `event.target.value`.
- `name`: nome usado no campo oculto para formularios.
- `required`: ativa validacao HTML do formulario.
- `disabled`: bloqueia interacao.
- `placeholder`: texto exibido quando nao ha valor selecionado.
- `searchable`: controla a busca interna. Padrao: `true`.
- `searchPlaceholder`: placeholder do campo de busca.
- `emptyMessage`: mensagem quando nao houver resultados.
- `options`: lista de opcoes no formato `{ value, label, disabled }`.
- `children`: tambem aceita `<option>` como um select nativo.

## Tema escuro

O CSS ja reconhece qualquer uma destas formas:

```html
<body class="theme-dark">
<main class="theme-dark">
<main data-theme="dark">
```

## Personalizacao

O design usa variaveis CSS no wrapper `.scmjf-select`. Para ajustar uma
aplicacao especifica sem alterar o pacote:

```css
.minha-tela .scmjf-select {
  --scmjf-select-accent: #b00020;
  --scmjf-select-accent-strong: #7f1d2d;
}
```
