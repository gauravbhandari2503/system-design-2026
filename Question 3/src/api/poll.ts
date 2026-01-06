import type { Poll } from '../models/Poll';

// Initial Mock Data
const MOCK_POLL: Poll = {
  id: 'poll-1',
  question: 'Which frontend framework do you prefer for large applications?',
  options: [
    { id: 'opt-1', label: 'Vue.js', votes: 120 },
    { id: 'opt-2', label: 'React', votes: 150 },
    { id: 'opt-3', label: 'Angular', votes: 80 },
    { id: 'opt-4', label: 'Svelte', votes: 45 },
  ],
  totalVotes: 395,
  userVotedOptionId: null,
};

export const PollService = {
  async getPoll(id: string): Promise<Poll> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return a deep copy to simulate fresh fetch
        resolve(JSON.parse(JSON.stringify(MOCK_POLL)));
      }, 500); 
    });
  },

  async vote(pollId: string, optionId: string): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Find option and increment (in a real app, backend triggers this)
        const option = MOCK_POLL.options.find(o => o.id === optionId);
        if (option) {
          option.votes++;
          MOCK_POLL.totalVotes++;
          MOCK_POLL.userVotedOptionId = optionId;
          resolve({ success: true });
        } else {
          resolve({ success: false });
        }
      }, 300);
    });
  }
};
