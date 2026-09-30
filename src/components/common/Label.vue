<script setup lang="ts">
interface Props {
  id?: string;
  for?: string;
}

const props = withDefaults(defineProps<Props>(), {
  for: undefined,
})
</script>

<template>
  <label
      :for="props.id || props.for"
      class="flex items-center gap-1 mb-1.5 text-sm font-medium leading-5 text-slate-700"
  >
    <slot />
  </label>
</template>
