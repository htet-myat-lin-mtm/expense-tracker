<script setup lang="ts">
import { Menu } from "@lucide/vue";
import { useRoute } from "vue-router";

const emit = defineEmits<{ open: [] }>();

const route = useRoute();
</script>

<template>
  <nav class="sticky top-0 z-20 px-4 py-3 flex items-center justify-between bg-white/80 backdrop-blur border-b border-slate-200">
    <div class="flex items-center gap-2">
      <button
          type="button"
          class="p-2 rounded-lg bg-slate-900 text-white lg:hidden cursor-pointer"
          aria-label="Toggle navigation"
          @click="emit('open')"
      >
        <Menu class="w-5 h-5" />
      </button>
      <h2 class="text-lg font-semibold text-slate-900">{{ route.name }}</h2>
    </div>

    <div class="flex items-center gap-2">
      <p
          class="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-semibold"
      >
        E
      </p>
    </div>
  </nav>
</template>
