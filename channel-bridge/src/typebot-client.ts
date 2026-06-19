import axios, { AxiosInstance } from 'axios';

export interface TypebotMessage {
  sessionId: string;
  message?: string;
}

export interface TypebotResponse {
  sessionId: string;
  messages: Array<{
    type: string;
    content: {
      richText?: Array<{ children: Array<{ text: string }> }>;
      url?: string;
    };
  }>;
  input?: {
    type: string;
    id: string;
  };
}

export class TypebotClient {
  private client: AxiosInstance;
  private botId: string;

  constructor(apiUrl: string, apiToken: string, botId: string) {
    this.botId = botId;
    this.client = axios.create({
      baseURL: apiUrl,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async startSession(sessionId: string): Promise<TypebotResponse> {
    const response = await this.client.post(
      `/typebots/${this.botId}/startChat`,
      {
        prefilledVariables: { sessionId },
      },
    );
    return response.data;
  }

  async sendMessage(sessionId: string, message: string): Promise<TypebotResponse> {
    const response = await this.client.post(
      `/sessions/${sessionId}/continueChat`,
      { message },
    );
    return response.data;
  }

  extractTextFromResponse(response: TypebotResponse): string[] {
    return response.messages
      .filter((msg) => msg.type === 'text')
      .map((msg) => {
        if (msg.content.richText) {
          return msg.content.richText
            .map((block) => block.children.map((child) => child.text).join(''))
            .join('\n');
        }
        return '';
      })
      .filter(Boolean);
  }

  extractMediaFromResponse(response: TypebotResponse): string[] {
    return response.messages
      .filter((msg) => msg.type === 'image' || msg.type === 'video')
      .map((msg) => msg.content.url || '')
      .filter(Boolean);
  }
}
