<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/useAppStore'
import AppField from '@/components/AppField.vue'
import AppButton from '@/components/AppButton.vue'
import LogoMark from '@/components/icons/LogoMark.vue'
import AccountCircleIcon from '@/components/icons/AccountCircleIcon.vue'
import LockIcon from '@/components/icons/LockIcon.vue'
import EyeIcon from '@/components/icons/EyeIcon.vue'
import EyeOffIcon from '@/components/icons/EyeOffIcon.vue'

const router = useRouter()
const { state, login, clearError } = useAppStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errors = ref({ email: '', password: '' })

async function onSubmit() {
  clearError()
  errors.value = {
    email: email.value.trim() ? '' : 'Enter your email address.',
    password: password.value ? '' : 'Enter your password.',
  }

  if (errors.value.email || errors.value.password) return

  const ok = await login({ email: email.value.trim(), password: password.value })
  if (ok) router.push({ name: 'home' })
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <!-- Brand panel -->
    <header
      class="flex flex-col items-center justify-center gap-4 rounded-b-sheet bg-panel px-6 pt-14 pb-12"
    >
      <LogoMark class="h-20 w-30 text-brand" />

      <div class="text-center">
        <h1 class="text-[40px] leading-none font-bold tracking-tight text-brand">RIDEMATE</h1>
        <p class="mt-2 text-[11px] font-bold tracking-[0.18em] text-brand/80">
          COMBINING CLASS AND COMMUTE
        </p>
      </div>
    </header>

    <!-- Form sheet -->
    <main class="-mt-6 flex flex-1 flex-col rounded-t-sheet bg-white px-6 pt-8 pb-8 shadow-card">
      <h2 class="text-[22px] font-bold text-ink">Welcome back</h2>
      <p class="mt-1 text-[14px] text-muted">Sign in to book your next ride.</p>

      <form class="mt-7 flex flex-col gap-5" novalidate @submit.prevent="onSubmit">
        <AppField
          v-model="email"
          label="Email"
          type="email"
          placeholder="you@kmitl.ac.th"
          autocomplete="email"
          :error="errors.email"
        >
          <template #leading><AccountCircleIcon class="size-full" /></template>
        </AppField>

        <AppField
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Your password"
          autocomplete="current-password"
          :error="errors.password"
        >
          <template #leading><LockIcon class="size-full" /></template>
          <template #trailing>
            <button
              type="button"
              class="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:text-ink"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              <component :is="showPassword ? EyeOffIcon : EyeIcon" class="size-5" />
            </button>
          </template>
        </AppField>

        <p
          v-if="state.error"
          class="rounded-card bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700"
        >
          {{ state.error }}
        </p>

        <AppButton type="submit" class="mt-2" :disabled="state.loading">
          {{ state.loading ? 'SIGNING IN…' : 'LOGIN' }}
        </AppButton>
      </form>

      <p class="mt-auto pt-8 text-center text-[13px] font-semibold text-ink">
        Don't have an account?
        <RouterLink to="/" class="text-link underline-offset-2 hover:underline">Sign up</RouterLink>
      </p>
    </main>
  </div>
</template>
