<script setup lang="ts">
import { LayoutDashboard, ReceiptText, CircleDollarSign, Wallet, X } from "@lucide/vue";
import { useRoute } from "vue-router";
import { ref, watch } from "vue";
import TopNavBar from "@/components/TopNavBar.vue";

const navLinks = [
  { label: "Dashboard", link: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", link: "/transactions", icon: ReceiptText },
  { label: "Budget", link: "/budget", icon: CircleDollarSign }
]

const route = useRoute()
const isOpen = ref<boolean>(false)

watch(() => route.path, () => {
  isOpen.value = false
})
</script>

<template>
  <div class="flex min-h-screen bg-slate-50">
    <div
        v-if="isOpen"
        class="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
        @click="isOpen = false"
    ></div>

    <aside
        class="fixed lg:sticky top-0 left-0 z-40 h-screen flex flex-col gap-1 bg-slate-900 text-slate-100 px-3 py-4 transition-transform duration-300 w-64 -translate-x-full lg:translate-x-0"
        :class="{ 'translate-x-0 shadow-xl': isOpen }"
    >
      <div class="flex gap-2 items-center mb-6 px-1">
        <div class="p-2.5 rounded-xl bg-indigo-500 text-white shrink-0">
          <Wallet class="w-5 h-5" />
        </div>
        <div class="text-slate-100 flex flex-col">
          <span class="text-lg font-bold leading-tight">Expense Tracker</span>
          <span class="text-xs text-slate-400">Personal finance</span>
        </div>
      </div>

      <button
          type="button"
          class="absolute top-2.5 right-1 p-2 rounded-lg bg-slate-900 text-slate-100 lg:hidden"
          aria-label="Toggle navigation"
          @click="isOpen = false"
      >
        <X class="w-5 h-5" />
      </button>

      <RouterLink
          v-for="(nav, index) in navLinks"
          :to="nav.link"
          class="flex gap-2.5 items-center py-2.5 px-3 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
          :class="{
            'bg-indigo-600 text-white': route.path === nav.link,
            'text-slate-300 hover:bg-slate-800 hover:text-white': route.path !== nav.link,
          }"
          :key="index"
      >
        <component :is="nav.icon" class="w-4 h-4 shrink-0" />
        <span>{{ nav.label }}</span>
      </RouterLink>

      <p class="px-3 mt-auto text-xs text-slate-500">
        Data is stored in this browser only.
      </p>
    </aside>

    <div class="flex-1 min-w-0">
      <TopNavBar @open="isOpen = true" />
      <main class="p-4 max-w-7xl mx-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>
