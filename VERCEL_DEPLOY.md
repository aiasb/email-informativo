# Guia de Implantação (Deploy) na Vercel

Parabéns! O seu editor de comunicados **TI Informa** foi totalmente convertido em uma aplicação **React + Vite** moderna e modular. 

A maior vantagem desta conversão é que a **Vercel fará todo o trabalho pesado de build na nuvem**. Você não precisa ter o Node.js instalado localmente no seu computador para colocar o seu site no ar!

Abaixo, encontram-se os dois métodos mais fáceis para realizar o deploy da sua aplicação.

---

## Método 1: Integração com Git / GitHub (Recomendado & Automático)

Este é o método preferido. Toda vez que você fizer uma alteração no seu código e enviar para o Git, a Vercel atualizará o seu site de forma 100% automática.

1. **Crie um repositório no GitHub** (ou GitLab / Bitbucket) com o nome de sua preferência (ex: `ti-informa-editor`).
2. **Envie os arquivos locais para o Git**:
   Abra o terminal (PowerShell/CMD) na pasta do projeto `f:\Projetos\inventario-ti` e execute:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: React migration"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```
3. **Vincule na Vercel**:
   * Acesse o painel da [Vercel](https://vercel.com/) e faça login.
   * Clique em **"Add New..."** → **"Project"**.
   * Importe o repositório Git que você acabou de criar.
   * A Vercel detectará automaticamente as configurações do **Vite**.
   * Clique em **"Deploy"**.

Pronto! Em menos de 1 minuto o seu site estará publicado em um link público seguro (ex: `https://seu-projeto.vercel.app`).

---

## Método 2: Usando a CLI da Vercel (Sem Git)

Se você preferir implantar diretamente do seu computador sem criar um repositório no GitHub:

1. Baixe e instale a Vercel CLI ou rode via `npx` (caso tenha o Node.js e NPM instalados no seu computador futuramente):
   ```bash
   npm install -g vercel
   ```
2. Na pasta do projeto, execute o comando de deploy:
   ```bash
   vercel
   ```
3. Siga as instruções rápidas na tela (digite `y` para confirmar, faça login no navegador se solicitado e selecione as opções padrão).
4. O seu projeto será enviado e publicado imediatamente. Para mandar uma atualização no futuro, execute:
   ```bash
   vercel --prod
   ```

---

## Dica: Executando o Projeto Localmente

Se você quiser rodar o ambiente de desenvolvimento local na sua máquina antes de publicar na nuvem, você precisará instalar o **Node.js** (recomenda-se a versão LTS mais recente):

1. Acesse [nodejs.org](https://nodejs.org/) e baixe o instalador para Windows.
2. Siga o assistente de instalação padrão e reinicie o seu editor de código / terminal.
3. Abra a pasta do projeto no terminal e execute:
   ```bash
   # Instalar dependências locais
   npm install

   # Iniciar servidor de desenvolvimento local
   npm run dev
   ```
4. O projeto abrirá automaticamente no seu navegador no endereço: `http://localhost:3000`.

---

## Estrutura do Novo Projeto React

O seu projeto agora está organizado da seguinte forma:
* [package.json](file:///f:/Projetos/inventario-ti/package.json): Gerenciador de pacotes e scripts de build.
* [vite.config.js](file:///f:/Projetos/inventario-ti/vite.config.js): Configurações de empacotamento do Vite.
* [vercel.json](file:///f:/Projetos/inventario-ti/vercel.json): Configuração de rotas amigáveis para SPA da Vercel.
* [index.html](file:///f:/Projetos/inventario-ti/index.html): Estrutura HTML principal.
* `src/`:
  * [main.jsx](file:///f:/Projetos/inventario-ti/src/main.jsx): Ponto de partida do React.
  * [App.jsx](file:///f:/Projetos/inventario-ti/src/App.jsx): Controlador de estados e renderizador principal do layout.
  * [index.css](file:///f:/Projetos/inventario-ti/src/index.css): Estilos Vanilla CSS unificados do editor original.
  * `assets/`:
    * [default_logo.js](file:///f:/Projetos/inventario-ti/src/assets/default_logo.js): O logotipo original extraído e exportado como constante base64.
  * `components/`:
    * [Toolbar.jsx](file:///f:/Projetos/inventario-ti/src/components/Toolbar.jsx): Barra superior de formatação rica e arquivos.
    * [CalendarModal.jsx](file:///f:/Projetos/inventario-ti/src/components/CalendarModal.jsx): Calendário interativo em português.
    * [IconPickerModal.jsx](file:///f:/Projetos/inventario-ti/src/components/IconPickerModal.jsx): Seletor categorizado e pesquisável de ícones.
    * [InfoCard.jsx](file:///f:/Projetos/inventario-ti/src/components/InfoCard.jsx): Cartões informativos centrais.
    * [AlertCard.jsx](file:///f:/Projetos/inventario-ti/src/components/AlertCard.jsx): Cartão verde inferior de alerta.
