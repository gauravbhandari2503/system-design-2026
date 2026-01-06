<script setup lang="ts">
import type { Cursor, User } from '../../composables/useCollaboration';

const props = defineProps<{
  cursors: Record<string, Cursor>;
  users: User[];
}>();

const getUser = (id: string) => props.users.find(u => u.id === id);
</script>

<template>
  <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <template v-for="(cursor, id) in cursors" :key="id">
          <div 
            v-if="getUser(cursor.userId)"
            class="absolute flex flex-col transition-all duration-1000 ease-in-out z-10"
            :style="{ 
                left: `${cursor.x}%`, 
                top: `${cursor.y}px` 
            }"
          >
              <!-- Cursor Caret -->
              <div 
                class="h-6 w-0.5"
                :style="{ backgroundColor: getUser(cursor.userId)!.color }"
              ></div>
              
              <!-- Name Tag -->
              <div 
                class="px-2 py-1 text-xs text-white rounded-r-md rounded-bl-md font-medium whitespace-nowrap"
                :style="{ backgroundColor: getUser(cursor.userId)!.color }"
              >
                  {{ getUser(cursor.userId)!.name }}
              </div>
          </div>
      </template>
  </div>
</template>
