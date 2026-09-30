<script setup lang="ts">
import { computed, ref } from "vue";
import { AlertTriangle, CircleDollarSign, Pencil, Plus, Target, Trash, TrendingDown, Wallet } from "@lucide/vue";
import { useToast } from "vue-toastification";
import Button from "@/components/common/Button.vue";
import Card from "@/components/common/Card.vue";
import Label from "@/components/common/Label.vue";
import Modal from "@/components/common/Modal.vue";
import ProgressBar from "@/components/common/ProgressBar.vue";
import SelectInput from "@/components/common/SelectInput.vue";
import StatCard from "@/components/common/StatCard.vue";
import TextInput from "@/components/common/TextInput.vue";
import { useBudget } from "@/composables/useBudget.ts";
import { useTransaction } from "@/composables/useTransaction.ts";
import { formatCurrency } from "@/utils/format.currency.ts";
import { EXPENSE_CATEGORIES } from "@/utils/categories.ts";
import type { TransactionType } from "@/types/types.ts";

const toast = useToast();

const {
  budgets,
  addOrUpdateBudget,
  deleteBudget,
} = useBudget();

const { getExpenseByCategory } = useTransaction();

const amount = (value: number) => formatCurrency(value);

const spentByCategory = computed(() => getExpenseByCategory());

type BudgetTone = "safe" | "warning" | "over";

interface BudgetRow {
  label: string;
  limit: number;
  spent: number;
  remaining: number;
  ratio: number;
  tone: BudgetTone;
}

const rows = computed<BudgetRow[]>(() =>
  budgets.value
    .map((budget) => {
      const spent = spentByCategory.value.get(budget.category.label) ?? 0;
      const ratio = budget.limitAmount > 0 ? spent / budget.limitAmount : 0;
      const tone: BudgetTone = ratio > 1 ? "over" : ratio >= 0.8 ? "warning" : "safe";
      return {
        label: budget.category.label,
        limit: budget.limitAmount,
        spent,
        remaining: budget.limitAmount - spent,
        ratio,
        tone,
      };
    })
    .sort((a, b) => b.ratio - a.ratio),
);

const totalBudget = computed(() => budgets.value.reduce((sum, b) => sum + b.limitAmount, 0));
const totalSpent = computed(() => rows.value.reduce((sum, row) => sum + row.spent, 0));
const totalRemaining = computed(() => totalBudget.value - totalSpent.value);
const overBudgetCount = computed(() => rows.value.filter((row) => row.spent > row.limit).length);
const allBudgeted = computed(() => budgets.value.length >= EXPENSE_CATEGORIES.length);

const isFormOpen = ref(false);
const editingLabel = ref<string | null>(null);

const form = ref({
  category: EXPENSE_CATEGORIES[0]?.label ?? "",
  limitAmount: "",
});

const errors = ref<{ category: string; limitAmount: string }>({
  category: "",
  limitAmount: "",
});

const clearErrors = () => {
  errors.value = { category: "", limitAmount: "" };
};

const categoryOptions = EXPENSE_CATEGORIES.map((category) => ({
  label: category.label,
  value: category.label,
}));

const usedLabels = computed(() => new Set(budgets.value.map((b) => b.category.label)));

const availableCategoryOptions = computed(() =>
  editingLabel.value
    ? categoryOptions.filter(
        (option) => option.value === editingLabel.value || !usedLabels.value.has(option.value),
      )
    : categoryOptions.filter((option) => !usedLabels.value.has(option.value)),
);

const openCreate = () => {
  editingLabel.value = null;
  form.value = {
    category:
      categoryOptions.find((option) => !usedLabels.value.has(option.value))?.value ??
      EXPENSE_CATEGORIES[0]?.label ??
      "",
    limitAmount: "",
  };
  clearErrors();
  isFormOpen.value = true;
};

const openEdit = (label: string) => {
  const budget = budgets.value.find((b) => b.category.label === label);
  if (!budget) return;
  editingLabel.value = label;
  form.value = { category: label, limitAmount: String(budget.limitAmount) };
  clearErrors();
  isFormOpen.value = true;
};

const validate = () => {
  const next = { category: "", limitAmount: "" };
  const value = Number(form.value.limitAmount);

  if (!form.value.category) next.category = "Category is required";
  if (!String(form.value.limitAmount).trim()) {
    next.limitAmount = "Amount is required";
  } else if (Number.isNaN(value) || value <= 0) {
    next.limitAmount = "Amount must be greater than 0";
  }

  errors.value = next;
  return !next.category && !next.limitAmount;
};

const submitForm = () => {
  if (!validate()) return;

  const payload = {
    category: { label: form.value.category, type: "expense" as TransactionType },
    limitAmount: Number(Number(form.value.limitAmount).toFixed(2)),
  };

  if (editingLabel.value) {
    deleteBudget(editingLabel.value);
    addOrUpdateBudget(payload);
    toast.success("Budget updated");
  } else {
    addOrUpdateBudget(payload);
    toast.success("Budget added");
  }

  editingLabel.value = null;
  isFormOpen.value = false;
};

const pendingDelete = ref<string | null>(null);
const isDeleteOpen = ref(false);

const askDelete = (label: string) => {
  pendingDelete.value = label;
  isDeleteOpen.value = true;
};

const confirmDelete = () => {
  if (!pendingDelete.value) return;
  deleteBudget(pendingDelete.value);
  isDeleteOpen.value = false;
  pendingDelete.value = null;
  toast.success("Budget deleted");
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Budget</h1>
        <p class="text-sm text-slate-500">
          {{ budgets.length }} {{ budgets.length === 1 ? "budget" : "budgets" }} set
        </p>
      </div>

      <Button :disabled="allBudgeted" @click="openCreate">
        <Plus class="w-4 h-4" />
        Add budget
      </Button>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
          label="Total budget"
          :value="amount(totalBudget)"
          tone="budget"
          :hint="`Across ${budgets.length} ${budgets.length === 1 ? 'category' : 'categories'}`"
      >
        <template #icon>
          <Target class="w-5 h-5" />
        </template>
      </StatCard>

      <StatCard label="Total spent" :value="amount(totalSpent)" tone="expense" hint="Spent in budgeted categories">
        <template #icon>
          <TrendingDown class="w-5 h-5" />
        </template>
      </StatCard>

      <StatCard label="Remaining" :value="amount(totalRemaining)" tone="income" hint="Budget minus total spent">
        <template #icon>
          <Wallet class="w-5 h-5" />
        </template>
      </StatCard>

      <StatCard
          label="Over budget"
          :value="`${overBudgetCount} of ${budgets.length}`"
          tone="brand"
          hint="Categories past their limit"
      >
        <template #icon>
          <AlertTriangle class="w-5 h-5" />
        </template>
      </StatCard>
    </div>

    <Card
        title="Budgets by category"
        :subtitle="budgets.length ? `${amount(totalSpent)} of ${amount(totalBudget)} used` : 'Set limits to start tracking'"
    >
      <template #action>
        <span class="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <CircleDollarSign class="w-3.5 h-3.5" />
          {{ budgets.length }}
          {{ budgets.length === 1 ? "budget" : "budgets" }}
        </span>
      </template>

      <ul v-if="rows.length > 0" class="space-y-4">
        <li v-for="row in rows" :key="row.label" class="space-y-1.5">
          <div class="flex items-center gap-2 text-sm">
            <span class="font-medium text-slate-700">{{ row.label }}</span>
            <span v-if="row.spent > row.limit" class="text-xs font-medium text-rose-600">
              Over by {{ amount(row.spent - row.limit) }}
            </span>
            <span v-else class="text-xs text-slate-400">{{ amount(row.remaining) }} left</span>

            <div class="ml-auto flex items-center gap-1">
              <button
                  type="button"
                  class="p-2 text-indigo-600 rounded-lg hover:bg-indigo-50 cursor-pointer"
                  :aria-label="`Edit ${row.label} budget`"
                  @click="openEdit(row.label)"
              >
                <Pencil class="w-4 h-4" />
              </button>
              <button
                  type="button"
                  class="p-2 text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                  :aria-label="`Delete ${row.label} budget`"
                  @click="askDelete(row.label)"
              >
                <Trash class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="flex-1">
              <ProgressBar :ratio="row.ratio" :tone="row.tone" />
            </div>
            <div class="text-right whitespace-nowrap">
              <span class="text-sm font-semibold text-slate-800">{{ amount(row.spent) }}</span>
              <span class="text-xs text-slate-400"> / {{ amount(row.limit) }}</span>
              <span class="ml-1 text-xs text-slate-400">{{ Math.min(Math.round(row.ratio * 100), 100) }}%</span>
            </div>
          </div>
        </li>
      </ul>

      <div v-else class="flex flex-col items-center gap-2 py-8 text-center">
        <Target class="w-9 h-9 text-slate-300" />
        <p class="text-sm font-medium text-slate-700">No budgets yet</p>
        <p class="text-sm text-slate-500">Set a monthly limit to track your spending.</p>
        <Button size="sm" @click="openCreate">
          <Plus class="w-4 h-4" />
          Add budget
        </Button>
      </div>
    </Card>

    <Modal v-model="isFormOpen" :title="editingLabel ? 'Edit budget' : 'Add budget'" size="md" :closeOnOverlayClick="false">
      <form id="budget-form" class="space-y-4" novalidate @submit.prevent="submitForm">
        <div>
          <Label for="budget-category">Category <span class="text-rose-500">*</span></Label>
          <SelectInput
              id="budget-category"
              v-model="form.category"
              :options="availableCategoryOptions"
              :invalid="Boolean(errors.category)"
          />
          <p v-if="errors.category" class="mt-1 text-xs text-rose-600">{{ errors.category }}</p>
        </div>

        <div>
          <Label for="budget-limit">Monthly limit <span class="text-rose-500">*</span></Label>
          <TextInput
              id="budget-limit"
              v-model="form.limitAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              :invalid="Boolean(errors.limitAmount)"
          />
          <p v-if="errors.limitAmount" class="mt-1 text-xs text-rose-600">{{ errors.limitAmount }}</p>
        </div>
      </form>

      <template #footer>
        <Button variant="secondary" @click="isFormOpen = false">Cancel</Button>
        <Button type="submit" form="budget-form">Save</Button>
      </template>
    </Modal>

    <Modal v-model="isDeleteOpen" title="Delete budget" size="sm">
      <p class="text-sm text-slate-600">
        Delete the budget for
        <span class="font-medium text-slate-800">{{ pendingDelete }}</span>? This action cannot be undone.
      </p>

      <template #footer>
        <Button variant="secondary" @click="isDeleteOpen = false">Cancel</Button>
        <Button variant="danger" @click="confirmDelete">Delete</Button>
      </template>
    </Modal>
  </div>
</template>