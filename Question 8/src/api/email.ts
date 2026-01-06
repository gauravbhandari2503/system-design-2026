import type { Email } from '../models/Email';

const MOCK_EMAILS: Email[] = [
  {
    id: '1',
    from: 'Alice Johnson',
    subject: 'Project Update: Q1 Goals',
    body: 'Hi team, just wanted to share the latest updates on our Q1 goals. We are making great progress...',
    date: '10:30 AM',
    read: false,
    folder: 'inbox',
    avatarColor: 'bg-blue-500'
  },
  {
    id: '2',
    from: 'Bob Smith',
    subject: 'Lunch next week?',
    body: 'Hey, are you free for lunch next Tuesday? There is a new place I want to try.',
    date: 'Yesterday',
    read: true,
    folder: 'inbox',
    avatarColor: 'bg-green-500'
  },
  {
    id: '3',
    from: 'Support Team',
    subject: 'Ticket #12345 Resolved',
    body: 'Your support ticket has been marked as resolved. Please let us know if you have any other questions.',
    date: 'Yesterday',
    read: false,
    folder: 'inbox',
    avatarColor: 'bg-indigo-500'
  },
  {
    id: '4',
    from: 'Me',
    subject: 'Draft: Meeting Notes',
    body: 'Here are the notes from today\'s meeting:\n- Action item 1\n- Action item 2',
    date: '2 days ago',
    read: true,
    folder: 'sent',
    avatarColor: 'bg-gray-500'
  },
  {
    id: '5',
    from: 'Spam Bot',
    subject: 'Win a free iPhone!',
    body: 'Click here to claim your prize! Limited time only.',
    date: 'Last Week',
    read: true,
    folder: 'trash',
    avatarColor: 'bg-red-500'
  }
];

export const EmailService = {
  getEmails(folder: string = 'inbox'): Promise<Email[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_EMAILS.filter(e => e.folder === folder));
      }, 300);
    });
  },

  sendEmail(email: Omit<Email, 'id' | 'date' | 'read' | 'folder'>): Promise<Email> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newEmail: Email = {
          ...email,
          id: Date.now().toString(),
          date: 'Just now',
          read: true,
          folder: 'sent',
          avatarColor: 'bg-gray-500'
        };
        MOCK_EMAILS.unshift(newEmail);
        resolve(newEmail);
      }, 500);
    });
  }
};
