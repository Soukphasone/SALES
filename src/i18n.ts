import { createI18n } from 'vue-i18n'
import en from './locales/en'
import la from './locales/la'

const messages = {
  en,
  la
}

export type AllowedLocales = keyof typeof messages

// Helper function to safely get initial locale
const getInitialLocale = (): AllowedLocales => {
  const savedLocale = localStorage.getItem('user-locale') as AllowedLocales | null
  
  // If saved locale exists and is valid, use it; otherwise fallback to 'la'
  if (savedLocale && savedLocale in messages) {
    return savedLocale
  }
  
  return 'la'
}

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: getInitialLocale(), // Set dynamic initial locale
  fallbackLocale: 'la',
  messages
})

export default i18n