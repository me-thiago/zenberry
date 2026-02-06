# IMPL-XXX: [Titulo da Implementacao]

**Task/Bug:** TASK-XXX / BUG-XXX
**Autor:** [Seu nome]
**Data:** YYYY-MM-DD
**PR:** [Link para o PR]

---

## Resumo

[Resumo executivo da implementacao. O que foi feito e por que?]

---

## Decisoes de Design

### Decisao 1: [Nome da decisao]
- **Contexto:** [Por que essa decisao foi necessaria]
- **Opcoes consideradas:**
  1. Opcao A - [Pros/Contras]
  2. Opcao B - [Pros/Contras]
- **Decisao:** [Opcao escolhida e justificativa]

### Decisao 2: [Nome da decisao]
- **Contexto:** [...]
- **Opcoes consideradas:** [...]
- **Decisao:** [...]

---

## Arquitetura

[Descreva a arquitetura da solucao. Use diagramas se necessario.]

### Estrutura de Arquivos

```
src/
├── modules/
│   └── [modulo]/
│       ├── [modulo].module.ts
│       ├── [modulo].controller.ts
│       ├── [modulo].service.ts
│       └── dtos/
│           ├── create-[recurso].dto.ts
│           └── update-[recurso].dto.ts
```

---

## Endpoints Implementados

### 1. Criar Recurso
- **Metodo:** `POST`
- **Endpoint:** `/api/resource`
- **Autenticacao:** JWT
- **Autorizacao:** Usuario autenticado

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "createdAt": "2025-10-22T10:00:00Z",
  "updatedAt": "2025-10-22T10:00:00Z"
}
```

**Erros:**
- `400 Bad Request` - Validacao falhou
- `401 Unauthorized` - Token invalido
- `422 Unprocessable Entity` - Regra de negocio violada

### 2. Buscar Recurso
[...]

---

## Mudancas no Banco de Dados

### Migrations Aplicadas
- `20251022100000_add_field_to_resource` - Adiciona campo `instructions` a tabela `Resource`

### Schema Changes
```prisma
model Resource {
  id           String   @id @default(uuid())
  name         String
  description  String?
  instructions String?  @db.Text  // Novo campo
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

---

## Testes

### Testes Unitarios
- testCreateResourceSuccessfully
- testCreateResourceThrowsBadRequestWhenInvalidData
- testFindResourceThrowsNotFoundWhenDoesNotExist
- testUpdateResourceThrowsForbiddenWhenUserIsNotOwner

### Testes E2E
- POST /api/resource - Cria recurso com sucesso
- GET /api/resource/:id - Busca recurso com sucesso
- PATCH /api/resource/:id - Atualiza recurso com sucesso
- DELETE /api/resource/:id - Deleta recurso com sucesso

---

## Documentacao

- [x] Swagger atualizado
- [x] README.md atualizado (se aplicavel)
- [x] CLAUDE.md atualizado (se novas regras)

---

## Breaking Changes

[Liste qualquer breaking change introduzido. Se nenhum, escreva "Nenhum"]

---

## Rollback Plan

[Descreva como fazer rollback desta implementacao se necessario]

1. Reverter PR [link]
2. Executar migracao de rollback (se aplicavel)
3. Reiniciar servico

---

## Metricas e Monitoramento

[Descreva como monitorar esta implementacao em producao]

- **Logs:** Buscar por `[ResourceService]` nos logs
- **Metricas:** [Se houver metricas especificas]
- **Alertas:** [Se houver alertas configurados]

---

## Licoes Aprendidas

[O que foi aprendido durante a implementacao? O que faria diferente?]

---

## Links Relacionados

- **Task:** `docs/task/TASK-XXX-[slug].md`
- **PR:** [Link]
- **Swagger:** `http://localhost:3000/api-docs`

---

## Notas Adicionais

[Qualquer nota adicional importante]
