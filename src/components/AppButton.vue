<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

/**
 * AppButton
 *
 * The single source of truth for buttons across the app. Renders as a
 * <button>, or as a <RouterLink> when `to` is provided, so styling stays
 * consistent whether an element navigates or triggers an action.
 */
const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | ghost
  type: { type: String, default: 'button' },
  to: { type: [String, Object], default: undefined },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: true },
})

const base =
  'inline-flex h-13 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-bold tracking-wide transition-[transform,background-color,opacity] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50'

const variants = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  secondary: 'bg-white text-brand shadow-soft hover:bg-panel',
  ghost: 'bg-white/15 text-white hover:bg-white/25',
}

const classes = computed(() => [base, variants[props.variant] ?? variants.primary, props.block ? 'w-full' : ''])

const tag = computed(() => (props.to ? RouterLink : 'button'))
</script>

<template>
  <component
    :is="tag"
    :to="to"
    :type="to ? undefined : type"
    :disabled="to ? undefined : disabled"
    :class="classes"
  >
    <slot />
  </component>
</template>
