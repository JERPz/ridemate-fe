<script setup>
import AppShell from '@/components/AppShell.vue'
</script>

<template>
  <AppShell>
    <RouterView v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </AppShell>
</template>

<style>
/* Subtle cross-fade + rise between routes. */
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
  .page-enter-from,
  .page-leave-to {
    transform: none;
  }
}
</style>
