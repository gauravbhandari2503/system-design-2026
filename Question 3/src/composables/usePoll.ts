import { ref } from 'vue';
import { PollService } from '../api/poll';
import type { Poll } from '../models/Poll';

export function usePoll(pollId: string) {
  const poll = ref<Poll | null>(null);
  const loading = ref(false);
  const voting = ref(false);
  const error = ref<string | null>(null);

  const fetchPoll = async () => {
    loading.value = true;
    error.value = null;
    try {
      poll.value = await PollService.getPoll(pollId);
    } catch (err) {
      error.value = 'Failed to load poll.';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const castVote = async (optionId: string) => {
    if (voting.value || !poll.value) return;

    voting.value = true;
    try {
      const res = await PollService.vote(pollId, optionId);
      if (res.success) {
        // Optimistically update local state for immediate feedback
        if (poll.value) {
           const option = poll.value.options.find(o => o.id === optionId);
           if (option) {
             option.votes++;
             poll.value.totalVotes++;
             poll.value.userVotedOptionId = optionId;
           }
        }
      }
    } catch (err) {
      error.value = 'Failed to record vote.';
      console.error(err);
    } finally {
      voting.value = false;
    }
  };

  return {
    poll,
    loading,
    voting,
    error,
    fetchPoll,
    castVote
  };
}
