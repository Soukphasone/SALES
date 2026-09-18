<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import changeLanguage from '@/components/LanguageSwitcher/LanguageSwitcher.vue'
import { useI18n } from 'vue-i18n'
import { useScrollDirection } from '@/composables/useScrollDirection'
import DetailView from './DetailView.vue'
import { viewOrders } from '@/services/service/ManageAPI'
import { formatNumber } from '@/services/service/Format'
const { t } = useI18n()
const route = useRoute()
const type = route.params.type as string
console.log('Path Name', type)
const items = ref<any[]>([])
const serverUrl = import.meta.env.VITE_APP_SERVER
const filter = ref<'all' | 'land' | 'car'>((type as 'all' | 'land' | 'car') || 'all')
const { showHeader } = useScrollDirection()

// --- Load More State & Logic ---
const ITEMS_PER_PAGE = 3
const visibleCount = ref<number>(ITEMS_PER_PAGE)
const isLoading = ref<boolean>(false)

// Reset pagination when switching filter tabs
watch(filter, () => {
  visibleCount.value = ITEMS_PER_PAGE
})

// Filter items first
const filteredItems = computed(() => {
  if (filter.value === 'all') return items.value
  return items.value.filter((i) => i.type === filter.value)
})

// Display only visible portion of items
const displayedItems = computed(() => {
  return filteredItems.value.slice(0, visibleCount.value)
})

// Check if more items are available
const hasMore = computed(() => {
  return visibleCount.value < filteredItems.value.length
})

// Handle Load More click
const handleLoadMore = () => {
  isLoading.value = true
  setTimeout(() => {
    visibleCount.value += ITEMS_PER_PAGE
    isLoading.value = false
  }, 500) // Simulated loading delay
}

const titleTopic = computed(() => {
  if (type === 'land') return 'Sales Land'
  if (type === 'car') return 'salesOldcar'
  return 'Sales'
})
const isModalOpen = ref(false)
const selectedListing = ref<any | null>(null)

const openModal = (item: any) => {
  selectedListing.value = {
    ...item,
    serverUrl
  } as any
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedListing.value = null
}
const fetchData = async () => {
  try {
    const _res = await viewOrders({})
    items.value = _res.data.data
    console.log('Fetched Orders:', _res)
  } catch (error) {
    console.error('Error fetching orders:', error)
  }
}
onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="max-w-7xl mx-auto font-lao p-4 pt-0">
    <!-- Auto-Hiding Fixed Header with Smooth Transition -->
    <header
      :class="[
        'fixed top-0 left-0 right-0 z-50 bg-gray-50 backdrop-blur-sm border-b border-gray-100 shadow-sm transition-transform duration-300 ease-in-out px-6 py-4',
        showHeader ? 'translate-y-0' : '-translate-y-full'
      ]"
    >
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-2">
          <h1 class="text-xl font-bold text-slate-800">{{ t(titleTopic) }}</h1>
          <changeLanguage />
        </div>
        <div class="flex justify-between items-center">
          <!-- <h1 class="text-3xl font-bold text-slate-800">{{ titleTopic }}</h1> -->
          <div v-if="type === 'all'" class="flex gap-2 bg-slate-100 p-1 sm:p-1.5 rounded-lg">
            <button
              @click="filter = 'all'"
              :class="[
                'px-4 py-1 sm:py-1.5 rounded-md transition',
                filter === 'all' ? 'bg-white shadow text-blue-600' : 'text-gray-500'
              ]"
            >
              {{ t('all') }}
            </button>
            <button
              @click="filter = 'land'"
              :class="[
                'px-4 py-1 sm:py-1.5 rounded-md transition',
                filter === 'land' ? 'bg-white shadow text-blue-600' : 'text-gray-500'
              ]"
            >
              {{ t('land') }}
            </button>
            <button
              @click="filter = 'car'"
              :class="[
                'px-4 py-1 sm:py-1.5 rounded-md transition',
                filter === 'car' ? 'bg-white shadow text-blue-600' : 'text-gray-500'
              ]"
            >
              {{ t('car') }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Spacer for Fixed Header -->
    <div class="h-25"></div>

    <!-- Grid Content -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in displayedItems"
        :key="item.id"
        class="border rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer"
      >
        <img
          :src="serverUrl + item.images.profile"
          :alt="item.title"
          class="w-full h-48 object-cover"
        />
        <div class="p-4">
          <h2 class="text-xl font-semibold mt-2">{{ item.title }}</h2>

          <p v-if="item.cars" class="text-gray-500 text-sm">
            {{ `${item.cars.make} ${item.cars.model} ${item.cars.year}` }}
          </p>
          <p v-if="item.lands" class="text-gray-500 text-sm">
            {{ `${item.lands.village}, ${item.lands.district}, ${item.lands.province}` }}
          </p>

          <p class="text-gray-400 text-sm flex items-center gap-1 mt-1">
            👁️ {{ item.views }} views
          </p>

          <div class="flex justify-between items-center mt-4">
            <span class="text-2xl font-bold text-slate-900">
              {{ formatNumber(item.price) }} {{ item.currency }}</span
            >

            <button
              @click="openModal(item)"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {{ t('viewDetails') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Load More Section -->
    <div v-if="hasMore" class="flex justify-center mt-10 mb-6">
      <button
        @click="handleLoadMore"
        :disabled="isLoading"
        class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-6 py-3 rounded-lg shadow transition duration-200"
      >
        <svg
          v-if="isLoading"
          class="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span>{{ isLoading ? 'Loading...' : 'Load More' }}</span>
      </button>
    </div>
  </div>
  <DetailView :is-open="isModalOpen" :item="selectedListing" @close="closeModal" />
</template>
