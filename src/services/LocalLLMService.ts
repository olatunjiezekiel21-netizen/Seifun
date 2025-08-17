export class LocalLLMService {
  static async generate(prompt: string, model?: string): Promise<string> {
    const res = await fetch('/.netlify/functions/llm-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model })
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    return data.text as string
  }
}