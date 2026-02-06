# Plano de Migração - 2025-10-29

## Objetivo
Adicionar tabela `product` ao banco de dados para gerenciar produtos do sistema.

---

## Alterações no Schema

### Nova Tabela: `product`

```sql
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "size" TEXT,
    "flavor" TEXT,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "effects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "benefits" TEXT,
    "ingredients" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_userId_idx" ON "product"("userId");

ALTER TABLE "product" ADD CONSTRAINT "product_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### Campos

| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | Não | uuid() | Identificador único |
| name | TEXT | Não | - | Nome do produto |
| image | TEXT | Sim | null | URL da imagem |
| description | TEXT | Sim | null | Descrição detalhada |
| price | DECIMAL(10,2) | Não | - | Preço (até 99999999.99) |
| size | TEXT | Sim | null | Tamanho do produto |
| flavor | TEXT | Sim | null | Sabor do produto |
| categories | TEXT[] | Não | [] | Array de categorias |
| effects | TEXT[] | Não | [] | Array de efeitos |
| benefits | TEXT | Sim | null | Benefícios do produto |
| ingredients | TEXT | Sim | null | Ingredientes do produto |
| userId | TEXT | Não | - | ID do usuário dono |
| createdAt | TIMESTAMP | Não | now() | Data de criação |
| updatedAt | TIMESTAMP | Não | - | Data de atualização |

---

## Relacionamentos

- **Product → User:** Many-to-One
  - Foreign key: `userId` → `user.id`
  - OnDelete: CASCADE (se user for deletado, products também são)

---

## Índices

- Primary key: `id`
- Index: `userId` (para queries rápidas de produtos por usuário)

---

## Riscos

### ✅ Baixo Risco
- Migração é **aditiva** (apenas cria nova tabela)
- Não afeta dados existentes
- Foreign key com CASCADE protege integridade

### ⚠️ Pontos de Atenção
- Arrays (`categories`, `effects`): PostgreSQL suporta nativamente
- Decimal: Prisma mapeia para `Prisma.Decimal` no TypeScript
- TEXT fields para campos longos (description, benefits, ingredients)

---

## Rollback

Se necessário reverter:

```sql
DROP TABLE "product";
```

**Nota:** Rollback apaga todos os produtos cadastrados.

---

## Validação Pós-Migração

Execute estas queries para validar:

```sql
-- Verificar tabela criada
SELECT * FROM information_schema.tables WHERE table_name = 'product';

-- Verificar colunas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'product';

-- Verificar índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'product';

-- Verificar foreign keys
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE conrelid = 'product'::regclass;
```

---

## Como Aplicar

### Ambiente de Desenvolvimento
```bash
# Com DATABASE_URL configurado:
npx prisma migrate dev --name add_product_model

# OU aplicar manualmente:
# Execute o SQL acima diretamente no banco
```

### Ambiente de Produção
```bash
# Via CI/CD:
npx prisma migrate deploy
```

---

## Aprovação

- [ ] Revisado por: ___
- [ ] Testado em desenvolvimento: ___
- [ ] Aplicado em staging: ___
- [ ] Aplicado em produção: ___

---

## Observações

- Schema Prisma atualizado em: `prisma/schema.prisma`
- Model adicionado: `Product`
- Relação adicionada em `User`: `products Product[] @relation("UserProducts")`

---

**Data:** 2025-10-29
**Autor:** Claude
**Status:** Pendente de aplicação
