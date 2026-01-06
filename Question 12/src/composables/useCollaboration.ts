import { ref, onMounted, onUnmounted } from 'vue';

export interface User {
  id: string;
  name: string;
  color: string;
  avatar: string;
}

export interface Cursor {
  userId: string;
  x: number; // Percentage 0-100
  y: number; // Pixels
}

const COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'];
const NAMES = ['Alice Bot', 'Bob Bot', 'Charlie Bot', 'Diana Bot'];

export function useCollaboration() {
  const content = ref('<h1>Welcome to the collaborative doc!</h1><p>Start typing to see the magic happen...</p>');
  const users = ref<User[]>([]);
  const cursors = ref<Record<string, Cursor>>({});
  
  // Simulation State
  let intervalId: any;

  const joinBot = () => {
      const id = Date.now().toString();
      const color = COLORS[users.value.length % COLORS.length];
      const name = NAMES[users.value.length % NAMES.length];
      
      const user: User = {
          id,
          name,
          color,
          avatar: `https://ui-avatars.com/api/?name=${name}&background=${color.replace('#','')}&color=fff`
      };
      
      users.value.push(user);
      cursors.value[id] = { userId: id, x: 50, y: 100 };
  };

  const moveBots = () => {
      users.value.forEach(user => {
         const current = cursors.value[user.id];
         // Random walk
         const destX = Math.max(0, Math.min(100, current.x + (Math.random() - 0.5) * 20));
         const destY = Math.max(50, Math.min(400, current.y + (Math.random() - 0.5) * 50));
         
         cursors.value[user.id] = {
             userId: user.id,
             x: destX,
             y: destY
         };
      });
  };

  onMounted(() => {
     // Add initial bots
     joinBot();
     setTimeout(joinBot, 1000);

     intervalId = setInterval(() => {
         moveBots();
     }, 2000);
  });

  onUnmounted(() => {
      clearInterval(intervalId);
  });

  return {
    content,
    users,
    cursors
  };
}
