<script setup lang="ts">
import { ref, computed } from 'vue'
import { addOrder } from '@/services/service/ManageAPI'
// --- TYPES & INTERFACES ---
type ItemType = 'land' | 'car'

interface BaseItem {
  id: string
  type: ItemType
  title: string
  price: number
  location: string
  status: 'available' | 'sold'
  imageUrl: string
  videoUrl?: string
  detailImages?: string[]
  createdAt: string
}

interface LandDetails {
  village: string
  district: string
  province: string
  area: string | number
  zoning?: string
}

interface CarDetails {
  make: string
  model: string
  year: number | string
  mileage?: number
}

interface LandItem extends BaseItem {
  type: 'land'
  lands: LandDetails
}

interface CarItem extends BaseItem {
  type: 'car'
  cars: CarDetails
}

type ManageItem = LandItem | CarItem

const MAX_DETAIL_IMAGES = 6

// --- MOCK DATA ---
const items = ref<ManageItem[]>([
  {
    id: '1',
    type: 'land',
    title: 'Prime Sunset Hills Plot',
    price: 250000,
    location: 'Los Angeles, CA',
    status: 'available',
    imageUrl:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    videoUrl: '',
    detailImages: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
    ],
    lands: {
      village: 'Sunset Valley',
      district: 'Central',
      province: 'California',
      area: 1200,
      zoning: 'Residential'
    },
    createdAt: '2026-01-15'
  }
])

// --- STATE MANAGEMENT ---
const filterType = ref<'all' | ItemType>('all')
const searchQuery = ref('')
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const isEditing = ref(false)

const activeFormType = ref<ItemType>('land')
const selectedItemId = ref<string | null>(null)

const detailItem = computed(() => items.value.find((i) => i.id === selectedItemId.value) || null)

const imagePlaceholder = computed(() =>
  activeFormType.value === 'land'
    ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
    : 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80'
)

// --- UPDATED FORM STATE ---
const form = ref({
  title: '',
  lands: {
    village: '',
    district: '',
    province: '',
    area: '' as string | number,
    zoning: 'Residential'
  },
  cars: {
    make: '',
    model: '',
    year: 2026 as string | number,
    mileage: 0
  },
  price: 0,
  location: '',
  // status: 'available' as 'available' | 'sold',
  images: {
    profile: '',
    detail: [''] as string[]
  },
  videoUrl: ''
})

// --- MEDIA FILE HANDLERS ---
const handleMainFileUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.images.profile = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleVideoFileUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.videoUrl = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleDetailFileUpload = (event: Event, index: number) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.images.detail[index] = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleBatchDetailFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (!files.length) return

  const existingImages = form.value.images.detail.filter((img) => img.trim() !== '')
  const remainingSlots = MAX_DETAIL_IMAGES - existingImages.length
  const filesToProcess = files.slice(0, remainingSlots)

  filesToProcess.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result && existingImages.length < MAX_DETAIL_IMAGES) {
        existingImages.push(e.target.result as string)
        form.value.images.detail = [...existingImages]
      }
    }
    reader.readAsDataURL(file)
  })
  input.value = ''
}

const addDetailImageField = () => {
  if (form.value.images.detail.length < MAX_DETAIL_IMAGES) {
    form.value.images.detail.push('')
  }
}

const removeDetailImageField = (index: number) => {
  form.value.images.detail.splice(index, 1)
  if (form.value.images.detail.length === 0) {
    form.value.images.detail.push('')
  }
}

// --- COMPUTED & ACTIONS ---
const filteredItems = computed(() => {
  return items.value.filter((item) => {
    const matchesType = filterType.value === 'all' || item.type === filterType.value
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesType && matchesSearch
  })
})

const openAddModal = (type: ItemType) => {
  isEditing.value = false
  activeFormType.value = type
  resetForm()
  isModalOpen.value = true
}

const openEditModal = (item: ManageItem) => {
  isEditing.value = true
  activeFormType.value = item.type
  selectedItemId.value = item.id

  const landData = item.type === 'land' ? (item as LandItem).lands : null
  const carData = item.type === 'car' ? (item as CarItem).cars : null

  form.value = {
    title: item.title,
    price: item.price,
    location: item.location,
    status: item.status,
    videoUrl: item.videoUrl || '',
    images: {
      profile: item.imageUrl || '',
      detail:
        item.detailImages && item.detailImages.length > 0
          ? [...item.detailImages].slice(0, MAX_DETAIL_IMAGES)
          : ['']
    },
    lands: {
      village: landData?.village || '',
      district: landData?.district || '',
      province: landData?.province || '',
      area: landData?.area || '',
      zoning: landData?.zoning || 'Residential'
    },
    cars: {
      make: carData?.make || '',
      model: carData?.model || '',
      year: carData?.year || 2026,
      mileage: carData?.mileage || 0
    }
  }
  isModalOpen.value = true
}

const openDetailModal = (id: string) => {
  selectedItemId.value = id
  isDetailModalOpen.value = true
}

const openDeleteModal = (id: string) => {
  selectedItemId.value = id
  isDeleteModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    title: '',
    price: 0,
    location: '',
    status: 'available',
    videoUrl: '',
    images: {
      profile: '',
      detail: ['']
    },
    lands: { village: '', district: '', province: '', area: '', zoning: 'Residential' },
    cars: { make: '', model: '', year: 2026, mileage: 0 }
  }
  selectedItemId.value = null
}

const saveItem = async () => {
  const _add = await addOrder(form.value)
  console.log('Add Order Result', _add)
  const standardImage = form.value.images.profile.trim() || imagePlaceholder.value
  const cleanDetailImages = form.value.images.detail
    .map((img) => img.trim())
    .filter((img) => img !== '')
    .slice(0, MAX_DETAIL_IMAGES)

  const payloadBase = {
    title: form.value.title,
    price: form.value.price,
    location: form.value.location,
    status: form.value.status,
    imageUrl: standardImage,
    videoUrl: form.value.videoUrl.trim(),
    detailImages: cleanDetailImages,
    type: activeFormType.value
  }

  let newItemPayload: ManageItem

  if (activeFormType.value === 'land') {
    newItemPayload = {
      ...payloadBase,
      id: selectedItemId.value || Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      type: 'land',
      lands: { ...form.value.lands }
    }
  } else {
    newItemPayload = {
      ...payloadBase,
      id: selectedItemId.value || Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      type: 'car',
      cars: { ...form.value.cars }
    }
  }
  console.log('Payload Add', newItemPayload)
  if (isEditing.value && selectedItemId.value) {
    const index = items.value.findIndex((i) => i.id === selectedItemId.value)
    if (index !== -1) {
      items.value[index] = newItemPayload
    }
  } else {
    items.value.unshift(newItemPayload)
  }
  closeModal()
}

const deleteItem = () => {
  if (selectedItemId.value) {
    items.value = items.value.filter((item) => item.id !== selectedItemId.value)
    isDeleteModalOpen.value = false
    selectedItemId.value = null
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 font-sans">
    <div class="max-w-7xl mx-auto">
      <!-- HEADER & CONTROLS -->
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-6 mb-6 gap-4"
      >
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Inventory Portal</h1>
          <p class="text-sm text-gray-500 mt-1">
            Manage listings, edit values, upload imagery and view configurations.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="openAddModal('land')"
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm"
          >
            + Add Land
          </button>
          <button
            @click="openAddModal('car')"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm"
          >
            + Add Car
          </button>
        </div>
      </div>

      <!-- FILTER & SEARCH BAR -->
      <div
        class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div class="flex bg-gray-100 p-1 rounded-lg self-start">
          <button
            @click="filterType = 'all'"
            :class="[
              'px-4 py-1.5 text-sm font-medium rounded-md transition',
              filterType === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            ]"
          >
            All
          </button>
          <button
            @click="filterType = 'land'"
            :class="[
              'px-4 py-1.5 text-sm font-medium rounded-md transition',
              filterType === 'land'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            ]"
          >
            Lands
          </button>
          <button
            @click="filterType = 'car'"
            :class="[
              'px-4 py-1.5 text-sm font-medium rounded-md transition',
              filterType === 'car'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            ]"
          >
            Cars
          </button>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search title or location..."
          class="w-full sm:w-72 pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- TABLE -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr
                class="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                <th class="py-4 px-6">Preview</th>
                <th class="py-4 px-6">Type</th>
                <th class="py-4 px-6">Listing</th>
                <th class="py-4 px-6">Location</th>
                <th class="py-4 px-6">Specifications</th>
                <th class="py-4 px-6">Price</th>
                <th class="py-4 px-6">Status</th>
                <th class="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 text-sm">
              <tr
                v-for="item in filteredItems"
                :key="item.id"
                class="hover:bg-gray-50/70 transition"
              >
                <td class="py-4 px-6 whitespace-nowrap">
                  <img
                    :src="item.imageUrl"
                    alt="Preview"
                    class="w-12 h-12 object-cover rounded-lg border border-gray-200 bg-gray-100"
                  />
                </td>
                <td class="py-4 px-6 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                      item.type === 'land'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-blue-50 text-blue-700'
                    ]"
                  >
                    {{ item.type === 'land' ? '🏔️ Land' : '🚗 Car' }}
                  </span>
                </td>
                <td class="py-4 px-6 font-medium text-gray-900 max-w-xs truncate">
                  {{ item.title }}
                </td>
                <td class="py-4 px-6 text-gray-500 whitespace-nowrap">{{ item.location }}</td>
                <td class="py-4 px-6 text-gray-600 whitespace-nowrap">
                  <div v-if="item.type === 'land'">
                    {{ (item as LandItem).lands.area }} sqm |
                    <span class="text-xs text-gray-400">{{
                      (item as LandItem).lands.province
                    }}</span>
                  </div>
                  <div v-else>
                    {{ (item as CarItem).cars.make }} {{ (item as CarItem).cars.model }}<br />
                    <span class="text-xs text-gray-400">{{ (item as CarItem).cars.year }}</span>
                  </div>
                </td>
                <td class="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">
                  {{ formatCurrency(item.price) }}
                </td>
                <td class="py-4 px-6 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex px-2 py-0.5 rounded text-xs font-medium',
                      item.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    ]"
                    >{{ item.status }}</span
                  >
                </td>
                <td class="py-4 px-6 text-right whitespace-nowrap text-sm font-medium">
                  <button
                    @click="openDetailModal(item.id)"
                    class="text-gray-600 hover:text-gray-900 mr-3"
                  >
                    View
                  </button>
                  <button
                    @click="openEditModal(item)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button @click="openDeleteModal(item.id)" class="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
              <tr v-if="filteredItems.length === 0">
                <td colspan="8" class="py-12 text-center text-gray-400">
                  No matching records found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- EDIT / ADD FORM MODAL -->
      <div
        v-if="isModalOpen"
        class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <div
          class="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden transform transition-all max-h-[90vh] flex flex-col"
        >
          <div
            class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0"
          >
            <h3 class="text-lg font-bold text-gray-900">
              {{ isEditing ? 'Edit' : 'Add New' }}
              {{ activeFormType === 'land' ? 'Land Listing' : 'Car Listing' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-xl">
              &times;
            </button>
          </div>

          <form @submit.prevent="saveItem" class="p-6 space-y-4 overflow-y-auto">
            <!-- Title & Price (Single col on mobile, 2 cols on sm+) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Title Description
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Price ($)
                </label>
                <input
                  v-model.number="form.price"
                  type="number"
                  required
                  class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <!-- LAND FORM FIELDS -->
            <div v-if="activeFormType === 'land'" class="space-y-4">
              <!-- Village, District, Province (Single col on mobile, 3 cols on sm+) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Village
                  </label>
                  <input
                    v-model="form.lands.village"
                    type="text"
                    class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    District
                  </label>
                  <input
                    v-model="form.lands.district"
                    type="text"
                    class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <!-- Area & Location (Single col on mobile, 2 cols on sm+) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Province
                  </label>
                  <input
                    v-model="form.lands.province"
                    type="text"
                    class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Area (sqm)
                  </label>
                  <input
                    v-model="form.lands.area"
                    type="text"
                    required
                    class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Location
                </label>
                <input
                  v-model="form.location"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <!-- CAR FORM FIELDS -->
            <div v-if="activeFormType === 'car'" class="space-y-4">
              <!-- Make & Model (Single col on mobile, 2 cols on sm+) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Make
                  </label>
                  <input
                    v-model="form.cars.make"
                    type="text"
                    required
                    class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Model
                  </label>
                  <input
                    v-model="form.cars.model"
                    type="text"
                    required
                    class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <!-- Year & Mileage (Single col on mobile, 2 cols on sm+) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Year
                  </label>
                  <input
                    v-model.number="form.cars.year"
                    type="number"
                    required
                    class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Mileage (mi)
                  </label>
                  <input
                    v-model.number="form.cars.mileage"
                    type="number"
                    class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <!-- MAIN COVER IMAGE -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Main Cover Image
              </label>
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  v-model="form.imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  class="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <label
                  class="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg px-3 py-2.5 text-xs font-medium text-center whitespace-nowrap transition"
                >
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleMainFileUpload"
                    class="hidden"
                  />
                </label>
              </div>

              <div
                v-if="form.imageUrl"
                class="mt-2 relative w-24 h-24 rounded-lg border overflow-hidden bg-gray-50"
              >
                <img :src="form.imageUrl" alt="Cover Preview" class="w-full h-full object-cover" />
                <button
                  type="button"
                  @click="form.imageUrl = ''"
                  class="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center shadow-md"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- VIDEO UPLOAD FIELD -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Listing Video
              </label>
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  v-model="form.videoUrl"
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  class="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <label
                  class="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg px-3 py-2.5 text-xs font-medium text-center whitespace-nowrap transition"
                >
                  Upload Video
                  <input
                    type="file"
                    accept="video/*"
                    @change="handleVideoFileUpload"
                    class="hidden"
                  />
                </label>
              </div>

              <!-- Video Preview -->
              <div
                v-if="form.videoUrl"
                class="mt-2 relative w-48 h-28 rounded-lg border overflow-hidden bg-black flex items-center justify-center"
              >
                <video :src="form.videoUrl" controls class="w-full h-full object-cover"></video>
                <button
                  type="button"
                  @click="form.videoUrl = ''"
                  class="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow-md z-10"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- DETAIL IMAGES GALLERY (MAX 6 LIMIT) -->
            <div class="border-t border-gray-200 pt-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 uppercase">
                    Detail Images Gallery
                  </label>
                  <span class="text-xs text-gray-400">
                    ({{ form.images.detail.filter((i) => i.trim() !== '').length }}/{{
                      MAX_DETAIL_IMAGES
                    }}
                    max)
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <label
                    v-if="form.images.length < MAX_DETAIL_IMAGES"
                    class="cursor-pointer text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-md font-medium border border-gray-300 transition"
                  >
                    Upload Multiple
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      @change="handleBatchDetailFileUpload"
                      class="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    @click="addDetailImageField"
                    :disabled="form.images.length >= MAX_DETAIL_IMAGES"
                    :class="[
                      'text-xs px-2.5 py-1 rounded-md font-medium transition',
                      form.images.length >= MAX_DETAIL_IMAGES
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    ]"
                  >
                    + Add Field
                  </button>
                </div>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(_, index) in form.images.detail"
                  :key="index"
                  class="space-y-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200"
                >
                  <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      v-model="form.images.detail[index]"
                      type="url"
                      placeholder="https://example.com/detail.jpg"
                      class="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    />
                    <div class="flex items-center gap-2">
                      <label
                        class="flex-1 sm:flex-none cursor-pointer bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-medium text-center whitespace-nowrap transition"
                      >
                        Upload File
                        <input
                          type="file"
                          accept="image/*"
                          @change="(e) => handleDetailFileUpload(e, index)"
                          class="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        @click="removeDetailImageField(index)"
                        class="text-red-500 hover:text-red-700 p-1 text-sm font-semibold"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div
                    v-if="form.images[index]"
                    class="w-16 h-16 rounded-md border overflow-hidden bg-white"
                  >
                    <img
                      :src="form.images[index]"
                      alt="Detail preview"
                      class="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- ACTIONS -->
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                :class="[
                  'px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition',
                  activeFormType === 'land'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                ]"
              >
                {{ isEditing ? 'Update Changes' : 'Save Listing' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
