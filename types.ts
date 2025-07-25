export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  ERROR = 'error',
}

export interface FileAttachment {
  name: string;
  type: string;
  content: string; // Base64 for images, text content for text files
}

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface Message {
  id: string;
  role: MessageRole;
  parts: MessagePart[];
  timestamp: string;
  attachments?: FileAttachment[];
}