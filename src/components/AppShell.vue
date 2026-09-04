<script setup>
/**
 * AppShell
 *
 * Mobile-first container. The app is designed for a phone viewport, so the
 * content is capped at a comfortable reading width and centred; on wider
 * screens it reads as a centred column rather than a stretched page.
 */
</script>

<template>
  <div class="flex min-h-dvh justify-center bg-brand">
    <div class="relative flex min-h-dvh w-full max-w-[440px] flex-col overflow-hidden bg-brand">
      <slot />
    </div>
  </div>
</template>
