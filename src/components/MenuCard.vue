<script setup>
/**
 * MenuCard
 *
 * A destination card on the home screen: white surface, brand-orange icon in a
 * tinted disc, and an uppercase label. Laid out in a grid by the parent rather
 * than absolutely positioned.
 */
defineProps({
  label: { type: String, required: true },
  to: { type: String, required: true },
})
</script>

<template>
  <RouterLink
    :to="to"
    class="group flex flex-col items-center justify-center gap-3 rounded-card bg-white p-4 shadow-soft transition-[transform,box-shadow] hover:shadow-card active:scale-[0.97]"
  >
    <span
      class="grid size-14 place-items-center rounded-full bg-brand/10 text-brand transition-colors group-hover:bg-brand/15"
    >
      <slot name="icon" />
    </span>

    <span class="text-center text-[13px] leading-tight font-bold tracking-wide text-brand">
      {{ label }}
    </span>
  </RouterLink>
</template>
