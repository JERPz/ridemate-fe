<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { chatApi, ApiError } from '@/api'
import ScreenHeader from '@/components/ScreenHeader.vue'
import BottomNav from '@/components/BottomNav.vue'
import SendIcon from '@/components/icons/SendIcon.vue'

/**
 * ChatView
 *
 * Support chat backed by the chat API (mock or real). Messages are loaded on
 * mount and posted through the API; the backend decides any auto-reply.
 */
const messages = ref([])
const draft = ref('')
const listEl = ref(null)
const sending = ref(false)
const error = ref('')

async function scrollToBottom() {
  await nextTick()
  if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight
}

onMounted(async () => {
  try {
    const { messages: loaded } = await chatApi.messages()
    messages.value = loaded
    scrollToBottom()
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Could not load messages.'
  }
})

async function send() {
  const text = draft.value.trim()
  if (!text || sending.value) return

  error.value = ''
  sending.value = true
  // Optimistically show the sent message.
  const optimistic = { id: `tmp-${Date.now()}`, from: 'me', text }
  messages.value.push(optimistic)
  draft.value = ''
  scrollToBottom()

  try {
    // Re-fetch to pick up the persisted message plus any agent reply.
    await chatApi.send(text)
    const { messages: refreshed } = await chatApi.messages()
    messages.value = refreshed
    scrollToBottom()
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Message failed to send.'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader title="Chat" />

    <main class="flex flex-1 flex-col overflow-hidden rounded-t-sheet bg-panel">
      <div ref="listEl" class="flex-1 space-y-3 overflow-y-auto px-5 py-6">
        <div
          v-for="m in messages"
          :key="m.id"
          class="flex"
          :class="m.from === 'me' ? 'justify-end' : 'justify-start'"
        >
          <p
            class="max-w-[78%] rounded-2xl px-4 py-2.5 text-[14px] leading-snug shadow-soft"
            :class="
              m.from === 'me'
                ? 'rounded-br-md bg-brand font-medium text-white'
                : 'rounded-bl-md bg-white text-ink'
            "
          >
            {{ m.text }}
          </p>
        </div>
      </div>

      <form class="flex items-center gap-2 border-t border-black/5 bg-white p-3" @submit.prevent="send">
        <input
          v-model="draft"
          type="text"
          placeholder="Type a message…"
          aria-label="Message"
          class="h-12 flex-1 rounded-full bg-surface px-5 text-[15px] text-ink transition-colors placeholder:text-muted/70 focus:bg-panel"
        />
        <button
          type="submit"
          class="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-white transition-[transform,background-color] hover:bg-brand-dark active:scale-95 disabled:opacity-40"
          :disabled="!draft.trim() || sending"
          aria-label="Send message"
        >
          <SendIcon class="size-5" />
        </button>
      </form>
    </main>

    <BottomNav />
  </div>
</template>
