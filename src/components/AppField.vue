<script setup>
import { useId } from 'vue'

/**
 * AppField
 *
 * Labelled text input. Unlike the original design, which relied on
 * placeholder-only fields, this keeps a persistent visible label so the form
 * stays understandable once values are filled in.
 */
const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: undefined },
  error: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const inputId = useId()
const errorId = `${inputId}-error`
</script>

<template>
  <div>
    <label :for="inputId" class="mb-1.5 block text-[13px] font-semibold text-muted">
      {{ props.label }}
    </label>

    <div class="relative">
      <span
        v-if="$slots.leading"
        class="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
      >
        <slot name="leading" />
      </span>

      <input
        :id="inputId"
        :type="props.type"
        :value="props.modelValue"
        :placeholder="props.placeholder"
        :autocomplete="props.autocomplete"
        :aria-invalid="props.error ? 'true' : undefined"
        :aria-describedby="props.error ? errorId : undefined"
        class="h-13 w-full rounded-full bg-surface text-[15px] font-medium text-ink transition-colors placeholder:font-normal placeholder:text-muted/70 focus:bg-panel"
        :class="[$slots.leading ? 'pl-11' : 'pl-5', $slots.trailing ? 'pr-13' : 'pr-5']"
        @input="$emit('update:modelValue', $event.target.value)"
      />

      <slot name="trailing" />
    </div>

    <p v-if="props.error" :id="errorId" class="mt-1.5 text-[12px] font-semibold text-red-700">
      {{ props.error }}
    </p>
  </div>
</template>
