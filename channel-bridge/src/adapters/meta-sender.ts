import axios from 'axios';

export class MetaSender {
  private pageAccessToken: string;

  constructor(pageAccessToken: string) {
    this.pageAccessToken = pageAccessToken;
  }

  async sendTextMessage(recipientId: string, text: string, platform: 'instagram' | 'facebook') {
    const baseUrl =
      platform === 'instagram'
        ? 'https://graph.facebook.com/v18.0/me/messages'
        : 'https://graph.facebook.com/v18.0/me/messages';

    await axios.post(
      baseUrl,
      {
        recipient: { id: recipientId },
        message: { text },
      },
      {
        params: { access_token: this.pageAccessToken },
      },
    );
  }

  async sendImageMessage(recipientId: string, imageUrl: string, platform: 'instagram' | 'facebook') {
    await axios.post(
      'https://graph.facebook.com/v18.0/me/messages',
      {
        recipient: { id: recipientId },
        message: {
          attachment: {
            type: 'image',
            payload: { url: imageUrl, is_reusable: true },
          },
        },
      },
      {
        params: { access_token: this.pageAccessToken },
      },
    );
  }
}
