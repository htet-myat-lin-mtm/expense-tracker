<script setup lang="ts">
import { computed } from "vue";

interface Option {
  label: string;
  value: string | number;
}

interface Props {
  id?: string;
  placeholder?: string;
  options: Option[];
  disabled?: boolean;
  invalid?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option',
  disabled: false,
  invalid: false,
})

const value = defineModel<string | number>()

/** A real "All ..." option carries an empty value, so the hint must not compete with it. */
const hasEmptyOption = computed(() => props.options.some((option) => String(option.value) === ''))

/** The hint is only useful while nothing meaningful is selected. */
const showPlaceholder = computed(
  () => !hasEmptyOption.value && (value.value === '' || value.value === undefined || value.value === null),
)
</script>

<template>
  <select
      :id="props.id"
      v-model="value"
      :disabled="props.disabled"
      :aria-invalid="props.invalid"
      class="w-full px-3 py-2 text-sm text-slate-800 bg-white border rounded-lg shadow-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
      :class="props.invalid
        ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
        : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'"
  >
    <option v-if="showPlaceholder" value="" disabled>{{ props.placeholder }}</option>
    <option
        v-for="option in props.options"
        :key="option.value"
        :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>
