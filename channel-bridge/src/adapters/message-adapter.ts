export interface NormalizedMessage {
  channel: 'instagram' | 'facebook';
  senderId: string;
  senderName?: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  timestamp: number;
  rawEvent: unknown;
}

export function normalizeInstagramMessage(entry: any): NormalizedMessage | null {
  try {
    const messaging = entry.messaging?.[0];
    if (!messaging) return null;

    const message = messaging.message;
    if (!message) return null;

    const result: NormalizedMessage = {
      channel: 'instagram',
      senderId: messaging.sender.id,
      timestamp: messaging.timestamp,
      rawEvent: entry,
    };

    if (message.text) {
      result.text = message.text;
    }

    if (message.attachments?.length > 0) {
      const attachment = message.attachments[0];
      result.mediaUrl = attachment.payload?.url;
      result.mediaType = attachment.type as 'image' | 'video' | 'audio';
    }

    return result;
  } catch {
    return null;
  }
}

export function normalizeFacebookMessage(entry: any): NormalizedMessage | null {
  try {
    const messaging = entry.messaging?.[0];
    if (!messaging) return null;

    const message = messaging.message;
    if (!message) return null;

    const result: NormalizedMessage = {
      channel: 'facebook',
      senderId: messaging.sender.id,
      timestamp: messaging.timestamp,
      rawEvent: entry,
    };

    if (message.text) {
      result.text = message.text;
    }

    if (message.attachments?.length > 0) {
      const attachment = message.attachments[0];
      result.mediaUrl = attachment.payload?.url;
      result.mediaType = attachment.type as 'image' | 'video' | 'audio';
    }

    return result;
  } catch {
    return null;
  }
}
