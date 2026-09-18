<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { AllowedLocales } from './i18n'

const { locale } = useI18n()

const changeLanguage = (newLang: AllowedLocales) => {
  locale.value = newLang
  localStorage.setItem('user-locale', newLang)
}
</script>

<template>
  <div class="flex items-center justify-center">
    <!-- Language Switcher Pill Container -->
    <div class="inline-flex rounded-lg bg-slate-100 p-1 sm:p-1.5 shadow-inner dark:bg-slate-800">
      
      <!-- Lao Button -->
      <button
        type="button"
        @click="changeLanguage('la')"
        :class="[
          'flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out',
          locale === 'la'
            ? 'bg-white text-slate-900 shadow-md dark:bg-slate-700 dark:text-white'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        ]"
      >
        <!-- Lao Flag (SVG) -->
        <svg class="h-4 w-6 rounded-sm shadow-sm object-cover" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
          <rect width="600" height="400" fill="#CE1126"/>
          <rect y="100" width="600" height="200" fill="#002868"/>
          <circle cx="300" cy="200" r="80" fill="#FFFFFF"/>
        </svg>
        <span>ລາວ</span>
      </button>

      <!-- English Button -->
      <button
        type="button"
        @click="changeLanguage('en')"
        :class="[
          'flex items-center gap-2 rounded-lg px-2 text-xs sm:text-sm  font-medium transition-all duration-200 ease-in-out',
          locale === 'en'
            ? 'bg-white text-slate-900 shadow-md dark:bg-slate-700 dark:text-white'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        ]"
      >
        <!-- UK/US Flag (SVG) -->
        <svg class="h-4 w-6 rounded-sm shadow-sm object-cover" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
          <path fill="#012169" d="M0 0h640v480H0z"/>
          <path fill="#FFF" d="m75 0 245 180L565 0h75v55L400 240l240 185v55h-75L320 300 75 480H0v-55l240-185L0 55V0h75z"/>
          <path fill="#C8102E" d="m424 280 216 165v35h-46L378 315l46-35zm141-280L349 165l46 35 216-165V0h-46zM0 445l216-165-46-35L0 410v35zm0-445v35l216 165 46-35L46 0H0z"/>
          <path fill="#FFF" d="M240 0v480h160V0H240zM0 160v160h640V160H0z"/>
          <path fill="#C8102E" d="M267 0v480h106V0H267zM0 187v106h640V187H0z"/>
        </svg>
        <span>English</span>
      </button>

    </div>
  </div>
</template>