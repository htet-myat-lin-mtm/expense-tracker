import {computed, ref, watch} from "vue";
import {useLocalStorage} from "@/composables/useLocalStorage.ts";
import {STORAGE_KEYS} from "@/utils/storage.ts";
import type {Transaction, TransactionType} from "@/types/types.ts";

export const useTransaction = () => {
    const transactions = useLocalStorage<Transaction[]>(STORAGE_KEYS.transactions, [])
    const page = ref<number>(1)
    const pageSize = ref<number>(10)
    const type = ref<TransactionType | 'all'>('all')
    const category = ref<string>('all')
    const dateRange = ref<{from: string, to: string}>({from: '', to: ''})
    const keyword = ref<string>('')
    const selectedIds = ref<string[]>([])

    const totalIncome = computed(() => {
        return transactions.value
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0)
    })

    const totalExpense = computed(() => {
        return transactions.value
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)
    })

    const balance = computed(() => totalIncome.value - totalExpense.value)

    const getExpenseByCategory = () => {
        const map = new Map<string, number>()
        transactions.value.forEach(t => {
            if (t.type === 'expense') {
                map.set(t.category.label, (map.get(t.category.label) ?? 0) + t.amount)
            }
        })
        return map;
    }

    const getIncomeByCategory = () => {
        const map = new Map<string, number>()
        transactions.value.forEach(t => {
            if (t.type === 'income') {
                map.set(t.category.label, (map.get(t.category.label) ?? 0) + t.amount)
            }
        })
        return map;
    }

    const addTransaction = (payload: Partial<Transaction>) => {
        const transaction: Transaction = {
            id: crypto.randomUUID(),
            type: payload.type as TransactionType,
            amount: Number(payload.amount),
            category: {
                label: payload.category?.label as string,
                type: payload.category?.type as TransactionType
            },
            date: payload.date as string,
            ...(payload.note?.trim() ? { note: payload.note.trim() } : {}),
        }
        transactions.value.push(transaction)
    }

    const updateTransaction = (id: string, payload: Partial<Transaction>) => {
        const updated: Transaction = {
            id,
            type: payload.type as TransactionType,
            amount: Number(payload.amount),
            category: {
                label: payload.category?.label as string,
                type: payload.category?.type as TransactionType
            },
            date: payload.date as string,
            ...(payload.note?.trim() ? { note: payload.note.trim() } : {}),
        }

        transactions.value = transactions.value.map(tran => {
            return tran.id === id ? updated : tran;
        })
    }

    const deleteTransaction = (id: string) => {
        transactions.value = transactions.value.filter(transaction => transaction.id !== id)
    }

    const bulkDeleteTransactions = () => {
        if (selectedIds.value.length <= 0) return 0;
        const ids = selectedIds.value;
        transactions.value = transactions.value.filter(transaction => !ids.includes(transaction.id))
        selectedIds.value = []
        return ids.length
    }

    const isIndividualChecked = (id: string) : boolean => {
        return selectedIds.value.includes(id)
    }

    const isAllChecked = computed(() => {
        const rows = filteredTransactions.value
        return rows.length > 0 && rows.every(t => selectedIds.value.includes(t.id))
    })

    const isSelectionPartial = computed(() => {
        const rows = filteredTransactions.value
        return selectedIds.value.length > 0 && !isAllChecked.value
            && rows.some(t => selectedIds.value.includes(t.id))
    })

    const toggleCheckItem = (id: string) => {
        if (selectedIds.value.includes(id)) {
            selectedIds.value = selectedIds.value.filter(el => el !== id)
        } else {
            selectedIds.value.push(id)
        }
    }

    const toggleSelectAll = () => {
        if (isAllChecked.value) {
            selectedIds.value = []
            return
        }
        selectedIds.value = filteredTransactions.value.map(t => t.id)
    }

    const clearSelection = () => {
        selectedIds.value = []
    }

    const selectedTransactions = computed(() => {
        return transactions.value.filter(t => selectedIds.value.includes(t.id))
    })

    const sortedTransactions = computed(() => {
        return [...transactions.value].sort((a, b) => b.date.localeCompare(a.date))
    })

    const filteredTransactions = computed(() => {
        const search = keyword.value.trim().toLowerCase()
        const {from, to} = dateRange.value

        return sortedTransactions.value.filter(transaction => {
            if (type.value !== 'all' && transaction.type !== type.value) return false;
            if (category.value !== 'all' && transaction.category.label !== category.value) return false;
            if (from && transaction.date < from) return false;
            if (to && transaction.date > to) return false;
            if (!search) return true;

            return (
                (transaction.note ?? '').toLowerCase().includes(search) ||
                transaction.type.includes(search) ||
                transaction.category.label.toLowerCase().includes(search) ||
                transaction.date.includes(search) ||
                String(transaction.amount).includes(search)
            )
        })
    })

    const recentTransactions = computed(() => {
        return sortedTransactions.value.slice(0, 5);
    })

    const totalPages = computed(() => {
        return Math.max(1, Math.ceil(filteredTransactions.value.length / pageSize.value))
    })

    const paginatedTransactions = computed(() => {
        const start = pageSize.value * (page.value - 1);
        return filteredTransactions.value.slice(start, start + pageSize.value);
    })

    // A narrower result set can leave the current page out of range.
    watch([keyword, type, category, pageSize, () => dateRange.value.from, () => dateRange.value.to], () => {
        page.value = 1
    })

    watch(totalPages, (max) => {
        if (page.value > max) page.value = max
    })

    const nextPage = () => page.value = Math.min(page.value + 1, totalPages.value)

    const previousPage = () => page.value = Math.max(page.value - 1, 1)

    return {
        transactions,
        page,
        pageSize,
        type,
        category,
        dateRange,
        keyword,
        totalIncome,
        totalExpense,
        balance,
        recentTransactions,
        totalPages,
        filteredTransactions,
        paginatedTransactions,
        selectedIds,
        selectedTransactions,
        isAllChecked,
        isSelectionPartial,
        isIndividualChecked,
        toggleCheckItem,
        toggleSelectAll,
        clearSelection,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        bulkDeleteTransactions,
        nextPage,
        previousPage,
        getExpenseByCategory,
        getIncomeByCategory
    }
}
