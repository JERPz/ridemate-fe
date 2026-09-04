<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/useAppStore'
import MenuCard from '@/components/MenuCard.vue'
import BottomNav from '@/components/BottomNav.vue'
import AccountCircleIcon from '@/components/icons/AccountCircleIcon.vue'
import CoinIcon from '@/components/icons/CoinIcon.vue'
import LogoMark from '@/components/icons/LogoMark.vue'
import PinIcon from '@/components/icons/PinIcon.vue'
import HelmetIcon from '@/components/icons/HelmetIcon.vue'
import OrderIcon from '@/components/icons/OrderIcon.vue'
import ChatIcon from '@/components/icons/ChatIcon.vue'
import TopUpIcon from '@/components/icons/TopUpIcon.vue'

const router = useRouter()
const { state, orderCount, logout } = useAppStore()

// Falls back gracefully while the profile is still loading.
const displayName = computed(() => state.user?.name || 'there')

// Time-of-day greeting for a warmer welcome.
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
})

async function onLogout() {
  await logout()
  router.replace({ name: 'login' })
}

const tiles = [
  { label: 'CALL RIDER', to: '/call-rider', icon: PinIcon },
  { label: 'FOR RIDER', to: '/for-rider', icon: HelmetIcon },
  { label: 'MY ORDER', to: '/my-order', icon: OrderIcon },
  { label: 'CHAT', to: '/chat', icon: ChatIcon },
  { label: 'TOP UP', to: '/topup', icon: TopUpIcon, wide: true },
]
</script>

<template>
  <div class="flex flex-1 flex-col">
    <header class="flex items-center gap-3 px-5 pt-8 pb-10">
      <button
        type="button"
        class="shrink-0 rounded-full transition-transform active:scale-95"
        aria-label="Sign out"
        @click="onLogout"
      >
        <AccountCircleIcon class="size-14 text-white" />
      </button>

      <div class="min-w-0 flex-1">
        <p class="text-[14px] font-semibold text-white/85">{{ greeting }},</p>
        <p class="truncate text-[26px] leading-tight font-bold text-white">{{ displayName }}</p>
      </div>

      <RouterLink
        to="/topup"
        class="flex shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[15px] font-bold text-white transition-colors hover:bg-white/30"
      >
        <CoinIcon class="size-[18px]" />
        <span class="sr-only">Coin balance:</span>
        {{ state.coinBalance }}
      </RouterLink>
    </header>

    <main class="relative flex flex-1 flex-col rounded-t-sheet bg-panel px-5 pt-7 pb-4">
      <div class="flex items-baseline justify-between">
        <h1 class="text-[17px] font-bold text-ink">What do you need?</h1>
        <RouterLink
          v-if="orderCount > 0"
          to="/my-order"
          class="text-[13px] font-bold text-brand hover:underline"
        >
          {{ orderCount }} order{{ orderCount > 1 ? 's' : '' }}
        </RouterLink>
      </div>

      <nav class="mt-5" aria-label="Main menu">
        <ul class="grid grid-cols-2 gap-4">
          <li
            v-for="(tile, i) in tiles"
            :key="tile.label"
            class="tile-in"
            :class="tile.wide ? 'col-span-2' : ''"
            :style="{ animationDelay: `${i * 60}ms` }"
          >
            <MenuCard :label="tile.label" :to="tile.to" class="h-full min-h-[124px]">
              <template #icon><component :is="tile.icon" class="size-7" /></template>
            </MenuCard>
          </li>
        </ul>
      </nav>

      <LogoMark
        class="pointer-events-none absolute right-[-28px] bottom-[64px] h-28 w-42 text-brand/10"
        aria-hidden="true"
      />
    </main>

    <BottomNav />
  </div>
</template>

<style scoped>
.tile-in {
  animation: tile-in 0.4s ease both;
}

@keyframes tile-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tile-in {
    animation: none;
  }
}
</style>
