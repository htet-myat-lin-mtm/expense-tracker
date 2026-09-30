<script setup lang="ts">
import {X} from "@lucide/vue";

interface Props {
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: 'md',
  closeOnOverlayClick: true,
})

const emit = defineEmits<{ close: [] }>()

const isOpen = defineModel<boolean>({ default: false })

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

function onOverlayClick() {
  if (props.closeOnOverlayClick) {
    close()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

function close() {
  isOpen.value = false
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-200"
        leave-to-class="opacity-0"
    >
      <div
          v-if="isOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          @click.self="onOverlayClick"
          @keydown="onKeydown"
      >
        <div
            class="w-full bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]"
            :class="sizeClasses[props.size]"
            role="dialog"
            aria-modal="true"
        >
          <div v-if="props.title || $slots.header" class="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-200">
            <slot name="header">
              <h3 class="text-base font-semibold text-slate-800">{{ props.title }}</h3>
            </slot>
            <button
                type="button"
                class="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                aria-label="Close"
                @click="close"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="px-4 py-4 overflow-y-auto">
            <slot />
          </div>

          <div v-if="$slots.footer" class="px-4 py-3 border-t border-slate-200 flex justify-end gap-2">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
