<script setup>
import MenuCard from '@/components/MenuCard.vue'
import AccountCircleIcon from '@/components/icons/AccountCircleIcon.vue'
import CoinIcon from '@/components/icons/CoinIcon.vue'
import LogoMark from '@/components/icons/LogoMark.vue'
import PinIcon from '@/components/icons/PinIcon.vue'
import HelmetIcon from '@/components/icons/HelmetIcon.vue'
import OrderIcon from '@/components/icons/OrderIcon.vue'
import ChatIcon from '@/components/icons/ChatIcon.vue'
import TopUpIcon from '@/components/icons/TopUpIcon.vue'

const userName = 'Jeeraphol'
const coinBalance = 0

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
      <AccountCircleIcon class="size-14 shrink-0 text-white" />

      <div class="min-w-0 flex-1">
        <p class="text-[14px] font-semibold text-white/85">hello!</p>
        <p class="truncate text-[26px] leading-tight font-bold text-white">{{ userName }}</p>
      </div>

      <p
        class="flex shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[15px] font-bold text-white"
      >
        <CoinIcon class="size-[18px]" />
        <span class="sr-only">Coin balance:</span>
        {{ coinBalance }}
      </p>
    </header>

    <main class="relative flex flex-1 flex-col rounded-t-sheet bg-panel px-5 pt-7 pb-10">
      <h1 class="text-[17px] font-bold text-ink">What do you need?</h1>

      <nav class="mt-5" aria-label="Main menu">
        <ul class="grid grid-cols-2 gap-4">
          <li v-for="tile in tiles" :key="tile.label" :class="tile.wide ? 'col-span-2' : ''">
            <MenuCard :label="tile.label" :to="tile.to" class="h-full min-h-[124px]">
              <template #icon><component :is="tile.icon" class="size-7" /></template>
            </MenuCard>
          </li>
        </ul>
      </nav>

      <!-- Decorative watermark -->
      <LogoMark
        class="pointer-events-none absolute right-[-28px] bottom-[-12px] h-28 w-42 text-brand/10"
        aria-hidden="true"
      />
    </main>
  </div>
</template>
