<template>
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-50 h-16">
    <div class="max-w-2xl mx-auto px-4 h-full flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center gap-2 cursor-pointer">
         <span class="text-2xl font-bold font-serif tracking-tight bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 bg-clip-text text-transparent">InstaClone</span>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-5 text-gray-800">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hover:text-gray-500 cursor-pointer transition-colors"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hover:text-gray-500 cursor-pointer transition-colors"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hover:text-gray-500 cursor-pointer transition-colors"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <div class="w-8 h-8 rounded-full bg-gray-200 overflow-hidden cursor-pointer border border-gray-200">
             <img src="https://ui-avatars.com/api/?name=Me" alt="Profile" class="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  </nav>
</template>
