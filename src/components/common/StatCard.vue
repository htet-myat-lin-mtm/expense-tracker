<script setup lang="ts">
interface Props {
  label: string;
  value: string;
  tone?: 'brand' | 'income' | 'expense' | 'budget';
  hint?: string;
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'brand',
  hint: '',
})

const iconClasses: Record<NonNullable<Props['tone']>, string> = {
  brand: 'bg-indigo-50 text-indigo-600',
  income: 'bg-emerald-50 text-emerald-600',
  expense: 'bg-rose-50 text-rose-600',
  budget: 'bg-amber-50 text-amber-600',
}
</script>

<template>
  <div class="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
    <div class="p-2.5 rounded-xl shrink-0" :class="iconClasses[props.tone]">
      <slot name="icon" />
    </div>
    <div class="min-w-0">
      <p class="text-xs font-medium tracking-wide text-slate-500 uppercase">{{ props.label }}</p>
      <p class="text-xl font-bold text-slate-900 truncate">{{ props.value }}</p>
      <p v-if="props.hint" class="text-xs text-slate-400 truncate">{{ props.hint }}</p>
    </div>
  </div>
</template>
