# TASK-001: Criar Modulo de Products

## Metadados
- **ID:** TASK-001
- **Tipo:** Task
- **Status:** todo
- **Autor:** Claude
- **Data:** 2025-10-29

---

## Contexto

O sistema precisa de um módulo completo para gerenciar produtos (Products). Este módulo permitirá criar, listar, atualizar e deletar produtos com informações detalhadas incluindo nome, imagem, descrição, preço, tamanho, sabor, categorias, efeitos, benefícios e ingredientes.

---

## Objetivo

Criar um módulo completo de Products seguindo o padrão arquitetural já estabelecido no sistema (similar ao módulo Users), incluindo:
- Model no Prisma
- DTOs de criação, atualização e resposta
- Service com lógica de negócio
- Controller com rotas REST
- Validação de dados
- Documentação Swagger
- Tratamento de erros
- Validação de ownership

---

## Criterios de Aceite

1. **Schema Prisma:**
   - Model `Product` criado com todos os campos necessários
   - Relacionamento com User (owner)
   - Campos: name, image, description, price, size, flavor, categories (array), effects (array), benefits, ingredients

2. **DTOs:**
   - `CreateProductDto` com validações completas
   - `UpdateProductDto` com campos opcionais
   - `ProductResponseDto` para respostas padronizadas
   - `QueryProductDto` para paginação e filtros

3. **Service:**
   - CRUD completo (create, findAll, findOne, update, delete)
   - Validação de ownership
   - Paginação com take/skip
   - Tratamento de erros adequado

4. **Controller:**
   - Rotas REST padrão (GET, POST, PATCH, DELETE)
   - Proteção com `GoogleJwtGuard`
   - Documentação Swagger completa
   - Status codes HTTP corretos

5. **Qualidade:**
   - Código seguindo padrões do CLAUDE.md
   - Documentação JSDoc nos métodos
   - Logs debug estratégicos
   - Validação com class-validator

---

## Plano de Implementacao

### Passo 1: Criar Model no Prisma
- Adicionar model `Product` no `schema.prisma`
- Campos: id, name, image, description, price, size, flavor, categories, effects, benefits, ingredients
- Relacionamento com User (userId + relação)
- Gerar migração com `--create-only`
- Documentar plano de migração

### Passo 2: Criar DTOs
- `dto/create-product.dto.ts` - DTO de criação com validações
- `dto/update-product.dto.ts` - DTO de atualização (campos opcionais)
- `dto/product-response.dto.ts` - DTO de resposta
- `dto/query-product.dto.ts` - DTO para paginação/filtros

### Passo 3: Criar Service
- `services/products.service.ts`
- Métodos: create, findAll, findOne, update, delete
- Validação de ownership
- Paginação
- Tratamento de erros

### Passo 4: Criar Controller
- `controllers/products.controller.ts`
- Rotas REST completas
- Guards de autenticação
- Documentação Swagger
- Validação de payloads

### Passo 5: Criar Module
- `products.module.ts`
- Importar PrismaModule
- Declarar providers e controllers
- Exportar service

### Passo 6: Registrar no App Module
- Adicionar ProductsModule no `app.module.ts`

### Passo 7: Testes Manuais
- Testar via Swagger UI
- Validar todas as rotas
- Verificar validações
- Confirmar ownership

---

## Mudancas no Banco de Dados

### Nova Tabela: `product`

```prisma
model Product {
  id           String   @id @default(uuid())
  name         String
  image        String?
  description  String?  @db.Text
  price        Decimal  @db.Decimal(10, 2)
  size         String?
  flavor       String?
  categories   String[] @default([])
  effects      String[] @default([])
  benefits     String?  @db.Text
  ingredients  String?  @db.Text
  userId       String
  user         User     @relation("UserProducts", fields: [userId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("product")
}
```

**Adição no Model User:**
- Relação `products Product[] @relation("UserProducts")`

**Migração:**
- Será gerada com `--create-only`
- Documentada antes de aplicar

---

## Riscos

1. **Baixo:** Migração é aditiva (não quebra dados existentes)
2. **Baixo:** Arrays podem ter problemas de validação (mitigado com class-validator)
3. **Médio:** Decimal para preço precisa de tratamento correto

---

## Dependencias

- Nenhuma dependência externa
- Sistema já possui estrutura base

---

## Estimativa

- **Tempo:** 2-3 horas
- **Complexidade:** Média

---

## Observacoes

- Seguir padrão arquitetural do módulo Users
- Arrays (categories, effects) serão validados com `@IsArray()` e `@IsString({ each: true })`
- Decimal para price será tratado com Prisma Decimal type
- Ownership validation em todas operações sensíveis

---

**Status:** `done`
**Ultima atualizacao:** 2025-10-29
