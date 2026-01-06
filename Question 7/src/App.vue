<script setup lang="ts">
import { ref } from 'vue';
import Navbar from './components/common/Navbar.vue';
import Modal from './components/ui/Modal.vue';

// State
const showDeleteModal = ref(false);
const showFormModal = ref(false);
const showSuccessModal = ref(false);

const formData = ref({ email: '', role: 'user' });

const handleDelete = () => {
    // Simulate API
    setTimeout(() => {
        showDeleteModal.value = false;
        showSuccessModal.value = true;
    }, 500);
};

const handleFormSubmit = () => {
   showFormModal.value = false;
   showSuccessModal.value = true;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans">
    <Navbar />

    <main class="max-w-4xl mx-auto px-6 py-12">
      <div class="mb-10 text-center">
        <h1 class="text-3xl font-bold mb-3">Reusuable Modal Component</h1>
        <p class="text-gray-500">Accessible dialogs with scroll locking, proper layering, and flexible slots.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Card 1 -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </div>
            <h3 class="font-semibold text-lg mb-2">Destructive Action</h3>
            <p class="text-gray-500 text-sm mb-6">Test a small modal with footer actions for confirmations.</p>
            <button @click="showDeleteModal = true" class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
                Open Confirmation
            </button>
        </div>

        <!-- Card 2 -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
             <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
            <h3 class="font-semibold text-lg mb-2">Form Input</h3>
            <p class="text-gray-500 text-sm mb-6">Test a larger modal containing form fields and custom content.</p>
             <button @click="showFormModal = true" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                Open Form
            </button>
        </div>
      </div>
    </main>

    <!-- 1. Confirmation Modal -->
    <Modal v-model:isOpen="showDeleteModal" title="Delete Account" size="sm">
        <div class="space-y-3">
            <p class="text-gray-600">Are you sure you want to delete your account? This action cannot be undone.</p>
            <div class="bg-red-50 text-red-700 text-sm p-3 rounded-lg flex gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Warning: All data will be lost.
            </div>
        </div>

        <template #footer="{ close }">
             <button @click="close" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
                Cancel
            </button>
            <button @click="handleDelete" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm">
                Delete
            </button>
        </template>
    </Modal>

    <!-- 2. Form Modal -->
    <Modal v-model:isOpen="showFormModal" title="Update Profile" size="md">
        <form @submit.prevent="handleFormSubmit" id="profile-form" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input v-model="formData.email" type="email" class="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select v-model="formData.role" class="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="user">User</option>
                    <option value="admin">Administrator</option>
                    <option value="editor">Editor</option>
                </select>
            </div>
        </form>

        <template #footer="{ close }">
             <button @click="close" type="button" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
                Cancel
            </button>
            <button type="submit" form="profile-form" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                Save Changes
            </button>
        </template>
    </Modal>

     <!-- 3. Success Modal (No Footer) -->
    <Modal v-model:isOpen="showSuccessModal" size="sm">
        <div class="text-center py-4">
             <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3 class="text-xl font-bold mb-2">Success!</h3>
            <p class="text-gray-500">Your operation was completed successfully.</p>
        </div>
    </Modal>

  </div>
</template>
