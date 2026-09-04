<script setup>
import { useAppStore } from '@/stores/useAppStore'
import ScreenHeader from '@/components/ScreenHeader.vue'
import AppButton from '@/components/AppButton.vue'
import BottomNav from '@/components/BottomNav.vue'
import CoinIcon from '@/components/icons/CoinIcon.vue'
import PinIcon from '@/components/icons/PinIcon.vue'
import OrderIcon from '@/components/icons/OrderIcon.vue'

const { orders, cancelOrder, updateOrderStatus } = useAppStore()

const statusStyle = {
  searching: 'bg-amber-100 text-amber-800',
  ongoing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-200 text-gray-600',
}

const statusLabel = {
  searching: 'Finding rider',
  ongoing: 'On the way',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function formatTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader title="My Order" />

    <main class="flex flex-1 flex-col rounded-t-sheet bg-panel px-5 pt-7 pb-4">
      <!-- Empty state -->
      <div
        v-if="orders.length === 0"
        class="flex flex-1 flex-col items-center justify-center gap-3 rounded-card bg-white p-8 text-center shadow-soft"
      >
        <span class="grid size-16 place-items-center rounded-full bg-brand/10 text-brand">
          <OrderIcon class="size-8" />
        </span>
        <p class="text-[15px] font-bold text-ink">No orders yet</p>
        <p class="max-w-[26ch] text-[13px] text-muted">Book a ride and it will show up here.</p>
        <AppButton class="mt-2" :block="false" to="/call-rider">Call a rider</AppButton>
      </div>

      <!-- Order list -->
      <ul v-else class="flex flex-col gap-4">
        <li v-for="order in orders" :key="order.id" class="rounded-card bg-white p-5 shadow-soft">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-[12px] font-semibold text-muted">#{{ order.id }} · {{ order.vehicle }}</p>
              <p class="mt-0.5 text-[13px] text-muted">{{ formatTime(order.createdAt) }}</p>
            </div>
            <span
              class="shrink-0 rounded-full px-3 py-1 text-[11px] font-bold"
              :class="statusStyle[order.status]"
            >
              {{ statusLabel[order.status] }}
            </span>
          </div>

          <div class="mt-4 flex flex-col gap-2">
            <p class="flex items-center gap-2 text-[14px] font-semibold text-ink">
              <PinIcon class="size-4 shrink-0 text-brand" /><span class="truncate">{{ order.pickup }}</span>
            </p>
            <p class="flex items-center gap-2 text-[14px] font-semibold text-ink">
              <PinIcon class="size-4 shrink-0 text-ink/40" /><span class="truncate">{{ order.dropoff }}</span>
            </p>
          </div>

          <div class="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
            <p class="flex items-center gap-1.5 text-[16px] font-bold text-ink">
              <CoinIcon class="size-4 text-brand" />{{ order.fare }}
              <span class="text-[12px] font-normal text-muted">· {{ order.distanceKm }} km</span>
            </p>

            <div class="flex gap-2">
              <button
                v-if="order.status === 'searching'"
                type="button"
                class="rounded-full bg-brand px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-brand-dark"
                @click="updateOrderStatus(order.id, 'ongoing')"
              >
                Start ride
              </button>
              <button
                v-else-if="order.status === 'ongoing'"
                type="button"
                class="rounded-full bg-green-600 px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-green-700"
                @click="updateOrderStatus(order.id, 'completed')"
              >
                Complete
              </button>
              <button
                v-if="order.status === 'searching' || order.status === 'ongoing'"
                type="button"
                class="rounded-full bg-panel px-4 py-2 text-[12px] font-bold text-muted transition-colors hover:text-ink"
                @click="cancelOrder(order.id)"
              >
                Cancel
              </button>
            </div>
          </div>
        </li>
      </ul>
    </main>

    <BottomNav />
  </div>
</template>
