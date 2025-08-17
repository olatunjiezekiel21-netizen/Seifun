export type ChatMessageType = 'user' | 'assistant'

export class ChatMemoryService {
	static getUserId(): string {
		// Prefer Supabase UID if available, then wallet address, else anon id
		try {
			const supabaseUid = (window as any)?.supabaseUser?.id || localStorage.getItem('supabase_uid')
			if (supabaseUid) return supabaseUid
			const addr = (window as any)?.ethereumAddress || localStorage.getItem('seifu_wallet_address')
			if (addr) return addr
			let id = localStorage.getItem('seilor_user_id')
			if (!id) { id = `anon-${crypto.randomUUID()}`; localStorage.setItem('seilor_user_id', id) }
			return id
		} catch {
			return `anon-${Math.random().toString(36).slice(2)}`
		}
	}

	static async append(message: { type: ChatMessageType; message: string; timestamp?: string }): Promise<void> {
		const userId = this.getUserId()
		await fetch('/.netlify/functions/chat-memory', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId, message })
		})
	}

	static async load(): Promise<{ userId: string; messages: Array<{ type: ChatMessageType; message: string; timestamp: string }> }> {
		const userId = this.getUserId()
		const res = await fetch(`/.netlify/functions/chat-memory?userId=${encodeURIComponent(userId)}`)
		if (!res.ok) throw new Error(await res.text())
		return res.json()
	}

	static async clear(): Promise<void> {
		const userId = this.getUserId()
		await fetch('/.netlify/functions/chat-memory', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId })
		})
	}
}