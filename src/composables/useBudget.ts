import {useLocalStorage} from "@/composables/useLocalStorage.ts";
import {STORAGE_KEYS} from "@/utils/storage.ts";
import type {Budget} from "@/types/types.ts";
import {computed} from "vue";

export const useBudget = () => {
    const budgets = useLocalStorage<Budget[]>(STORAGE_KEYS.budget, [])

    const budgetCategories = computed(() => budgets.value.map(b => b.category.label))

    const addOrUpdateBudget = (budget: Budget)=> {
        if (budgetCategories.value.includes(budget.category.label)) {
            budgets.value = budgets.value.map(b =>
                b.category.label === budget.category.label
                ? { ...b, limitAmount: b.limitAmount + budget.limitAmount }
                : b
            );
        } else {
            budgets.value.push(budget);
        }
    }

    const deleteBudget = (category: string) => {
        budgets.value = budgets.value.filter(b => b.category.label !== category)
    }

    const getBudgetByCategory = () => {
        const map = new Map<string, number>()
        budgets.value.forEach(b => {
            map.set(b.category.label, b.limitAmount)
        })
        return map
    }

    return {
        budgets,
        addOrUpdateBudget,
        deleteBudget,
        getBudgetByCategory,
    }
}