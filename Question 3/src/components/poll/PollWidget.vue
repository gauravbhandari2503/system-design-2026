<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { usePoll } from '../../composables/usePoll';
import PollOption from './PollOption.vue';

const props = defineProps<{
  pollId: string;
}>();

const { poll, loading, voting, error, fetchPoll, castVote } = usePoll(props.pollId);

onMounted(() => {
  fetchPoll();
});

const isVoted = computed(() => !!poll.value?.userVotedOptionId);

const handleVote = async (optionId: string) => {
  await castVote(optionId);
};

// Helper for percentage
const getPercentage = (votes: number) => {
  if (!poll.value || poll.value.totalVotes === 0) return 0;
  return Math.round((votes / poll.value.totalVotes) * 100);
};
</script>

<template>
  <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden max-w-lg w-full transition-all duration-500">
    <!-- Loading State -->
    <div v-if="loading" class="p-8 flex items-center justify-center">
      <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-8 text-center">
      <p class="text-red-500 mb-4">{{ error }}</p>
      <button @click="fetchPoll" class="text-blue-600 font-medium hover:underline">Try Again</button>
    </div>

    <!-- Poll Content -->
    <div v-else-if="poll" class="p-6 md:p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 leading-tight">
        {{ poll.question }}
      </h2>

      <!-- Options List -->
      <div class="flex flex-col gap-3">
        <PollOption 
          v-for="option in poll.options"
          :key="option.id"
          :option="option"
          :show-results="isVoted"
          :percentage="getPercentage(option.votes)"
          :voting="voting"
          :is-voted-by-me="poll.userVotedOptionId === option.id"
          @select="handleVote"
        />

        <div v-if="voting" class="text-center text-sm text-gray-400 mt-2 animate-pulse">
          Recording vote...
        </div>

        <div 
          v-if="isVoted" 
          class="mt-4 text-center text-sm text-gray-500 font-medium opacity-0 animate-fade-in"
          style="animation-fill-mode: forwards; animation-delay: 0.5s;"
        >
          Total votes: {{ poll.totalVotes }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
</style>
