<script setup>
import { useAppStore } from '@/stores/useAppStore'
import HomeIcon from '@/components/icons/HomeIcon.vue'
import PinIcon from '@/components/icons/PinIcon.vue'
import OrderIcon from '@/components/icons/OrderIcon.vue'
import ChatIcon from '@/components/icons/ChatIcon.vue'

/**
 * BottomNav
 *
 * Persistent tab bar for the primary destinations. The active tab is derived
 * from the router, and My Order shows a badge with the current order count.
 */
const { orderCount } = useAppStore()

const items = [
  { label: 'Home', to: '/home', icon: HomeIcon },
  { label: 'Ride', to: '/call-rider', icon: PinIcon },
  { label: 'Orders', to: '/my-order', icon: OrderIcon, badge: true },
  { label: 'Chat', to: '/chat', icon: ChatIcon },
]
</script>

<template>
  <nav
    class="sticky bottom-0 z-10 mt-auto bg-panel px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    aria-label="Primary"
  >
    <div class="flex items-center justify-around rounded-full bg-white px-2 py-1.5 shadow-card">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="group relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 text-muted transition-colors"
        active-class="text-brand"
      >
        <span class="relative grid place-items-center">
          <component :is="item.icon" class="size-6" />
          <span
            v-if="item.badge && orderCount > 0"
            class="absolute -top-1.5 -right-2 grid min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white"
          >
            {{ orderCount }}
          </span>
        </span>
        <span class="text-[11px] font-bold">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
