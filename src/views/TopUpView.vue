<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/useAppStore'
import ScreenHeader from '@/components/ScreenHeader.vue'
import AppButton from '@/components/AppButton.vue'
import BottomNav from '@/components/BottomNav.vue'
import CoinIcon from '@/components/icons/CoinIcon.vue'
import CheckIcon from '@/components/icons/CheckIcon.vue'

const { state, topUp } = useAppStore()

const presets = [50, 100, 200, 500]
const selected = ref(100)
const custom = ref('')
const justAdded = ref(0)

const amount = computed(() => {
  const c = Number(custom.value)
  return custom.value && Number.isFinite(c) && c > 0 ? Math.round(c) : selected.value
})

function choose(value) {
  selected.value = value
  custom.value = ''
}

async function onTopUp() {
  const value = amount.value
  const ok = await topUp(value)
  if (ok) {
    justAdded.value = value
    custom.value = ''
    setTimeout(() => (justAdded.value = 0), 2500)
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader title="Top Up" />

    <main class="flex flex-1 flex-col rounded-t-sheet bg-panel px-5 pt-7 pb-4">
      <!-- Current balance -->
      <div class="rounded-card bg-gradient-to-br from-brand to-brand-dark p-5 text-white shadow-card">
        <p class="text-[13px] font-semibold text-white/80">Current balance</p>
        <p class="mt-1 flex items-center gap-2 text-[34px] leading-none font-bold">
          <CoinIcon class="size-7" />{{ state.coinBalance }}
        </p>
      </div>

      <transition
        enter-active-class="transition duration-300"
        enter-from-class="opacity-0 -translate-y-1"
        leave-active-class="transition duration-200"
        leave-to-class="opacity-0"
      >
        <p
          v-if="justAdded"
          class="mt-4 flex items-center gap-2 rounded-card bg-green-100 px-4 py-3 text-[14px] font-semibold text-green-800"
        >
          <CheckIcon class="size-5" />Added {{ justAdded }} coins to your wallet.
        </p>
      </transition>

      <p class="mt-6 mb-3 text-[13px] font-bold text-ink">Choose an amount</p>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="p in presets"
          :key="p"
          type="button"
          class="flex items-center justify-center gap-1.5 rounded-card border-2 bg-white py-4 text-[18px] font-bold text-ink transition-colors"
          :class="!custom && selected === p ? 'border-brand' : 'border-transparent'"
          :aria-pressed="!custom && selected === p"
          @click="choose(p)"
        >
          <CoinIcon class="size-4 text-brand" />{{ p }}
        </button>
      </div>

      <label class="mt-4 block">
        <span class="mb-1.5 block text-[13px] font-semibold text-muted">Or enter a custom amount</span>
        <input
          v-model="custom"
          type="number"
          min="1"
          inputmode="numeric"
          placeholder="Amount"
          class="h-13 w-full rounded-full bg-surface px-5 text-[15px] font-medium text-ink transition-colors placeholder:text-muted/70 focus:bg-white"
        />
      </label>

      <p v-if="state.error" class="mt-4 text-[13px] font-semibold text-red-700">{{ state.error }}</p>

      <AppButton class="mt-6" :disabled="amount <= 0 || state.loading" @click="onTopUp">
        {{ state.loading ? 'Processing…' : `Top up ${amount} coins` }}
      </AppButton>
    </main>

    <BottomNav />
  </div>
</template>
