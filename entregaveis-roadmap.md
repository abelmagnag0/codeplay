# Plano de Entregas para o CodePlay+

## 1. Estado atual (nov/2025)

- **Backend**: estrutura Express modular pronta (rotas, controllers, services, repositories, models), porém com regras de negócio críticas ausentes (`authService` somente com TODO, ranking com pipeline incompleta, inexistência de camada de submissões, validações e logs mínimos).
- **Frontend**: UI em React + Tailwind pronta visualmente (páginas de login, dashboard, desafios, salas, chat, perfil e admin), mas totalmente com dados mockados e sem integração com API, autenticação real, roteamento ou gerenciamento de estado.
- **Realtime**: Socket.IO conectado, porém apenas listeners de `joinRoom`/`message` sem autenticação, persistência ou integração com salas e ranking.
- **Infra/Qualidade**: sem testes, sem scripts de build/deploy definidos, ausência de exemplos de `.env`, sem pipeline de CI/CD, sem documentação de fluxo operacional.

## 2. Requisitos funcionais x lacunas

| Requisito | Situação atual | Próximos passos |
|-----------|----------------|-----------------|
| RF01 Cadastro e Autenticação | Rotas expostas, mas `authService` não implementado; ausência de validações | Implementar registro/login com hash de senha, refresh token, validação de payload, políticas de sessão e recuperação de senha |
| RF02 Gestão de Usuários (Admin) | Rotas e controllers criados, porém sem integrações reais nem proteção adicional | Exigir role admin, criar listagem paginada, editar/bloquear com auditoria e testes |
| RF03 Desafios | CRUD básico pronto, mas sem submissão/validação nem filtros | Implementar submissões, verificação de resposta, filtros e metadados no front |
| RF04 Ranking Gamificado | Pipeline no repositório com TODO e campos não garantidos | Implementar agregações corretas, cache, endpoints de ranking por períodos |
| RF05 Salas de Estudo | Modelo e endpoints simples; join apenas adiciona ID | Criar limites, remoção ao sair, convite para salas privadas, listagem em tempo real |
| RF06 Chat em Tempo Real | Socket básico sem auth/persistência | Autenticar socket, salvar mensagens, exibir histórico e status online |
| RF07 Compartilhamento de Tela | Nenhuma implementação | Integrar WebRTC (backend sinalizando, frontend com MediaStream) |
| RF08 Painel Administrativo | UI mockada; backend sem endpoints específicos | Entregar CRUD real de desafios/usuários/categorias, logs admin |
| RF09 Perfil do Usuário | Modelo suporta campos, mas UI usa mocks | Carregar dados reais, permitir update com upload de avatar |
| RF10 Interface Responsiva | Layout base responsivo, porém sem testes cross-device | Validar responsividade e acessibilidade, otimizar para mobile |
| RNFs Segurança, Desempenho, Logs | Middleware base pronto (helmet, rate limit, cors) | Add sanitização, auditoria, métricas, monitoramento e runbooks |

## 3. Backlog priorizado por domínio

### 3.1 Backend / API

- Implementar **authService** (registro, login, refresh, logout lógico), hash com bcrypt, revogação e suporte a `refreshToken` persistente.
- Criar camada de **validação** (Joi/Zod) para rotas de auth, usuários, desafios, salas e submissões.
- Adicionar `SubmissionController`, service e repository com fluxo: receber código, validar, registrar resultado, atualizar XP/nível do usuário.
- Ajustar `rankingRepository` para consumir dados verdadeiros (join com `users`, fallback para desafios) e suportar filtros (categoria, período, sala).
- Implementar endpoints de **recuperação de senha** e confirmação de e-mail (opcional, mas recomendado).
- Adicionar políticas de paginação, ordenação e cache (Redis opcional) para listagens grandes (desafios, ranking, mensagens).
- Criar camada de **mensagens** (model `Message`, repository e endpoints para histórico).
- Revisar e ampliar middleware de erros com códigos padronizados e rastreio (logger estruturado).

### 3.2 Banco de dados e modelos

- Criar modelos faltantes (`Message`, `RoomEvent`, `Token`/`Session` se optar por refresh persistente).
- Garantir índices em campos críticos (email, `roomId`, `challengeId`, `userId`).
- Definir seeds para admin inicial e desafios base.
- Mapear migrations/seeding scripts (ex.: `npm run seed`).

### 3.3 Realtime & Mídia

- Autenticar conexões Socket.IO usando JWT e sincronizar com salas do MongoDB.
- Sincronizar eventos (`room:join`, `room:leave`, `room:typing`, `room:message`) com persistência e broadcasts.
- Implementar orquestração WebRTC (backend como broker de sinalização usando Socket.IO) para compartilhamento de tela.
- Adicionar métricas e limites (ex.: número máximo de streams por sala, desconexão forçada).

### 3.4 Frontend (SPA)

- Configurar **React Router** + proteção de rotas, AuthContext/useAuth com tokens e refresh automático.
- Criar cliente HTTP central (Axios ou fetch wrapper) com interceptors e tratamento de erros/toasts.
- Integrar páginas com API: login/registro, dashboard (dados reais), desafios (listagem + modal com submissão), ranking, salas (criação/entrada), chat (mensagens em tempo real), perfil (edição), admin (CRUDs).
- Substituir dados mockados por hooks (React Query/TanStack Query) com cache e estados de loading/empty/error.
- Implementar editor de código (Monaco/Ace) no fluxo de desafios e exibir feedback da submissão.
- Integrar WebRTC na página de chat/sala (start/stop share, seleção de tela, visualização múltipla).
- Aplicar testes de acessibilidade básicos (focus states, aria labels, contraste).

### 3.5 Segurança, Observabilidade e Ops

- Documentar `.env.example` com todas as variáveis (JWT, Mongo, rate limit, CORS, Socket, WebRTC TURN/STUN se aplicável).
- Adicionar logs estruturados (winston/pino) e correlação de requisições.
- Implementar health checks adicionais (ex.: `/health/db`, `/health/socket`).
- Integrar monitoramento (ex.: Prometheus metrics + Grafana, ou Logtail/Datadog) conforme orçamento.
- Definir políticas de backup/restauração do MongoDB.

### 3.6 Qualidade, Testes e CI/CD

- Configurar lint/format (ESLint, Prettier) no backend e frontend.
- Adicionar testes unitários (Jest) para services/repositories e componentes críticos.
- Criar testes de integração (Supertest) para endpoints REST.
- Adotar testes e2e (Playwright/Cypress) para fluxos-chave (login, resolução de desafio, chat).
- Configurar pipeline CI (GitHub Actions) com lint + testes + build.
- Definir estratégia de deploy (Docker Compose ou PM2 para backend, Vite build + CDN para frontend) e documentação de rollout/rollback.

### 3.7 Conteúdo e Experiência

- Definir sistema de XP/níveis (fórmula, badges, progressão mostrada no front).
- Criar copy/UI final para onboarding, notificações e feedbacks (erros, sucesso, loadings).
- Planejar conteúdo inicial de desafios com dificuldade variada e categorias alinhadas ao roadmap.

## 4. Dependências e configurações necessárias

- **Infra mínima**: MongoDB (local ou Atlas), servidor Node >=18, frontend buildado via Vite, serviço de hospedagem (Render/Vercel/Netlify) ou contêiner.
- **Serviços externos**: provedor STUN/TURN para WebRTC, provedor de e-mail (reset de senha), serviço de logs/monitoramento opcional.
- **Pacotes estimados**: bcrypt, jsonwebtoken, celebrate/joi ou zod, socket.io-client, react-query, axios, monaco-editor, testing libs (jest, supertest, testing-library, cypress/playwright).

## 5. Critérios de aceite globais

- Todos os RFs entregues com testes (>=80% cobertura em services e controllers críticos).
- Fluxos principais (cadastro/login, resolver desafio, subir ranking, criar/entrar em sala, chat + compartilhamento) funcionando em ambiente de homologação com dados persistidos.
- Aplicação responsiva e acessível (audit via Lighthouse > 85 em Performance/A11y/Best Practices).
- Documentação atualizada (`README` + este plano + guias de execução e deploy).
- Monitoramento básico ativo (logs centralizados + métricas de saúde) e playbook de incidentes.

> Este documento deve ser revisitado a cada entrega para ajuste do backlog e validação do escopo concluído.
