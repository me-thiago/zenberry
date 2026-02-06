# Use base Node.js image - will be marked as debug via labels
FROM --platform=linux/amd64 node:20-slim AS builder

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema necessárias
RUN apt-get update && apt-get install -y wget gnupg lsb-release && \
    echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list && \
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && \
    apt-get update && apt-get install -y \
        curl \
        git \
        ca-certificates \
        jq \
        sudo \
        postgresql-client-16 \
        openssl \
        pkg-config \
        libssl-dev \
        python3 \
        build-essential    

# Copiar package.json e package-lock.json
COPY package*.json ./

# Copiar arquivos do Prisma
COPY prisma ./prisma/

# Instalar dependências
RUN npm install

# Copiar código-fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção - will be marked as debug via labels
FROM --platform=linux/amd64 node:20-slim

# Instalar dependências do sistema necessárias para produção
RUN apt-get update && apt-get install -y wget gnupg lsb-release && \
    echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list && \
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && \
    apt-get update && apt-get install -y \
        curl \
        git \
        ca-certificates \
        jq \
        sudo \
        postgresql-client-16 \
        openssl \
        pkg-config \
        libssl-dev    

# Definir diretório de trabalho
WORKDIR /app

# Copiar node_modules da fase de build
COPY --from=builder /app/node_modules ./node_modules

# Copiar package.json
COPY --from=builder /app/package*.json ./

# Copiar a aplicação buildada
COPY --from=builder /app/dist ./dist

# Copiar código fonte para auditoria
COPY --from=builder /app/src ./src

# Copiar schema do Prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Start the actual NestJS application
CMD ["npm", "run", "start:prod"]