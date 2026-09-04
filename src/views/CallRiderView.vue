<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/useAppStore'
import ScreenHeader from '@/components/ScreenHeader.vue'
import AppField from '@/components/AppField.vue'
import AppButton from '@/components/AppButton.vue'
import BottomNav from '@/components/BottomNav.vue'
import PinIcon from '@/components/icons/PinIcon.vue'
import HelmetIcon from '@/components/icons/HelmetIcon.vue'
import CoinIcon from '@/components/icons/CoinIcon.vue'
import CheckIcon from '@/components/icons/CheckIcon.vue'

const router = useRouter()
const { state, quote, createOrder } = useAppStore()

const pickup = ref('')
const dropoff = ref('')
const vehicleId = ref('bike')
const error = ref('')

// Fare estimate comes from the backend (mock or real) via the quote endpoint.
const estimate = ref({ distanceKm: 0, fare: 0 })
const quoting = ref(false)

const vehicles = [
  { id: 'bike', label: 'Bike', desc: 'Fast & cheap', icon: HelmetIcon },
  { id: 'car', label: 'Car', desc: 'Comfortable', icon: PinIcon },
]

let quoteTimer = null

// Debounced quote whenever the trip inputs change.
watch([pickup, dropoff, vehicleId], () => {
  clearTimeout(quoteTimer)
  if (!pickup.value.trim() || !dropoff.value.trim()) {
    estimate.value = { distanceKm: 0, fare: 0 }
    return
  }
  quoting.value = true
  quoteTimer = setTimeout(async () => {
    estimate.value = await quote({
      pickup: pickup.value.trim(),
      dropoff: dropoff.value.trim(),
      vehicle: vehicleId.value,
    })
    quoting.value = false
  }, 300)
})

async function onSubmit() {
  error.value = ''
  if (!pickup.value.trim() || !dropoff.value.trim()) {
    error.value = 'Enter both a pick-up and drop-off location.'
    return
  }
  if (estimate.value.fare > state.coinBalance) {
    error.value = `You need ${estimate.value.fare} coins for this ride. Top up first.`
    return
  }

  const ride = await createOrder({
    pickup: pickup.value.trim(),
    dropoff: dropoff.value.trim(),
    vehicle: vehicleId.value,
  })

  if (ride) router.push('/my-order')
  else error.value = state.error || 'Could not create the ride.'
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader title="Call Rider" />

    <main class="flex flex-1 flex-col rounded-t-sheet bg-panel px-5 pt-7 pb-4">
      <form class="flex flex-col gap-5" novalidate @submit.prevent="onSubmit">
        <div class="flex flex-col gap-4 rounded-card bg-white p-5 shadow-soft">
          <AppField v-model="pickup" label="Pick-up" placeholder="Where are you now?">
            <template #leading><PinIcon class="size-full" /></template>
          </AppField>
          <AppField v-model="dropoff" label="Drop-off" placeholder="Where to?">
            <template #leading><PinIcon class="size-full" /></template>
          </AppField>
        </div>

        <div>
          <p class="mb-2 text-[13px] font-bold text-ink">Choose a ride</p>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="v in vehicles"
              :key="v.id"
              type="button"
              class="flex items-center gap-3 rounded-card border-2 bg-white p-4 text-left transition-colors"
              :class="vehicleId === v.id ? 'border-brand' : 'border-transparent'"
              :aria-pressed="vehicleId === v.id"
              @click="vehicleId = v.id"
            >
              <span class="grid size-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                <component :is="v.icon" class="size-5" />
              </span>
              <span class="min-w-0">
                <span class="block text-[14px] font-bold text-ink">{{ v.label }}</span>
                <span class="block truncate text-[12px] text-muted">{{ v.desc }}</span>
              </span>
            </button>
          </div>
        </div>

        <!-- Fare estimate -->
        <div
          v-if="estimate.fare > 0 || quoting"
          class="flex items-center justify-between rounded-card bg-white p-5 shadow-soft"
        >
          <div>
            <p class="text-[12px] font-semibold text-muted">
              Estimated fare<template v-if="estimate.distanceKm"> · {{ estimate.distanceKm }} km</template>
            </p>
            <p class="flex items-center gap-1.5 text-[24px] font-bold text-ink">
              <CoinIcon class="size-5 text-brand" />
              <span v-if="quoting" class="text-muted">…</span>
              <span v-else>{{ estimate.fare }}</span>
            </p>
          </div>
          <p
            class="text-right text-[12px] font-semibold"
            :class="estimate.fare <= state.coinBalance ? 'text-muted' : 'text-red-700'"
          >
            Balance<br /><span class="text-[15px] font-bold">{{ state.coinBalance }}</span>
          </p>
        </div>

        <p v-if="error" class="text-[13px] font-semibold text-red-700">{{ error }}</p>

        <AppButton
          type="submit"
          :disabled="state.loading || quoting || estimate.fare <= 0 || estimate.fare > state.coinBalance"
        >
          <CheckIcon class="size-5" />
          {{ state.loading ? 'Booking…' : 'Confirm ride' }}
        </AppButton>

        <AppButton
          v-if="estimate.fare > 0 && estimate.fare > state.coinBalance"
          variant="secondary"
          to="/topup"
        >
          Top up coins
        </AppButton>
      </form>
    </main>

    <BottomNav />
  </div>
</template>
