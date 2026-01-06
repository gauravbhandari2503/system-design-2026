import { ref, computed } from 'vue';
import type { Email } from '../models/Email';
import { EmailService } from '../api/email';

const emails = ref<Email[]>([]);
const selectedEmailId = ref<string | null>(null);
const currentFolder = ref<string>('inbox');
const loading = ref(false);

export function useEmail() {
  const selectedEmail = computed(() => 
    emails.value.find(e => e.id === selectedEmailId.value) || null
  );

  const fetchEmails = async (folder: string) => {
    loading.value = true;
    currentFolder.value = folder;
    selectedEmailId.value = null; // Reset selection on folder change
    try {
      emails.value = await EmailService.getEmails(folder);
    } finally {
      loading.value = false;
    }
  };

  const selectEmail = (id: string) => {
    selectedEmailId.value = id;
    // Mark as read
    const email = emails.value.find(e => e.id === id);
    if (email) {
      email.read = true;
    }
  };

  const sendEmail = async (to: string, subject: string, body: string) => {
    console.log(`Sending email to ${to}`);
    await EmailService.sendEmail({ from: 'Me', subject, body });
    // If we are in 'sent', refresh
    if (currentFolder.value === 'sent') {
      await fetchEmails('sent');
    }
  };

  return {
    emails,
    selectedEmail,
    selectedEmailId,
    currentFolder,
    loading,
    fetchEmails,
    selectEmail,
    sendEmail
  };
}
