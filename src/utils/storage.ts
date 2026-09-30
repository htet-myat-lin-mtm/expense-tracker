import type {StorageKeyType} from "@/types/types.ts";

export const STORAGE_KEYS = {
    transactions: 'expense:transactions',
    budget: 'expense:budget',
} as const;

export const STORAGE = window.localStorage;

export const READ_STORAGE = (key: StorageKeyType): unknown => {
    try {
        const raw = STORAGE.getItem(key);
        if (raw) return JSON.parse(raw);
        return undefined;
    } catch {
        return undefined;
    }
}

export const WRITE_STORAGE = (key: StorageKeyType, value: unknown): void => {
    try {
        STORAGE.setItem(key, JSON.stringify(value));
    } catch {}
}