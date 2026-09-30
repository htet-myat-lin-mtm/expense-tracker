import type {Category, TransactionType} from "@/types/types.ts";

export const EXPENSE_CATEGORIES: Category[] = [
    {label: 'Food', type: 'expense'},
    {label: 'Transport', type: 'expense'},
    {label: 'Health', type: 'expense'},
    {label: 'Shopping', type: 'expense'},
    {label: 'Travel', type: 'expense'},
    {label: 'Fitness', type: 'expense'},
    {label: 'Bills & Fees', type: 'expense'},
    {label: 'Other Expense', type: 'expense'},
];

export const INCOME_CATEGORIES: Category[] = [
    {label: 'Salary', type: 'income'},
    {label: 'Freelance', type: 'income'},
    {label: 'Investment', type: 'income'},
    {label: 'Gift', type: 'income'},
    {label: 'Other Income', type: 'income'},
];

export const ALL_CATEGORIES: Category[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const categoriesFor = (type: TransactionType): Category[] => {
    return type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
};
