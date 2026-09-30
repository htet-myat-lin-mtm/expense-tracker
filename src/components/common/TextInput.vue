<script setup lang="ts">
interface Props {
  id?: string;
  type?: 'text' | 'number' | 'date' | 'email' | 'password';
  placeholder?: string;
  min?: string;
  step?: string;
  disabled?: boolean;
  invalid?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  min: undefined,
  step: undefined,
  disabled: false,
  invalid: false,
})

const value = defineModel()
</script>

<template>
  <input
      :type="props.type"
      :id="props.id"
      :placeholder="props.placeholder"
      :min="props.min"
      :step="props.step"
      :disabled="props.disabled"
      :aria-invalid="props.invalid"
      v-model="value"
      class="w-full px-3 py-2 text-sm text-slate-800 bg-white border rounded-lg shadow-sm transition-colors placeholder-slate-400 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
      :class="props.invalid
        ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
        : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'"
  />
</template>
