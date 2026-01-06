export interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  folder: 'inbox' | 'sent' | 'trash';
  avatarColor?: string;
}
