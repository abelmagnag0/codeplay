# Backend Progress Overview

Atualizado em: 26/11/2025

## 1. Entregas concluídas

### 1.1 Autenticação e sessão
- Registro, login, refresh e logout com rotação de refresh tokens.
- Hash de senha com bcrypt e bloqueio de contas em `status = blocked`.
- Middleware `authMiddleware.ensureAuthenticated` + `ensureAdmin`.
- Testes de integração abrangendo fluxos válidos, inválidos e tokens expirados.

### 1.2 Validações dos payloads
- Middleware de validação com Celebrate/Joi.
- Validadores implementados para `auth`, `submission`, `message`, `room`, `challenge`, `user`, `ranking`.
- Filtros de rota rejeitam IDs inválidos, payloads vazios e combinações inconsistentes (ex.: `minXp > maxXp`, período custom sem datas).

### 1.3 Desafios e submissões
- CRUD completo de desafios (lista, detalhes, create/update/delete) com filtros (categoria, dificuldade, tags, xp, busca, sort, paginação).
- Sanitização de payloads no serviço com trims, arrays normalizados e 404 quando recurso não existe.
- Submissões avaliam resposta, calculam XP, atualizam nível do usuário e registram categoria/room.
- Suporte a submissões vinculadas a salas (validação de participação) e histórico via repositório.
- Testes cobrindo CRUD, filtragem, submissão correta/incorreta, erros de validação e associação com salas.

### 1.4 Ranking
- Ranking global com fallback por XP total e suporte a filtros de período (daily/weekly/monthly/custom) e sala (`roomId`).
- Ranking por categoria com pipeline Aggregation para XP por categoria.
- Formatação padronizada dos resultados (rank, xp, totalXp, última submissão, badges, avatar).
- Testes garantindo exclusão de usuários bloqueados, filtro por categoria, sala e períodos.

### 1.5 Salas e chat

- CRUD/listagem de salas com joins e validação (nome, privacy, ids).
- Persistência de mensagens: envio, histórico, validação de payload e checagem de participação.
- Socket.IO autenticado com JWT (handshake), eventos `room:join`/`message:send` validados.
- Testes HTTP cobrindo envio/listagem de mensagens e restrições de acesso.
- Compartilhamento de tela via Socket.IO com eventos `screen:*`, controle de presenter, viewers e sincronização de estado broadcast para a sala.

### 1.6 Usuários e administração
- Endpoints para perfil (`GET/PATCH /users/me`) com sanitização de nome/bio/avatar.
- Listagem admin com filtros (role, status, busca, sort, paginação) e retorno sem senha.
- Mutação de `role` e `status` com validação e 404 quando usuário não existe.
- Testes cobrindo fluxo feliz, validações, não-admin e casos inválidos.

### 1.7 Observabilidade e resiliência

- Middleware de rate limit configurável via env.
- Logger customizado com Morgan (linha humana) + `requestLogger` propagando `requestId` em headers para rastreio.
- Handler de erros padronizado + respostas de validação agregadas.
- Health check em `/health` retornando uptime.
- `.env.example` documenta variáveis cruciais (JWT, bcrypt, rate limit, e-mail, logging).

### 1.8 Testes automatizados

- Suites Jest + Supertest com Mongo Memory Server:
  - `auth.test.js`, `submission.test.js`, `ranking.test.js`, `message.test.js`, `room.test.js`, `challenge.test.js`, `user.test.js`.
- Cobertura dos fluxos críticos do backend.

### 1.9 Verificação, recuperação e sessões

- Fluxo completo de verificação de e-mail com tokens expiráveis, endpoint de verificação (`POST /api/auth/email/verify`) e reenvio (`POST /api/auth/email/resend`).
- Recuperação de senha via e-mail com geração e consumo de token (`POST /api/auth/password/forgot` + `POST /api/auth/password/reset`).
- Auditoria de sessões com listagem e revogação manual (`GET/DELETE /api/auth/sessions`) e metadados (IP, user-agent, criação/uso).
- Armazenamento seguro das sessões (refresh tokens) com registro de expiração, IP e user-agent.

### 1.10 Documentação de API

- Especificação OpenAPI centralizada em `docs/openapi.yaml` cobrindo módulos principais.
- Swagger UI exposto em `/docs` e `/swagger`, com acesso ao JSON bruto em `/docs/openapi.json`.
- Pacotes `swagger-ui-express` e `yamljs` adicionados ao projeto para manter a documentação interativa.

### 1.11 DevOps & deploy

- Dockerfile multi-stage e `.dockerignore` no backend para builds reproduzíveis.
- `docker-compose.yml` orquestra backend + MongoDB com variáveis pré-configuradas.
- GitHub Actions (`.github/workflows/backend-ci.yml`) executa lint e testes do backend em pushes/PRs.

## 2. Itens em andamento / pendentes

### 2.1 Autenticação & segurança

- Endurecer armazenamento dos tokens no cliente (cookies httpOnly + CSRF tokens).
- Suporte a MFA / fatores adicionais (planejamento).

### 2.2 Salas e realtime

- Eventos adicionais: typing indicator, read receipts, presença.
- Extensões WebRTC (áudio/vídeo, controles de mute) sobre o canal já existente de compartilhamento de tela.
- Métricas de socket (conexões ativas, emissão com limites).

### 2.3 Conteúdo e gamificação

- Sistema de badges e progressão com regras claras + persistência.
- Seed scripts para desafios iniciais, usuários admin e salas demo.
- Configuração de XP dinâmica por desafio/categoria.

### 2.4 Observabilidade & DevOps

- Logs centralizados (ex.: integração com Logtail/Datadog) e monitoramento de métricas.
- Pipeline CI/CD (GitHub Actions) com lint + testes + build.
- Plano de backup/restauração do banco.

### 2.5 Documentação & suporte

- Playbook de incidentes, métricas de SLA e runbooks básicos.
- Guia de execução local e deploy consolidado.

## 3. Pronto para integrar com o frontend

Os módulos abaixo têm rotas estáveis, payloads validados e respostas prontas para consumo.

| Módulo | Endpoints principais | Observações de integração |
|--------|---------------------|---------------------------|
| Autenticação | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout` | Fluxo com tokens JWT + refresh. Enviar header `Authorization: Bearer <accessToken>`. Refresh aceita `{ token }`. |
| Perfil | `GET /api/users/me`, `PATCH /api/users/me` | Campos aceitos no PATCH: `name`, `avatar`, `bio`. Resposta sanitizada sem senha. |
| Salas | `GET /api/rooms`, `POST /api/rooms`, `GET /api/rooms/:id`, `POST /api/rooms/:id/join` | Rotas autenticadas. Para listagem, filtros opcionais já prontos. Detalhe e join retornam `screenShare` com `isActive`, `ownerUserId`, `viewers`. |
| Mensagens | `GET /api/rooms/:id/messages`, `POST /api/rooms/:id/messages` | Necessário permissão na sala. Payload de envio `{ content }`. Resposta traz autor, timestamps. |
| Submissões | `POST /api/submissions` | Payload `{ challengeId, code, language?, roomId? }`. Retorno inclui resultado e XP concedido. |
| Ranking | `GET /api/ranking`, `GET /api/ranking/category/:category` | Filtros via query (`period`, `roomId`, `limit`). Resposta já inclui `rank`, `xp`, `name`, `avatar`. |
| Desafios | `GET /api/challenges`, `GET /api/challenges/:id` | Filtros: `category`, `difficulty`, `tags`, `minXp`, `maxXp`, `search`, `limit`, `offset`, `sort`. |
| Admin (role necessário) | `GET /api/users`, `PATCH /api/users/:id/role`, `PATCH /api/users/:id/status`, `POST/PUT/DELETE /api/challenges` | Exibir nos painéis administrativos com aviso para checar o header JWT com role `admin`. |
| Health Check | `GET /health` | Pode ser usado em monitoramento frontend (se necessário). |

## 4. Requisitos adicionais para integração

- Configurar em produção os headers de CORS (`CLIENT_ORIGIN`) para o domínio do frontend.
- Garantir que o frontend armazene `accessToken` em memória (context) e `refreshToken` em storage seguro (httpOnly cookie é recomendado em iteração futura).
- Para Socket.IO, enviar `Authorization` no handshake: `io('/', { auth: { token: accessToken } })`.
- Para compartilhamento de tela, disparar `screen:availability` ao iniciar/encerrar, usar `screen:offer/answer/ice-candidate` para a negociação WebRTC e acompanhar `screen:state` para sincronizar UI.
- Padronização de erros: backend retorna `{ message, details? }`. Frontend deve renderizar mensagens amigáveis.

## 5. Próximos passos sugeridos

1. Integrar o frontend com os eventos de compartilhamento de tela e validar fluxo ponta a ponta (permissões, fallback, UX).
2. Evoluir realtime com indicadores de digitação/presença e reforço de WebRTC (áudio/vídeo) se necessário.
3. Revisitar observabilidade (logs centralizados, métricas) e automação (CI/CD, backups) após estabilizar o MVP.

