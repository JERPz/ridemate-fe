<script setup>
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon.vue'

/**
 * ScreenHeader
 *
 * Shared orange header with a back button and title, used by the inner
 * screens (Call Rider, My Order, Top Up, Chat). Keeps their chrome identical.
 */
defineProps({
  title: { type: String, required: true },
  back: { type: [String, Object], default: '/home' },
})
</script>

<template>
  <header class="flex items-center gap-2 px-4 pt-6 pb-10">
    <RouterLink
      :to="back"
      class="grid size-11 shrink-0 place-items-center rounded-full text-white transition-colors hover:bg-white/15"
      aria-label="Back"
    >
      <ChevronLeftIcon class="size-6" />
    </RouterLink>

    <h1 class="truncate text-[26px] leading-tight font-bold text-white uppercase">
      {{ title }}
    </h1>

    <div v-if="$slots.action" class="ml-auto shrink-0"><slot name="action" /></div>
  </header>
</template>
