<script setup lang="ts">
interface Props {
  /** 0 - 1, values above 1 render as a full bar. */
  ratio: number;
  tone?: 'brand' | 'safe' | 'warning' | 'over' | 'income';
  height?: 'sm' | 'md';
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'brand',
  height: 'md',
})

const fillClasses = {
  brand: 'bg-indigo-600',
  safe: 'bg-emerald-500',
  warning: 'bg-amber-500',
  over: 'bg-rose-500',
  income: 'bg-emerald-500',
}

const heightClasses = {
  sm: 'h-1.5',
  md: 'h-2',
}

const clamped = () => Math.min(Math.max(props.ratio, 0), 1);
</script>

<template>
  <div
      class="w-full overflow-hidden rounded-full"
      :class="[heightClasses[props.height], props.tone === 'over' ? 'bg-rose-100' : 'bg-slate-100']"
      role="progressbar"
      :aria-valuenow="Math.round(clamped() * 100)"
      aria-valuemin="0"
      aria-valuemax="100"
  >
    <div
        class="h-full rounded-full transition-all duration-500 ease-out"
        :class="fillClasses[props.tone]"
        :style="{ width: `${clamped() * 100}%` }"
    ></div>
  </div>
</template>
