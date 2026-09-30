import {STORAGE_KEYS} from "@/utils/storage.ts";

export type StorageKeyType = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    category: Category;
    date: string;
    note?: string;
}

export type TransactionType = 'income' | 'expense';

export interface Category {
    label: string;
    type: TransactionType;
}

export interface Budget {
    category: Category;
    limitAmount: number;
}