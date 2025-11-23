import { Message, ChatResponse, ImageGenerationResponse } from '@/types/chat';

export const chatApi = {
  sendMessage: async (messages: Message[], onChunk: (chunk: ChatResponse) => void): Promise<ChatResponse> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedMessage = '';

    if (!reader) throw new Error('Failed to get response reader');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          try {
            const data = JSON.parse(jsonStr);

            if (data.status === 'streaming' && data.content) {
              accumulatedMessage += data.content;
              onChunk({ content: accumulatedMessage, status: 'streaming' });
            } else if (data.status === 'generating_image') {
              onChunk({ content: 'Generating image...', status: 'generating_image' });
            } else if (data.status === 'done') {
              onChunk({ content: accumulatedMessage, status: 'done' });
              return { content: accumulatedMessage, status: 'done' };
            }
          } catch (e) {
            console.error('Failed to parse SSE chunk:', e);
          }
        }
      }
    }

    return { content: accumulatedMessage, status: 'done' };
  },
};
