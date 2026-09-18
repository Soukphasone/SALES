import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollDirection() {
  const showHeader = ref<boolean>(true)
  let lastScrollY = window.scrollY
  let touchStartY = 0

  // 1. Wheel & Page Scroll Handler
  const handleScroll = (): void => {
    const currentScrollY = window.scrollY || document.documentElement.scrollTop

    // Ignore top boundary / rubber-band bounces
    if (currentScrollY <= 0) {
      showHeader.value = true
      lastScrollY = 0
      return
    }

    // Direct toggle on first movement
    if (currentScrollY > lastScrollY) {
      showHeader.value = false // Scrolling down -> Hide
    } else if (currentScrollY < lastScrollY) {
      showHeader.value = true  // Scrolling up -> Show
    }

    lastScrollY = currentScrollY
  }

  // 2. Touch/Swipe Gesture Handlers for Mobile
  const handleTouchStart = (e: TouchEvent): void => {
    touchStartY = e.touches[0].clientY
  }

  const handleTouchMove = (e: TouchEvent): void => {
    const touchCurrentY = e.touches[0].clientY
    const deltaY = touchStartY - touchCurrentY

    // Ignore tiny accidental touches (less than 5px shift)
    if (Math.abs(deltaY) < 5) return

    if (deltaY > 0) {
      showHeader.value = false // Swiping finger UP (page moves down) -> Hide
    } else {
      showHeader.value = true  // Swiping finger DOWN (page moves up) -> Show
    }

    touchStartY = touchCurrentY
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('touchstart', handleTouchStart)
    window.removeEventListener('touchmove', handleTouchMove)
  })

  return { showHeader }
}