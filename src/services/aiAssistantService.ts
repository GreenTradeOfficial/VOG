export interface AiChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export async function askAiBibleAssistant(
  message: string,
  history: AiChatMessage[] = []
): Promise<{ reply: string; modelUsed?: string }> {
  const formattedHistory = history.map((h) => ({
    role: h.role,
    content: h.content,
  }));

  const response = await fetch('/api/ai-assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message.trim(),
      history: formattedHistory,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Server responded with status ${response.status}: Failed to get AI response.`
    );
  }

  const data = await response.json();
  return {
    reply: data.reply,
    modelUsed: data.model,
  };
}
