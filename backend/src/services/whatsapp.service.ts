import fetch from 'node-fetch';

const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

export async function sendWhatsAppText(to: string, text: string) {
  if (!phoneNumberId || !accessToken) {
    console.error('WHATSAPP_PHONE_NUMBER_ID ou WHATSAPP_ACCESS_TOKEN não configurado');
    return;
  }

  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { preview_url: false, body: text },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Erro ao enviar mensagem WhatsApp:', err);
    throw new Error(`WhatsApp API error: ${err}`);
  }

  return res.json();
}
