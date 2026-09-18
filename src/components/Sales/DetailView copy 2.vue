<script setup lang="ts">
import { ref } from 'vue'

// Define the interface locally if not imported
interface ListingDetail {
  id: number
  title: string
  price: number
  location: string
  type: 'car' | 'land'
  images: string[]
  videoUrl?: string
  description: string
  specs: { label: string; value: string | number }[]
}

const item = ref<ListingDetail>({
  id: 1,
  title: '2024 Luxury Performance Sedan',
  price: 200000,
  location: 'Beverly Hills, CA',
  type: 'car',
  images: [
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70', // Existing Car
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888', // Existing Car

    // --- Added 4 New Images ---

    // 1. Car Exterior (Modern Sports)
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8',

    // 2. Car Interior (Luxury Cockpit)
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d'

    // 3. Land/Property (Ariel View)
    // 'https://images.unsplash.com/photo-1500382017468-9049fed747ef',

    // 4. Land/Property (Countryside/Development)
    // 'https://images.unsplash.com/photo-1500076656116-558758c991c1'
  ],
  // images: [
  //     'https://images.unsplash.com/photo-1503376780353-7e6692767b70', // Existing Car
  //     'https://images.unsplash.com/photo-1583121274602-3e2820c69888', // Existing Car

  //     // --- Added 4 New Images ---

  //     // 1. Car Exterior (Modern Sports)
  //     'https://images.unsplash.com/photo-1494976388531-d1058494cdd8',

  //     // 2. Car Interior (Luxury Cockpit)
  //     'https://images.unsplash.com/photo-1552519507-da3b142c6e3d',

  //     // 3. Land/Property (Ariel View)
  //     'https://images.unsplash.com/photo-1500382017468-9049fed747ef',

  //     // 4. Land/Property (Countryside/Development)
  //     'https://images.unsplash.com/photo-1500076656116-558758c991c1'
  // ],
  // Standard YouTube embed URL (works best for responsive iframes)
  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  description:
    'A pristine example of modern engineering. Single owner, low mileage, and full service history included.',
  specs: [
    { label: 'Mileage', value: '12,000 mi' },
    { label: 'Fuel', value: 'Electric' },
    { label: 'Transmission', value: 'Automatic' },
    { label: 'Exterior Color', value: 'Midnight Blue' }
  ]
})

const activeImage = ref(0)
const isVideoActive = ref(false) // Track if we are showing the video or image

const showImage = (index: number) => {
  activeImage.value = index
  isVideoActive.value = false
}

const showVideo = () => {
  isVideoActive.value = true
}

const formatPrice = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <!-- Navigation -->
    <nav class="p-4 bg-white border-b mb-6">
      <button class="text-blue-600 font-medium">
        <RouterLink to="/all"> ← ກັບຄືນ </RouterLink>
      </button>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Media Player (Images + Video) -->
          <section class="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div class="aspect-video w-full bg-black relative">
              <!-- Video Player -->
              <template v-if="isVideoActive && item.videoUrl">
                <iframe
                  :src="item.videoUrl"
                  class="w-full h-full"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </template>

              <!-- Image Display -->
              <template v-else>
                <img
                  :src="item.images[activeImage]"
                  class="w-full h-full object-cover transition-opacity duration-300"
                />
              </template>
            </div>

            <!-- Media Selection Bar -->
            <div class="flex gap-3 p-4 overflow-x-auto bg-white">
              <!-- Video Thumbnail Button (If video exists) -->
              <button
                v-if="item.videoUrl"
                @click="showVideo"
                :class="[
                  'group relative w-24 h-16 flex-shrink-0 rounded-lg border-2 overflow-hidden bg-gray-900 flex items-center justify-center',
                  isVideoActive ? 'border-red-500' : 'border-transparent'
                ]"
              >
                <div
                  class="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity bg-black"
                ></div>
                <span class="relative z-10 text-white text-2xl">▶️</span>
                <span
                  class="absolute bottom-1 text-[10px] text-white font-bold uppercase tracking-tighter"
                  >Video</span
                >
              </button>

              <!-- Image Thumbnails -->
              <button
                v-for="(img, idx) in item.images"
                :key="idx"
                @click="showImage(idx)"
                :class="[
                  'w-24 h-16 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all',
                  !isVideoActive && activeImage === idx ? 'border-blue-600' : 'border-transparent'
                ]"
              >
                <img :src="img" class="w-full h-full object-cover" />
              </button>
            </div>
          </section>

          <!-- Content Description -->
          <section class="bg-white p-6 rounded-2xl shadow-sm">
            <h1 class="text-3xl font-bold text-gray-900">{{ item.title }}</h1>
            <p class="text-gray-500 mt-1 flex items-center">
              <span class="mr-2">📍</span> {{ item.location }}
            </p>
            <hr class="my-6 border-gray-100" />
            <h3 class="text-lg font-semibold mb-3">Description</h3>
            <p class="text-gray-600 leading-relaxed">{{ item.description }}</p>
          </section>

          <!-- Features Grid -->
          <!-- <section class="bg-white p-6 rounded-2xl shadow-sm">
            <h3 class="text-lg font-semibold mb-4">Key Specifications</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div v-for="spec in item.specs" :key="spec.label" class="p-4 bg-gray-50 rounded-xl">
                <p class="text-xs text-gray-400 uppercase font-bold">{{ spec.label }}</p>
                <p class="text-sm font-semibold text-gray-800">{{ spec.value }}</p>
              </div>
            </div>
          </section> -->
        </div>

        <!-- Sidebar -->
        <!-- Right Column: Sticky Sidebar -->
        <div class="lg:col-span-1">
          <div class="sticky top-6 space-y-4">
            <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <p class="text-xl text-gray-500 uppercase tracking-wider">ລາຄາ</p>
              <div class="text-4xl font-extrabold text-gray-900 mb-6">
                {{ formatPrice(item.price) }}
              </div>

              <div class="space-y-3">
                <a href="https://wa.me/8562099110019" target="_blank" rel="noopener noreferrer">
                  <button
                    class="flex items-center justify-center gap-2 w-full border-2 border-green-300 hover:border-green-500 text-green-500 font-bold py-1 rounded-xl text-center transition-all"
                  >
                    <!-- Phone Icon -->
                    <img src="@/assets/images/logo/whatsapp.png" alt="" class="w-10" />

                    WhatsApp 020 99110019
                    <br />
                  </button>
                </a>
                <!-- <button
                  class="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-4 rounded-xl transition-all"
                >
                  Schedule View/Test Drive
                </button> -->
              </div>

              <!-- <div class="mt-6 pt-6 border-top border-gray-100 flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-gray-200"></div>
                <div>
                  <p class="font-bold text-sm">Verified Agency</p>
                  <p class="text-xs text-green-600">Online now</p>
                </div>
              </div> -->
            </div>

            <!-- Trust Badge (Optional) -->
            <div class="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
              <span class="text-xl">🛡️</span>
              <p class="text-xs text-blue-800">
                Secure transaction protected by <strong>BuyerShield</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
