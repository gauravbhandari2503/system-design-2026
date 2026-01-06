<script setup lang="ts">
</script>

<template>
  <nav class="bg-white border-b border-gray-100 sticky top-0 z-50">
    <div class="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-4">
            <button class="p-2 hover:bg-gray-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div class="flex items-center gap-1 cursor-pointer">
                <div class="bg-red-600 rounded-lg p-1 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                </div>
                <span class="text-xl font-bold tracking-tighter text-gray-900">StreamTube</span>
            </div>
        </div>
        
        <div class="flex-1 max-w-2xl mx-12 hidden md:flex">
             <div class="flex w-full">
                 <input type="text" placeholder="Search" class="flex-1 border border-gray-300 rounded-l-full px-6 py-2 focus:outline-none focus:border-blue-500 shadow-inner bg-gray-50 focus:bg-white transition-colors">
                 <button class="bg-gray-100 border border-l-0 border-gray-300 rounded-r-full px-6 hover:bg-gray-200">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                 </button>
             </div>
        </div>
        
        <div class="flex items-center gap-3">
             <button class="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
             </button>
             <button class="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
             </button>
             <img src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff" class="w-8 h-8 rounded-full cursor-pointer">
        </div>
    </div>
  </nav>
</template>
