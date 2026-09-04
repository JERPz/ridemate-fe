<script setup>
import { useRoute } from 'vue-router'
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon.vue'
import LogoMark from '@/components/icons/LogoMark.vue'

/**
 * PlaceholderView
 *
 * Stand-in for the screens that exist in the design but are not built yet
 * (call rider, for rider, my order, chat, top up). It shares the header and
 * sheet chrome with the rest of the app so navigation stays coherent.
 */
const route = useRoute()
</script>

<template>
  <div class="flex flex-1 flex-col">
    <header class="flex items-center gap-2 px-4 pt-6 pb-10">
      <RouterLink
        to="/home"
        class="grid size-11 shrink-0 place-items-center rounded-full text-white transition-colors hover:bg-white/15"
        aria-label="Back to home"
      >
        <ChevronLeftIcon class="size-6" />
      </RouterLink>

      <h1 class="truncate text-[26px] leading-tight font-bold text-white uppercase">
        {{ route.meta.title }}
      </h1>
    </header>

    <main class="relative flex flex-1 flex-col rounded-t-sheet bg-panel px-5 pt-7 pb-8">
      <div
        class="flex flex-1 flex-col items-center justify-center gap-3 rounded-card bg-white p-8 text-center shadow-soft"
      >
        <LogoMark class="h-14 w-21 text-brand/25" />
        <p class="text-[15px] font-bold text-ink">Coming soon</p>
        <p class="max-w-[26ch] text-[13px] text-muted">
          This screen is in the design but hasn't been built yet.
        </p>
      </div>

      <RouterLink
        to="/home"
        class="mt-6 grid h-13 w-full place-items-center rounded-full bg-brand text-[15px] font-bold tracking-wide text-white transition-colors hover:bg-brand-dark"
      >
        RETURN TO HOMEPAGE
      </RouterLink>
    </main>
  </div>
</template>
