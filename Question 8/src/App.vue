<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Navbar from './components/common/Navbar.vue';
import Sidebar from './components/layout/Sidebar.vue';
import EmailList from './components/email/EmailList.vue';
import EmailView from './components/email/EmailView.vue';
import ComposeModal from './components/email/ComposeModal.vue';
import { useEmail } from './composables/useEmail';

const { 
  emails, 
  loading, 
  currentFolder, 
  selectedEmail, 
  selectedEmailId, 
  fetchEmails, 
  selectEmail, 
  sendEmail 
} = useEmail();

const isComposeOpen = ref(false);

onMounted(() => {
  fetchEmails('inbox');
});

const handleFolderSelect = (folderId: string) => {
    if (folderId === 'compose') {
        isComposeOpen.value = true;
    } else {
        fetchEmails(folderId);
    }
};

const handleSend = async (payload: { to: string, subject: string, body: string }) => {
    await sendEmail(payload.to, payload.subject, payload.body);
};
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden font-sans bg-white">
    <Navbar />
    
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar (200px fixed) -->
      <aside class="w-[200px] shrink-0 z-20">
        <Sidebar 
          :current-folder="currentFolder" 
          @select="handleFolderSelect" 
        />
      </aside>

      <!-- Email List (350px fixed) -->
      <div class="w-[350px] shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <EmailList 
          :emails="emails" 
          :selected-id="selectedEmailId" 
          :loading="loading" 
          @select="selectEmail" 
        />
      </div>

      <!-- Email View (Flexible) -->
      <main class="flex-1 bg-white min-w-0">
        <EmailView :email="selectedEmail" />
      </main>
    </div>

    <!-- Modals -->
    <ComposeModal 
        :is-open="isComposeOpen" 
        @close="isComposeOpen = false" 
        @send="handleSend"
    />
  </div>
</template>
