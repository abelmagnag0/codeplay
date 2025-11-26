# CodePlay+ — Documentação do Projeto

## 📌 Visão Geral

O **CodePlay+** é uma plataforma gamificada para ensino de programação, combinando desafios práticos, ranking, salas de estudo colaborativas e chat em tempo real. O objetivo é promover aprendizado ativo, social e divertido entre estudantes e desenvolvedores iniciantes.

A aplicação será construída como um **monólito** utilizando:

* **Backend:** Node.js + Express
* **Frontend:** React.js
* **Banco de Dados:** MongoDB
* **Renderização inicial do front:** SPA em React consumindo API REST

---

## 🎯 Objetivos do Projeto

* Criar uma plataforma centralizada de aprendizado de programação.
* Unir gamificação, prática e colaboração em tempo real.
* Reduzir barreiras de entrada no estudo de TI por meio de experiências imersivas.

---

# 🧩 Requisitos Funcionais (RF)

## **RF01 — Cadastro e Autenticação**

* O usuário deve poder criar uma conta com e-mail e senha.
* O usuário deve poder fazer login.
* O sistema deve manter sessões ativas com tokens JWT.
* O usuário deve poder alterar sua senha.

## **RF02 — Gestão de Usuários (Admin)**

* Administradores podem listar usuários.
* Administradores podem editar permissões e bloquear contas.

## **RF03 — Desafios/Questões de Programação**

* O sistema deve exibir lista de desafios com filtros (nível, linguagem, categoria).
* O usuário deve poder abrir o desafio e visualizar conteúdo.
* O usuário deve submeter uma resposta (texto/código).
* O sistema deve validar a resposta (validação manual ou futura IA).
* Usuários ganham XP ao acertar desafios.

## **RF04 — Ranking Gamificado**

* Deve existir ranking geral.
* Deve existir ranking por linguagem/categoria.
* Deve mostrar XP total, nível do usuário e posição.

## **RF05 — Salas de Estudo**

* Usuários podem criar salas (públicas ou privadas).
* Usuários podem entrar em salas disponíveis.
* O sistema deve mostrar número de participantes conectados.

## **RF06 — Chat em Tempo Real**

* Cada sala terá um chat em tempo real via WebSocket.
* Usuários podem enviar mensagens de texto.
* O chat deve mostrar quem está online.

## **RF07 — Compartilhamento de Tela (WebRTC)**

* Dentro das salas, o usuário pode compartilhar a tela.
* Outros usuários da sala devem visualizar a transmissão.

## **RF08 — Painel Administrativo (CRUD)**

* Administradores podem:

  * Criar desafios.
  * Editar desafios.
  * Excluir desafios.
  * Gerenciar categorias.
  * Gerenciar usuários.
  * Acessar logs básicos.

## **RF09 — Perfil do Usuário**

* Mostrar informações: avatar, XP, nível, badges, ranking.
* Permitir alterar nome, avatar e biografia.

## **RF10 — Interface Responsiva**

* A plataforma deve funcionar em desktop, tablet e mobile.

---

# ⚙️ Requisitos Não Funcionais (RNF)

## **RNF01 — Arquitetura**

* O sistema será um **monólito** com Backend em **Express** e Frontend em **React**.
* API REST em JSON.
* WebSocket (Socket.IO ou WebSocket nativo) para chat.
* WebRTC para compartilhamento de tela.

## **RNF02 — Desempenho**

* O tempo de resposta para requests REST deve ser inferior a **2 segundos**.
* O chat deve ter latência inferior a **200ms**.

## **RNF03 — Segurança**

* Criptografia de senha usando bcrypt.
* JWT para autenticação.
* Rate limiting básico.
* Sanitização de inputs.

## **RNF04 — Banco de Dados**

* MongoDB hospedado localmente ou em Mongo Atlas.
* Coleções:

  * users
  * challenges
  * submissions
  * rooms
  * messages
  * rankings

## **RNF05 — Escalabilidade**

* O monólito deve permitir futura migração para microserviços.
* Estrutura modular organizada em camadas:

  * controllers
  * services
  * repositories
  * models

## **RNF06 — Compatibilidade**

* Navegadores modernos: Chrome, Edge, Firefox.
* Mobile: Android/iOS via web.

## **RNF07 — Logs e Monitoramento**

* Logging básico de requisições.
* Logs de erros em arquivo separado.

---

# 🧬 Arquitetura Geral do Sistema

## **Backend (Express)**

* `/auth` → login, registro, refresh token
* `/users` → CRUD de usuários (admin)
* `/challenges` → CRUD e listagem
* `/submissions` → envio e validação
* `/ranking` → ranking global e por categoria
* `/rooms` → criação/listagem/entrada
* `/messages` (WebSocket) → chat

### Pastas sugeridas:

```
/backend
  /src
    /config
    /controllers
    /services
    /repositories
    /models
    /routes
    /middleware
    /utils
    server.js
```

---

# 🎨 Frontend (React)

## Estrutura recomendada:

```
/frontend
  /src
    /pages
      Login.jsx
      Dashboard.jsx
      Challenges.jsx
      Ranking.jsx
      Rooms.jsx
      ChatRoom.jsx
      AdminPanel.jsx
    /components
    /contexts
    /hooks
    /services (API)
    /styles
```

---

# 🗄️ Modelo de Dados (MongoDB)

## **Users**

```json
{
  "_id": "",
  "name": "",
  "email": "",
  "password": "",
  "xp": 0,
  "level": 1,
  "badges": [],
  "role": "user" | "admin",
  "createdAt": "",
  "updatedAt": ""
}
```

## **Challenges**

```json
{
  "_id": "",
  "title": "",
  "description": "",
  "difficulty": "easy | medium | hard",
  "category": "javascript | python | ...",
  "xp": 100,
  "createdAt": ""
}
```

## **Submissions**

```json
{
  "_id": "",
  "userId": "",
  "challengeId": "",
  "code": "",
  "isCorrect": true,
  "createdAt": ""
}
```

## **Rooms**

```json
{
  "_id": "",
  "name": "",
  "isPrivate": false,
  "ownerId": "",
  "participants": [],
  "createdAt": ""
}
```

## **Messages**

```json
{
  "_id": "",
  "roomId": "",
  "userId": "",
  "content": "",
  "timestamp": ""
}
```

---

# 🛠️ Tecnologias Principais

* Node.js
* Express
* React
* Vite ou CRA
* MongoDB + Mongoose
* Socket.IO
* WebRTC
* JWT
* bcrypt

---

# 🚀 Roadmap Inicial

1. Configurar monólito (backend+frontend integrados).
2. Criar sistema de autenticação.
3. Criar CRUD de desafios.
4. Implementar ranking.
5. Criar salas e chat com WebSocket.
6. Integrar WebRTC.
7. Criar painel administrativo.
8. Revisar UI/UX final.

---

# ✔️ Conclusão

Este documento consolida toda a estrutura inicial do **CodePlay+**, incluindo requisitos, arquitetura, modelos de dados e tecnologias. Ele serve como base oficial para iniciar o desenvolvimento do projeto.
