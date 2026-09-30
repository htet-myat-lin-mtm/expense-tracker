<script setup lang="ts">
import { computed, ref } from "vue";
import { Eraser, Inbox, Pencil, Plus, Search, Trash } from "@lucide/vue";
import { useToast } from "vue-toastification";
import Button from "@/components/common/Button.vue";
import Card from "@/components/common/Card.vue";
import Label from "@/components/common/Label.vue";
import Modal from "@/components/common/Modal.vue";
import SelectInput from "@/components/common/SelectInput.vue";
import TextInput from "@/components/common/TextInput.vue";
import { categoriesFor } from "@/utils/categories.ts";
import { formatCurrency } from "@/utils/format.currency.ts";
import { formatDate } from "@/utils/format.date.ts";
import { useTransaction } from "@/composables/useTransaction.ts";
import type { Transaction, TransactionType } from "@/types/types.ts";

const toast = useToast();

const {
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
} = useTransaction();

const typeOptions = [
  { label: "All types", value: "all" },
  { label: "Expenses", value: "expense" },
  { label: "Income", value: "income" },
];

const formTypeOptions = typeOptions.slice(1) as { label: string; value: TransactionType }[];

const categoryOptions = computed(() => [
  { label: "All categories", value: "all" },
  ...categoriesFor("expense").map((item) => ({ label: item.label, value: item.label })),
  ...categoriesFor("income").map((item) => ({ label: item.label, value: item.label })),
]);

const hasFilters = computed(
  () => Boolean(keyword.value) || type.value !== "all" || category.value !== "all" || Boolean(dateRange.value.from) || Boolean(dateRange.value.to),
);

const clearFilters = () => {
  keyword.value = "";
  type.value = "all";
  category.value = "all";
  dateRange.value = { from: "", to: "" };
};

const rangeFrom = computed(() => (filteredTransactions.value.length ? (page.value - 1) * pageSize.value + 1 : 0));
const rangeTo = computed(() => Math.min(page.value * pageSize.value, filteredTransactions.value.length));

const amount = (value: number) => formatCurrency(value);

const signedAmount = (transaction: Transaction) => {
  const sign = transaction.type === "income" ? "+" : "-";
  return `${sign}${formatCurrency(transaction.amount)}`;
};

const isFormOpen = ref(false);
const editingId = ref<string | null>(null);

const form = ref({
  type: "expense" as TransactionType,
  amount: "",
  category: categoriesFor("expense")[0]?.label ?? "",
  date: formatDate(),
  note: "",
});

const errors = ref<{ amount: string; category: string; date: string }>({
  amount: "",
  category: "",
  date: "",
});

const clearErrors = () => {
  errors.value = { amount: "", category: "", date: "" };
};

const validate = () => {
  const next = { amount: "", category: "", date: "" };
  const value = Number(form.value.amount);

  if (!String(form.value.amount).trim()) {
    next.amount = "Amount is required";
  } else if (Number.isNaN(value) || value <= 0) {
    next.amount = "Amount must be greater than 0";
  }

  if (!form.value.category) {
    next.category = "Category is required";
  }

  if (!form.value.date) {
    next.date = "Date is required";
  }

  errors.value = next;
  return !next.amount && !next.category && !next.date;
};

const formCategoryOptions = computed(() =>
  categoriesFor(form.value.type).map((item) => ({ label: item.label, value: item.label })),
);

const openCreate = () => {
  editingId.value = null;
  form.value = {
    type: "expense",
    amount: "",
    category: categoriesFor("expense")[0]?.label ?? "",
    date: formatDate(),
    note: "",
  };
  clearErrors();
  isFormOpen.value = true;
};

const openEdit = (transaction: Transaction) => {
  editingId.value = transaction.id;
  form.value = {
    type: transaction.type,
    amount: String(transaction.amount),
    category: transaction.category.label,
    date: transaction.date,
    note: transaction.note ?? "",
  };
  clearErrors();
  isFormOpen.value = true;
};

const setType = (value: TransactionType) => {
  form.value.type = value;
  const labels = categoriesFor(value).map((item) => item.label);
  if (!labels.includes(form.value.category)) {
    form.value.category = labels[0] ?? "";
  }
};

const submitForm = () => {
  if (!validate()) return;

  const payload = {
    type: form.value.type,
    amount: Number(Number(form.value.amount).toFixed(2)),
    category: { label: form.value.category, type: form.value.type },
    date: form.value.date,
    note: form.value.note,
  };

  if (editingId.value) {
    updateTransaction(editingId.value, payload);
    toast.success("Transaction updated");
  } else {
    addTransaction(payload);
    toast.success("Transaction added");
  }

  isFormOpen.value = false;
};

const pendingDelete = ref<Transaction | null>(null);
const isDeleteOpen = ref(false);

const askDelete = (transaction: Transaction) => {
  pendingDelete.value = transaction;
  isDeleteOpen.value = true;
};

const confirmDelete = () => {
  if (!pendingDelete.value) return;
  deleteTransaction(pendingDelete.value.id);
  isDeleteOpen.value = false;
  pendingDelete.value = null;
  toast.success("Transaction deleted");
};

const isBulkDeleteOpen = ref(false);

const selectedTotal = computed(() =>
  selectedTransactions.value.reduce((sum, t) => sum + t.amount, 0),
);

const confirmBulkDelete = () => {
  const removed = bulkDeleteTransactions();
  isBulkDeleteOpen.value = false;
  toast.success(`${removed} ${removed === 1 ? "transaction" : "transactions"} deleted`);
};

const cancelBulkDelete = () => {
  clearSelection();
  isBulkDeleteOpen.value = false;
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Transactions</h1>
        <p class="text-sm text-slate-500">
          {{ filteredTransactions.length }} of {{ transactions.length }} entries
        </p>
      </div>

      <Button @click="openCreate">
        <Plus class="w-4 h-4" />
        Add transaction
      </Button>
    </div>

    <Card>
      <div class="grid gap-3 lg:grid-cols-4">
        <div class="lg:col-span-2">
          <Label for="transaction-search">Search</Label>
          <div class="relative">
            <Search class="absolute w-4 h-4 text-slate-400 -translate-y-1/2 left-3 top-1/2" />
            <input
                id="transaction-search"
                v-model="keyword"
                type="search"
                placeholder="Search notes, categories, amounts or dates"
                class="w-full py-2 pl-9 pr-3 text-sm text-slate-800 bg-white border border-slate-300 rounded-lg shadow-sm transition-colors placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <Label for="transaction-type">Type</Label>
          <SelectInput id="transaction-type" v-model="type" :options="typeOptions" />
        </div>

        <div>
          <Label for="transaction-category">Category</Label>
          <SelectInput id="transaction-category" v-model="category" :options="categoryOptions" />
        </div>

        <div>
          <Label for="transaction-from">From</Label>
          <input
              id="transaction-from"
              v-model="dateRange.from"
              type="date"
              class="w-full px-3 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <Label for="transaction-to">To</Label>
          <input
              id="transaction-to"
              v-model="dateRange.to"
              type="date"
              class="w-full px-3 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100">
        <div class="flex flex-wrap items-center gap-4 text-sm">
          <span class="text-slate-500">
            Income <span class="font-semibold text-emerald-600">{{ amount(totalIncome) }}</span>
          </span>
          <span class="text-slate-500">
            Expenses <span class="font-semibold text-rose-600">{{ amount(totalExpense) }}</span>
          </span>
          <span class="text-slate-500">
            Balance
            <span class="font-semibold" :class="balance < 0 ? 'text-rose-600' : 'text-slate-800'">
              {{ amount(balance) }}
            </span>
          </span>
        </div>

        <Button v-if="hasFilters" variant="ghost" size="sm" @click="clearFilters">
          <Eraser class="w-4 h-4" />
          Clear filters
        </Button>
      </div>
    </Card>

    <div
        class="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm"
    >
      <label class="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
        <input
            type="checkbox"
            class="w-4 h-4 rounded cursor-pointer accent-indigo-600"
            :checked="isAllChecked"
            :indeterminate.prop="isSelectionPartial"
            :disabled="filteredTransactions.length === 0"
            @change="toggleSelectAll"
        />
        Select all
        <span class="text-xs text-slate-400">({{ filteredTransactions.length }})</span>
      </label>

      <div v-if="selectedIds.length > 0" class="flex flex-wrap items-center gap-2">
        <p class="text-sm text-slate-600">
          <span class="font-medium text-slate-800">{{ selectedIds.length }}</span> selected
          <span class="text-slate-400">&middot; {{ amount(selectedTotal) }}</span>
        </p>
        <Button variant="secondary" size="sm" @click="clearSelection">Clear</Button>
        <Button variant="danger" size="sm" @click="isBulkDeleteOpen = true">
          <Trash class="w-4 h-4" />
          Delete selected
        </Button>
      </div>
    </div>

    <Card v-if="filteredTransactions.length === 0" title="Nothing to show">
      <div class="flex flex-col items-center gap-3 py-8 text-center">
        <Inbox class="w-10 h-10 text-slate-300" />
        <p class="text-sm text-slate-500">Try a wider date range or clear the filters.</p>
        <Button size="sm" variant="secondary" @click="clearFilters">
          <Eraser class="w-4 h-4" />
          Clear filters
        </Button>
      </div>
    </Card>

    <div v-else class="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
      <table class="w-full text-sm text-left">
        <thead class="text-xs tracking-wide text-slate-500 uppercase bg-slate-50">
        <tr>
          <th scope="col" class="w-10 px-4 py-3">
            <span class="sr-only">Select</span>
          </th>
          <th scope="col" class="px-4 py-3 font-medium">Transaction</th>
          <th scope="col" class="px-4 py-3 font-medium">Category</th>
          <th scope="col" class="px-4 py-3 font-medium">Date</th>
          <th scope="col" class="px-4 py-3 font-medium">Note</th>
          <th scope="col" class="px-4 py-3 font-medium text-right">Amount</th>
          <th scope="col" class="w-24 px-4 py-3 font-medium text-right">Actions</th>
        </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
        <tr
            v-for="transaction in paginatedTransactions"
            :key="transaction.id"
            class="transition-colors"
            :class="isIndividualChecked(transaction.id) ? 'bg-indigo-50/60' : 'hover:bg-slate-50'"
        >
          <td class="px-4 py-3">
            <input
                type="checkbox"
                class="w-4 h-4 rounded cursor-pointer accent-indigo-600"
                :checked="isIndividualChecked(transaction.id)"
                :aria-label="`Select ${transaction.note || 'transaction'}`"
                @change="toggleCheckItem(transaction.id)"
            />
          </td>
          <td class="px-4 py-3">
            <p class="text-xs" :class="transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'">
              {{ transaction.type === "income" ? "Income" : "Expense" }}
            </p>
          </td>
          <td class="px-4 py-3 text-slate-600">{{ transaction.category.label }}</td>
          <td class="px-4 py-3 whitespace-nowrap text-slate-600">{{ transaction.date }}</td>
          <td class="px-4 py-3">{{ transaction.note || "-" }}</td>
          <td
              class="px-4 py-3 text-right font-semibold whitespace-nowrap"
              :class="transaction.type === 'income' ? 'text-emerald-600' : 'text-slate-800'"
          >
            {{ signedAmount(transaction) }}
          </td>
          <td class="px-4 py-3">
            <div class="flex justify-end gap-1">
              <button
                  type="button"
                  class="p-2 text-indigo-600 rounded-lg hover:bg-indigo-50 cursor-pointer"
                  :aria-label="`Edit ${transaction.note || 'transaction'}`"
                  @click="openEdit(transaction)"
              >
                <Pencil class="w-4 h-4" />
              </button>
              <button
                  type="button"
                  class="p-2 text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                  :aria-label="`Delete ${transaction.note || 'transaction'}`"
                  @click="askDelete(transaction)"
              >
                <Trash class="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div
        v-if="filteredTransactions.length > 0"
        class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm"
    >
      <p class="text-sm text-slate-500">
        Showing <span class="font-medium text-slate-700">{{ rangeFrom }}</span>
        &ndash;
        <span class="font-medium text-slate-700">{{ rangeTo }}</span>
        of <span class="font-medium text-slate-700">{{ filteredTransactions.length }}</span>
      </p>

      <div class="flex items-center gap-2">
        <div class="w-32">
          <SelectInput
              v-model="pageSize"
              :options="[5, 10, 25, 50].map((size) => ({ label: `${size} per page`, value: size }))"
              placeholder="Per page"
          />
        </div>
        <Button size="sm" variant="secondary" :disabled="page === 1" @click="previousPage">Prev</Button>
        <span class="text-sm text-slate-500">{{ page }} / {{ totalPages }}</span>
        <Button size="sm" variant="secondary" :disabled="page === totalPages" @click="nextPage">Next</Button>
      </div>
    </div>

    <Modal v-model="isFormOpen" :title="editingId ? 'Edit transaction' : 'Add transaction'" size="md" :closeOnOverlayClick="false">
      <form id="transaction-form" class="space-y-4" novalidate @submit.prevent="submitForm">
        <div>
          <Label>Type</Label>
          <div class="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
            <button
                v-for="option in formTypeOptions"
                :key="option.value"
                type="button"
                class="py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors"
                :class="form.type === option.value ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'"
                @click="setType(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <Label for="form-amount">Amount <span class="text-rose-500">*</span></Label>
            <TextInput
                id="form-amount"
                v-model="form.amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                :invalid="Boolean(errors.amount)"
            />
            <p v-if="errors.amount" class="mt-1 text-xs text-rose-600">{{ errors.amount }}</p>
          </div>
          <div>
            <Label for="form-date">Date <span class="text-rose-500">*</span></Label>
            <input
                id="form-date"
                v-model="form.date"
                type="date"
                :aria-invalid="Boolean(errors.date)"
                class="w-full px-3 py-2 text-sm text-slate-800 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2"
                :class="errors.date
                  ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                  : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'"
            />
            <p v-if="errors.date" class="mt-1 text-xs text-rose-600">{{ errors.date }}</p>
          </div>
        </div>

        <div>
          <Label for="form-category">Category <span class="text-rose-500">*</span></Label>
          <SelectInput
              id="form-category"
              v-model="form.category"
              :options="formCategoryOptions"
              :invalid="Boolean(errors.category)"
          />
          <p v-if="errors.category" class="mt-1 text-xs text-rose-600">{{ errors.category }}</p>
        </div>

        <div>
          <Label for="form-note">Note <span class="text-slate-400 font-normal">(optional)</span></Label>
          <TextInput id="form-note" v-model="form.note" placeholder="What was this for?" />
        </div>
      </form>

      <template #footer>
        <Button variant="secondary" @click="isFormOpen = false">Cancel</Button>
        <Button type="submit" form="transaction-form">Save</Button>
      </template>
    </Modal>

    <Modal v-model="isDeleteOpen" title="Delete transaction" size="sm">
      <p class="text-sm text-slate-600">
        Delete this item? This action cannot be undone.
      </p>

      <template #footer>
        <Button variant="secondary" @click="isDeleteOpen = false">Cancel</Button>
        <Button variant="danger" @click="confirmDelete">Delete</Button>
      </template>
    </Modal>

    <Modal v-model="isBulkDeleteOpen" title="Delete transactions" size="sm" :closeOnOverlayClick="false">
      <div class="space-y-3">
        <p class="text-sm text-slate-600">
          You are about to permanently delete {{ selectedIds.length > 1 ? 'these items' : 'this item' }}. This action cannot be undone.
        </p>
      </div>

      <template #footer>
        <Button variant="secondary" @click="cancelBulkDelete">Cancel</Button>
        <Button variant="danger" @click="confirmBulkDelete">
          <Trash class="w-4 h-4" />
          Delete {{ selectedIds.length }}
        </Button>
      </template>
    </Modal>
  </div>
</template>
