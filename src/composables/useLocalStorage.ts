import type {StorageKeyType} from "@/types/types.ts";
import {READ_STORAGE, WRITE_STORAGE} from "@/utils/storage.ts";
import {ref, watch} from "vue";

export function useLocalStorage<T> (key: StorageKeyType, defaultValue: T){
  const data = READ_STORAGE(key);
  const state = ref<T>(data === undefined ? defaultValue : data as T);

  watch(state, (newVal) => {
    WRITE_STORAGE(key, newVal);
  }, {
    deep: true,
  })

  return state;
}