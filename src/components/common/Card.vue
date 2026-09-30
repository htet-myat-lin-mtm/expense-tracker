<script setup lang="ts">
import { computed, useSlots } from 'vue'

interface Props {
  title?: string;
  subtitle?: string;
  padded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  padded: true,
})

const slots = useSlots()

/** A titleless card has no header padding, so the body has to supply its own top spacing. */
const hasHeader = computed(() => Boolean(props.title || props.subtitle || slots.header || slots.action))
</script>

<template>
  <section
      class="flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm"
  >
    <header
        v-if="hasHeader"
        class="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-3"
    >
      <slot name="header">
        <div>
          <h2 class="font-semibold text-slate-800">{{ props.title }}</h2>
          <p v-if="props.subtitle" class="text-sm text-slate-500">{{ props.subtitle }}</p>
        </div>
      </slot>

      <div v-if="$slots.action" class="flex items-center gap-2">
        <slot name="action" />
      </div>
    </header>

    <div :class="props.padded ? (hasHeader ? 'px-5 pb-5' : 'px-5 pt-5 pb-5') : ''">
      <slot />
    </div>
  </section>
</template>
