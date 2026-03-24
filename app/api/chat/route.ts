import { NextRequest } from "next/server";

export const runtime = "edge";

// ---------------------------------------------------------------------------
// Mock streamer — used when OPENAI_API_KEY is not set
// ---------------------------------------------------------------------------
function mockStream(): ReadableStream<Uint8Array> {
  const responses = [
    `That's an interesting question! Here's what I think:\n\nThe concept you're describing is quite nuanced. Let me break it down:\n\n1. **First point** — This is foundational to understanding the topic at hand.\n2. **Second point** — Building on that, we can see how the pieces fit together.\n3. **Third point** — Finally, this ties everything together into a cohesive whole.\n\nDoes that help clarify things? Feel free to ask for more detail on any point.`,
    `Sure! I can help with that. Here's a quick example:\n\n\`\`\`typescript\nfunction greet(name: string): string {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet("World")); // Hello, World!\n\`\`\`\n\nThis demonstrates the core concept cleanly. Let me know if you'd like me to expand on this.`,
    `Great question. The short answer is: **it depends on your use case**.\n\nFor most applications, a simple approach works well. But as scale increases, you'll want to consider:\n\n- Performance implications at 10x, 100x scale\n- Memory usage patterns over time\n- The tradeoff between simplicity and optimization\n\nIn this specific case, virtualization is the right call — you're rendering only what's visible, which keeps frame rates smooth even with thousands of messages.`,
    `I understand what you mean. Let me think through this carefully.\n\nThe key insight here is that **UI virtualization** solves a real problem: the DOM has limits. When you render thousands of nodes, the browser struggles. But with a virtualizer like \`@tanstack/react-virtual\`, you only mount the visible items plus a small overscan buffer.\n\nThis prototype demonstrates exactly that — try sending 100+ messages and notice how smooth it stays!`,
  ];

  const text = responses[Math.floor(Math.random() * responses.length)];
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      // Simulate token-by-token streaming
      const words = text.split("");
      for (const char of words) {
        const chunk = {
          id: `chatcmpl-mock-${Date.now()}`,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1000),
          model: "gpt-4o",
          choices: [
            {
              index: 0,
              delta: { content: char },
              finish_reason: null,
            },
          ],
        };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
        );
        // Small delay to simulate streaming (10–20ms per token feels realistic)
        await new Promise((r) => setTimeout(r, 12));
      }
      // Final done signal
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}

// ---------------------------------------------------------------------------
// POST /api/chat
// Request body: { messages: { role: string; content: string }[] }
// Response: text/event-stream  (OpenAI SSE format)
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;

  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };

  // ── No API key → use mock ──────────────────────────────────────────────
  if (!apiKey) {
    return new Response(mockStream(), { headers });
  }

  // ── Real OpenAI streaming ──────────────────────────────────────────────
  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      stream: true,
    }),
  });

  if (!upstream.ok) {
    const err = await upstream.text();
    return new Response(
      JSON.stringify({ error: err }),
      { status: upstream.status, headers: { "Content-Type": "application/json" } }
    );
  }

  // Pass the upstream SSE body straight through
  return new Response(upstream.body, { headers });
}
