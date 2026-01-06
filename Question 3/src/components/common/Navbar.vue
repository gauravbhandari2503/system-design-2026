<template>
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-50 h-16">
    <div class="max-w-4xl mx-auto px-4 h-full flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center gap-2 cursor-pointer">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          P
        </div>
        <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          PollWidget
        </span>
      </div>

      <!-- Navigation Links -->
      <div class="hidden md:flex items-center gap-6 text-gray-600">
        <a href="#" class="text-blue-600 font-medium">Dashboard</a>
        <a href="#" class="hover:text-blue-600 transition-colors font-medium">Analytics</a>
        <a href="#" class="hover:text-blue-600 transition-colors font-medium">Settings</a>
      </div>

      <!-- User Profile -->
      <div class="flex items-center gap-3">
        <div class="hidden sm:flex flex-col items-end">
          <span class="text-sm font-semibold text-gray-900">Gaurav Gupta</span>
        </div>
        <img 
          src="https://i.pravatar.cc/150?u=1" 
          alt="User Avatar" 
          class="w-10 h-10 rounded-full border-2 border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-100 transition-all"
        >
      </div>
    </div>
  </nav>
</template>
