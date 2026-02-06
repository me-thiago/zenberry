/**
 * Chat API Route - Stream endpoint
 * 
 * IMPORTANTE: Esta rota é necessária como proxy para Server-Sent Events (SSE).
 * 
 * Por que manter este proxy?
 * - EventSource (SSE) no browser tem limitações com CORS
 * - Next.js pode fazer stream transformation do backend para o cliente
 * - Permite adicionar lógica server-side no futuro (auth, logging, etc)
 */

import { NextRequest } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const question = searchParams.get("question");
  const historyParam = searchParams.get("history");

  if (!question) {
    return new Response("Question is required", { status: 400 });
  }

  try {
    const history = historyParam ? JSON.parse(historyParam) : [];

    const response = await fetch(`${API_BASE_URL}/v1/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        history,
      }),
    });

    if (!response.ok) {
      return new Response("Failed to connect to chat service", {
        status: response.status,
      });
    }

    // Create a readable stream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              // Send completion signal
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              break;
            }

            // Forward chunks to client
            const chunk = new TextDecoder().decode(value);
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Stream API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
