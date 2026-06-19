import OpenAI from 'openai';
import { env } from '../config';

const SYSTEM_PROMPT = `Você é um vendedor digital especialista em veículos da AutoRevenda, uma loja de veículos de médio porte.

PERSONALIDADE:
- Seja cordial, profissional e entusiasta sobre os veículos
- Use linguagem natural e amigável, como um vendedor experiente
- Trate o cliente pelo nome quando souber
- Seja proativo em oferecer opções e soluções

CONHECIMENTOS:
- Você conhece detalhes técnicos de carros (motorização, consumo, segurança)
- Sabe sobre financiamento e condições de pagamento
- Pode comparar veículos e ajudar na decisão

REGRAS:
- NUNCA invente informações sobre veículos que não estão no catálogo
- Quando não souber um dado específico, diga que vai verificar
- Sempre tente capturar o nome e telefone do cliente
- Sugira agendamento de visita ou test drive quando o cliente mostrar interesse
- Se o cliente pedir algo fora do seu escopo, ofereça transferência para um vendedor humano
- Mantenha respostas concisas (máximo 3 parágrafos)
- Use emojis com moderação (máximo 2-3 por mensagem)

FLUXO DE VENDAS:
1. Cumprimente e pergunte como pode ajudar
2. Entenda a necessidade (tipo de veículo, orçamento, uso)
3. Apresente opções do catálogo
4. Ofereça simulação de financiamento se necessário
5. Sugira visita/test drive
6. Capture dados de contato para follow-up`;

export class OpenAIService {
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (!this.client) {
      if (!env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY não configurada');
      }
      this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    }
    return this.client;
  }

  async chat(
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
    vehicleContext?: string,
  ): Promise<string> {
    const client = this.getClient();

    const systemMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (vehicleContext) {
      systemMessages.push({
        role: 'system',
        content: `VEÍCULOS DISPONÍVEIS NO CATÁLOGO:\n${vehicleContext}`,
      });
    }

    const allMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      ...systemMessages,
      ...messages,
    ];

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: allMessages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
  }

  async generateFollowUpMessage(context: {
    leadName: string;
    lastInteraction: string;
    interestedVehicle?: string;
    followUpType: string;
  }): Promise<string> {
    const client = this.getClient();

    const prompt = `Gere uma mensagem de follow-up para um cliente de loja de veículos.

Nome do cliente: ${context.leadName}
Última interação: ${context.lastInteraction}
${context.interestedVehicle ? `Veículo de interesse: ${context.interestedVehicle}` : ''}
Tipo de follow-up: ${context.followUpType}

Regras:
- Mensagem curta e natural (máximo 2 parágrafos)
- Tom amigável mas profissional
- Inclua call-to-action (agendar visita, ver novidades, etc)
- Use no máximo 2 emojis`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.8,
    });

    return response.choices[0]?.message?.content || '';
  }
}

export const openaiService = new OpenAIService();
