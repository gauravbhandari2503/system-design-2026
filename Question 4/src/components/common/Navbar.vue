<template>
  <nav class="bg-white border-b border-gray-200 h-20">
    <div class="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center gap-2 cursor-pointer text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        <span class="text-2xl font-bold tracking-tight">TravelBnB</span>
      </div>

      <!-- Links -->
      <div class="hidden md:flex items-center gap-6 text-gray-600 font-medium">
        <a href="#" class="text-gray-900 border-b-2 border-transparent hover:border-gray-900 py-1 transition-all">Stays</a>
        <a href="#" class="hover:text-gray-900 transition-colors">Experiences</a>
        <a href="#" class="hover:text-gray-900 transition-colors">Online Experiences</a>
      </div>

      <!-- User Profile -->
      <div class="flex items-center gap-2 border border-gray-300 rounded-full pl-3 pr-1 py-1 hover:shadow-md transition-shadow cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        <div class="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        </div>
      </div>
    </div>
  </nav>
</template>
