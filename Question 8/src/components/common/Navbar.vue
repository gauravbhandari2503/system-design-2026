<template>
  <nav class="bg-gray-900 border-b border-gray-800 h-14 flex items-center justify-between px-4 text-white shrink-0">
     <div class="flex items-center gap-3">
        <div class="bg-blue-600 p-1.5 rounded-lg">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </div>
        <span class="font-bold text-lg tracking-tight">MailClient</span>
     </div>

     <div class="flex items-center gap-4">
        <div class="relative">
            <input type="text" placeholder="Search" class="bg-gray-800 border-none rounded-md py-1.5 px-3 text-sm text-gray-300 focus:ring-1 focus:ring-gray-600 w-64">
        </div>
        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border-2 border-gray-800"></div>
     </div>
  </nav>
</template>
