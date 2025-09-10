export interface ChatGPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class ChatGPTService {
  private endpoint = '/.netlify/functions/chatgpt-proxy';

  public async reply(messages: ChatGPTMessage[], opts?: { model?: string; temperature?: number }): Promise<string> {
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model: opts?.model || 'gpt-4o-mini',
        temperature: typeof opts?.temperature === 'number' ? opts.temperature : 0.3,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ChatGPT proxy error: ${text}`);
    }
    const data = await res.json();
    return data.message as string;
  }
}

export const chatGPTService = new ChatGPTService();

