# Zenberry Frontend

E-commerce moderno para produtos de CBD e THC desenvolvido com Next.js 16+, TypeScript e Tailwind CSS.

## 🚀 Getting Started

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- API NestJS rodando em `localhost:8080` (para o chatbot e login)

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Rodar em desenvolvimento
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🤖 Chatbot Integration

Este projeto inclui uma integração completa com chatbot AI usando Google Gemini.

### 📚 Documentação do Chatbot

Para documentação completa do chatbot, consulte:

- **[INDEX.md](./INDEX.md)** - Índice de toda documentação
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Resumo da implementação
- **[CHATBOT_README.md](./CHATBOT_README.md)** - Documentação principal
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Guia de testes
- **[DEV_COMMANDS.md](./DEV_COMMANDS.md)** - Comandos úteis
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitetura técnica

### ⚡ Quick Start - Chatbot

```bash
# 1. Configure a API URL
# .env.local
CHAT_API_URL=http://localhost:8080/chat
NEXT_PUBLIC_CHAT_API_URL=http://localhost:8080/chat

# 2. Inicie a aplicação
npm run dev

# 3. Clique no botão "Ask Your Questions" no canto inferior esquerdo
```

### 🎯 Features do Chatbot

- ✅ Chat em tempo real com IA
- ✅ Suporte a streaming (SSE)
- ✅ Renderização de Markdown
- ✅ Rate limiting inteligente
- ✅ Persistência em localStorage
- ✅ Validação e sanitização de input
- ✅ Design responsivo
- ✅ Tratamento robusto de erros

### 📝 Exemplo de Uso

```typescript
import { useChat } from "@/src/hooks/use-chat";

function MyComponent() {
  const { messages, sendMessage, isLoading } = useChat();

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <button onClick={() => sendMessage("Olá!")}>
        Enviar
      </button>
    </div>
  );
}
```

Para mais exemplos, veja [src/examples/chat-examples.tsx](./src/examples/chat-examples.tsx)

---

## 🏗️ Project Structure

```
zenberry-front/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   │   └── chat/       # Chatbot endpoints
│   │   └── ...             # Pages
│   ├── components/         # React components
│   │   ├── chatbot/       # Chatbot components
│   │   ├── ui/            # UI components (shadcn)
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   │   ├── use-chat.ts
│   │   └── use-chat-stream.ts
│   ├── services/          # API services
│   ├── contexts/          # React contexts
│   ├── types/             # TypeScript types
│   └── lib/               # Utilities
├── public/                # Static assets
└── ...
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **State Management:** React Context + Hooks
- **Data Fetching:** Axios + TanStack Query
- **Forms:** React Hook Form + Zod
- **Markdown:** react-markdown + remark-gfm
- **Icons:** Lucide React

---

## 📦 Available Scripts

```bash
# Desenvolvimento
npm run dev          # Inicia dev server (localhost:3000)

# Produção
npm run build        # Build para produção
npm run start        # Inicia servidor de produção

# Qualidade
npm run lint         # Executa ESLint
```

---

## 🧪 Testing

Para testar o chatbot:

```bash
# Health check
curl http://localhost:3000/api/chat/health

# Enviar mensagem
curl -X POST http://localhost:3000/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Teste","history":[]}'
```

Para testes completos, consulte [TESTING_GUIDE.md](./TESTING_GUIDE.md)

---

## 🔐 Environment Variables

Crie um arquivo `.env.local` baseado em `.env.example`:

```env
# Chat API
CHAT_API_URL=http://localhost:8080/chat
NEXT_PUBLIC_CHAT_API_URL=http://localhost:8080/chat

# Outras variáveis...
```

---

## 📖 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

---

## 🚀 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 📞 Support

Para suporte e documentação detalhada:

- Chatbot: Consulte [INDEX.md](./INDEX.md)
- Issues: GitHub Issues
- Documentação: Arquivos `.md` na raiz do projeto

---

**Desenvolvido para Zenberry** 🍃
