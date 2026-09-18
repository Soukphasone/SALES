<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { IconFullscreen } from '@/util/icons'
import { formatNumber } from '@/services/service/Format'

const props = defineProps<{
  isOpen: boolean
  item: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const activeImage = ref(0)
const isVideoActive = ref(false)
const isFullScreen = ref(false)

const detailImages = computed(() => {
  if (!props.item) return []
  const imgObj = props?.item?.images?.detail
  return imgObj || []
})

const profileImage = computed(() => {
  if (!props.item) return ''
  const imgObj = props.item.images
  return imgObj?.profile || ''
})

const currentVideoUrl = computed(() => {
  return props.item?.video || ''
})

const activeImageUrl = computed(() => {
  if (detailImages.value.length > 0) {
    return detailImages.value[activeImage.value]
  }
  return profileImage.value
})

watch(
  () => props.item,
  () => {
    activeImage.value = 0
    isVideoActive.value = false
    isFullScreen.value = false
  }
)

watch(
  () => [props.isOpen, isFullScreen.value],
  () => {
    document.body.style.overflow = props.isOpen || isFullScreen.value ? 'hidden' : ''
  }
)

const showImage = (index: number) => {
  activeImage.value = index
  isVideoActive.value = false
}

const showVideo = () => {
  isVideoActive.value = true
}

const toggleFullScreen = () => {
  if (isVideoActive.value && currentVideoUrl.value) {
    isFullScreen.value = !isFullScreen.value
  } else if (activeImageUrl.value) {
    isFullScreen.value = !isFullScreen.value
  }
}

const nextImage = () => {
  if (detailImages.value.length > 0) {
    activeImage.value = (activeImage.value + 1) % detailImages.value.length
  }
}

const prevImage = () => {
  if (detailImages.value.length > 0) {
    activeImage.value =
      (activeImage.value - 1 + detailImages.value.length) % detailImages.value.length
  }
}

const formatPrice = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

const closeModal = () => {
  if (isFullScreen.value) {
    isFullScreen.value = false
  } else {
    emit('close')
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.isOpen) return

  if (e.key === 'Escape') {
    closeModal()
  } else if (isFullScreen.value && !isVideoActive.value && detailImages.value.length > 1) {
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'ArrowLeft') prevImage()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <!-- Main Modal -->
    <Transition
      enter-active-class="transition opacity-0 duration-300 ease-out"
      enter-to-class="opacity-100"
      leave-active-class="transition opacity-100 duration-200 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-6 overflow-y-auto"
        @click.self="closeModal"
      >
        <div
          v-if="item"
          class="bg-gray-50 sm:rounded-2xl max-w-5xl w-full sm:max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col my-auto"
        >
          <!-- Header -->
          <div class="sticky top-0 z-20 bg-white px-6 py-4 border-b flex justify-start">
            <button
              @click="closeModal"
              class="flex gap-2 items-center text-gray-700 hover:text-gray-800 transition-colors"
            >
              <svg
                class="w-5 h-5 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
              <span>{{ $t('back') }}</span>
            </button>
          </div>

          <!-- Content -->
          <div class="p-4">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div class="lg:col-span-2 space-y-4">
                <!-- Media Player Container -->
                <section class="bg-white rounded-2xl overflow-hidden shadow-sm border">
                  <div
                    class="aspect-video w-full bg-black relative flex items-center justify-center group"
                  >
                    <!-- Video Embed -->
                    <template v-if="isVideoActive && currentVideoUrl">
                      <iframe
                        :src="item.serverUrl + currentVideoUrl"
                        class="w-full h-full border-0"
                        allow="
                          accelerometer;
                          autoplay;
                          clipboard-write;
                          encrypted-media;
                          gyroscope;
                          picture-in-picture;
                        "
                        allowfullscreen
                      ></iframe>
                    </template>

                    <!-- Active Image Display -->
                    <template v-else-if="activeImageUrl">
                      <img
                        :src="item.serverUrl + activeImageUrl"
                        :alt="item.title"
                        class="w-full h-full object-cover transition-opacity duration-300 cursor-pointer"
                        @click="toggleFullScreen"
                      />
                    </template>

                    <div v-else class="text-gray-400 text-sm">No Media Available</div>

                    <!-- Expand / Fullscreen Button Overlay -->
                    <button
                      v-if="(isVideoActive && currentVideoUrl) || activeImageUrl"
                      @click="toggleFullScreen"
                      class="absolute top-3 right-3 z-10 p-1.5 sm:p-2 bg-black/40 hover:bg-black/60 text-white rounded-lg backdrop-blur-md transition-all shadow-md"
                      title="Full Screen View"
                    >
                      <IconFullscreen class="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>

                  <!-- Media Thumbnails Bar -->
                  <div
                    v-if="currentVideoUrl || detailImages.length > 0"
                    class="flex gap-3 p-4 overflow-x-auto bg-white border-t"
                  >
                    <button
                      v-if="currentVideoUrl"
                      @click="showVideo"
                      :class="[
                        'group relative w-24 h-16 flex-shrink-0 rounded-lg border-2 overflow-hidden bg-gray-900 flex items-center justify-center transition-all',
                        isVideoActive ? 'border-red-500' : 'border-transparent'
                      ]"
                    >
                      <div
                        class="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity bg-black"
                      ></div>
                      <span class="relative z-10 text-white text-xl">▶️</span>
                      <span
                        class="absolute bottom-1 text-[10px] text-white font-bold uppercase tracking-tighter"
                        >Video</span
                      >
                    </button>

                    <button
                      v-for="(img, idx) in detailImages"
                      :key="idx"
                      @click="showImage(idx)"
                      :class="[
                        'w-24 h-16 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all',
                        !isVideoActive && activeImage === idx
                          ? 'border-blue-600'
                          : 'border-transparent'
                      ]"
                    >
                      <img
                        :src="item.serverUrl + img"
                        :alt="`Thumbnail ${idx}`"
                        class="w-full h-full object-cover"
                      />
                    </button>
                  </div>
                </section>

                <!-- Information Section -->
                <section class="bg-white p-6 rounded-2xl shadow-sm border">
                  <h1 class="text-xl font-bold text-gray-900">{{ item.title }}</h1>
                  <p v-if="item.lands" class="text-gray-500 mt-1 flex items-center">
                    <span class="mr-2">📍</span>
                    {{
                      item.lands.village + ', ' + item.lands.district + ', ' + item.lands.province
                    }}
                  </p>
                  <p v-if="item.cars" class="text-gray-600 mt-1 flex items-center">
                    <span class="mr-2">🚗</span>
                    {{ item.cars.make + ' ' + item.cars.model + ' ' + item.cars.year }}
                  </p>
                  <hr class="my-4 border-gray-100" />
                  <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('description') }}</h3>
                  <p class="text-gray-600 leading-relaxed">{{ item.description }}</p>

                  <div v-if="item.specs && item.specs.length" class="mt-6">
                    <h3 class="text-lg font-semibold mb-3">Specifications</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div
                        v-for="spec in item.specs"
                        :key="spec.label"
                        class="p-3 bg-gray-50 rounded-xl"
                      >
                        <p class="text-[10px] text-gray-400 uppercase font-bold">
                          {{ spec.label }}
                        </p>
                        <p class="text-sm font-semibold text-gray-800">{{ spec.value }}</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <!-- Sidebar -->
              <div class="lg:col-span-1">
                <div class="space-y-4">
                  <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p class="text-lg text-gray-800 uppercase font-semibold tracking-wider">
                      {{ $t('price') }}
                    </p>
                    <div class="text-xl font-extrabold text-gray-900 mb-6">
                      {{ formatNumber(item.price) }} {{ item.currency }}
                    </div>
                    <p class="text-lg text-gray-800 uppercase font-semibold tracking-wider">
                      {{ $t('contact') }}
                    </p>
                    <a
                      href="https://wa.me/8562099110019"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="block"
                    >
                      <button
                        class="flex items-center justify-start hover:bg-green-100 text-green-500 font-bold rounded-xl text-left transition-all w-full border border-green-500 rounded-xl bg-green-50 p-2 mt-2"
                      >
                        <img
                          src="@/assets/images/logo/whatsapp.png"
                          alt=""
                          class="w-10 h-10 border border-green-500 rounded-full bg-white"
                        />
                        <span class="text-sm sm:text-md ml-1">WhatApp</span>
                        <span class="text-black text-sm sm:text-md ml-4">+ 856 20 99110019</span>
                      </button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Fullscreen Overlay Modal -->
    <Transition
      enter-active-class="transition opacity-0 duration-300 ease-out"
      enter-to-class="opacity-100"
      leave-active-class="transition opacity-100 duration-200 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isFullScreen"
        class="fixed inset-0 z-[60] bg-black flex items-center justify-center p-2 select-none"
        @click.self="isFullScreen = false"
      >
        <!-- Close Button -->
        <button
          @click="isFullScreen = false"
          class="absolute top-5 right-5 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl transition-colors"
        >
          ✕
        </button>

        <!-- Fullscreen Video -->
        <div
          v-if="isVideoActive && currentVideoUrl"
          class="w-full h-full max-w-6xl max-h-[85vh] flex items-center justify-center"
        >
          <iframe
            :src="item.serverUrl + currentVideoUrl"
            class="w-full h-full border-0 rounded-xl"
            allow="
              accelerometer;
              autoplay;
              clipboard-write;
              encrypted-media;
              gyroscope;
              picture-in-picture;
            "
            allowfullscreen
          ></iframe>
        </div>

        <!-- Fullscreen Image with Prev/Next Navigation -->
        <div
          v-else-if="activeImageUrl"
          class="relative w-full h-full flex items-center justify-center"
        >
          <button
            v-if="detailImages.length > 1"
            @click="prevImage"
            class="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-colors"
          >
            ❮
          </button>

          <img
            :src="item.serverUrl + activeImageUrl"
            :alt="item?.title"
            class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />

          <button
            v-if="detailImages.length > 1"
            @click="nextImage"
            class="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-colors"
          >
            ❯
          </button>

          <!-- Image Counter -->
          <div
            v-if="detailImages.length > 1"
            class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1.5 rounded-full text-sm backdrop-blur-sm"
          >
            {{ activeImage + 1 }} / {{ detailImages.length }}
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
