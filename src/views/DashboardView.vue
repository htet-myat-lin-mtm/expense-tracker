<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  ChartPie,
  Inbox,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "@lucide/vue";
import Button from "@/components/common/Button.vue";
import Card from "@/components/common/Card.vue";
import ProgressBar from "@/components/common/ProgressBar.vue";
import StatCard from "@/components/common/StatCard.vue";
import { formatCurrency } from "@/utils/format.currency.ts";
import { ALL_CATEGORIES } from "@/utils/categories.ts";
import { useTransaction } from "@/composables/useTransaction.ts";
import type { Transaction, TransactionType } from "@/types/types.ts";

const router = useRouter();

const {
  transactions,
  totalIncome,
  totalExpense,
  balance,
  recentTransactions,
  getIncomeByCategory,
  getExpenseByCategory,
} = useTransaction();

const amount = (value: number) => formatCurrency(value);

const signedAmount = (transaction: Transaction) => {
  const sign = transaction.type === "income" ? "+" : "-";
  return `${sign}${formatCurrency(transaction.amount)}`;
};

const usedCategories = computed(
  () => new Set(transactions.value.map((t) => t.category.label)).size,
);

/** "Other" exists in both lists, so count distinct labels rather than raw entries. */
const totalCategories = computed(
  () => new Set(ALL_CATEGORIES.map((c) => c.label)).size,
);

const categoryPercentages = (categories: Map<string, number>, type: TransactionType) => {
  const shares = [...categories].map(([label, value]) => {
    const exact = (value / (type === 'expense' ? totalExpense.value : totalIncome.value)) * 100;
    const whole = Math.floor(exact);
    const remainder = exact - whole;
    return { label, whole, remainder: remainder };
  })

  const remaining = 100 - shares.reduce((sum, share) => sum + share.whole, 0);
  shares.sort((a, b) => b.remainder - a.remainder)
    .slice(0, remaining)
    .forEach(share => share.whole++)

  return new Map(shares.map(({ label, whole }) => [label, whole]));
}

const expensePercentages = computed(() => categoryPercentages(getExpenseByCategory.value, 'expense'))
const incomePercentages = computed(() => categoryPercentages(getIncomeByCategory.value, 'income'))
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Dashboard</h1>
        <p class="text-sm text-slate-500">
          {{ transactions.length }} {{ transactions.length === 1 ? "transaction" : "transactions" }} tracked
        </p>
      </div>

      <Button @click="router.push('/transactions')">
        <Plus class="w-4 h-4" />
        Add transaction
      </Button>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Balance" :value="amount(balance)" tone="brand" hint="Income minus expenses">
        <template #icon>
          <Wallet class="w-5 h-5" />
        </template>
      </StatCard>

      <StatCard label="Total income" :value="amount(totalIncome)" tone="income" hint="All recorded earnings">
        <template #icon>
          <TrendingUp class="w-5 h-5" />
        </template>
      </StatCard>

      <StatCard label="Total expense" :value="amount(totalExpense)" tone="expense" hint="All recorded spending">
        <template #icon>
          <TrendingDown class="w-5 h-5" />
        </template>
      </StatCard>

      <StatCard
          label="Categories used"
          :value="`${usedCategories} of ${totalCategories}`"
          tone="budget"
          :hint="`Top spend: ${totalExpense}`"
      >
        <template #icon>
          <ChartPie class="w-5 h-5" />
        </template>
      </StatCard>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <Card title="Expense by category" :subtitle="`${amount(totalExpense)} spent in total`">
        <template #action>
          <span class="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <ChartPie class="w-3.5 h-3.5" />
            {{ [...getExpenseByCategory.keys()].length }}
            {{ [...getExpenseByCategory.keys()].length === 1 ? "category" : "categories" }}
          </span>
        </template>

        <ul v-if="[...getExpenseByCategory.keys()].length > 0" class="space-y-3">
          <li v-for="(row, index) in [...getExpenseByCategory.keys()]" :key="index" class="space-y-1.5">
            <div class="flex items-center gap-2 text-sm">
              <span class="font-medium text-slate-700">{{ row }}</span>
              <span class="ml-auto font-semibold text-slate-800">{{ amount(getExpenseByCategory.get(row) as number) }}</span>
              <span class="w-10 text-right text-xs text-slate-400">{{ expensePercentages.get(row) ?? 0 }}%</span>
            </div>
            <ProgressBar :ratio="getExpenseByCategory.get(row) as number / totalExpense" height="sm" />
          </li>
        </ul>

        <div v-else class="flex flex-col items-center gap-2 py-8 text-center">
          <TrendingDown class="w-9 h-9 text-slate-300" />
          <p class="text-sm font-medium text-slate-700">No expenses yet</p>
          <p class="text-sm text-slate-500">Expense entries will show up here.</p>
        </div>
      </Card>

      <Card title="Income by category" :subtitle="`${amount(totalIncome)} earned in total`">
        <template #action>
          <span class="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <TrendingUp class="w-3.5 h-3.5" />
            {{ [...getIncomeByCategory.keys()].length }}
            {{ [...getIncomeByCategory.keys()].length === 1 ? "category" : "categories" }}
          </span>
        </template>

        <ul v-if="[...getIncomeByCategory.keys()].length > 0" class="space-y-3">
          <li v-for="(row, index) in [...getIncomeByCategory.keys()]" :key="index" class="space-y-1.5">
            <div class="flex items-center gap-2 text-sm">
              <span class="font-medium text-slate-700">{{ row }}</span>
              <span class="ml-auto font-semibold text-emerald-700">{{ amount(getIncomeByCategory.get(row) as number) }}</span>
              <span class="w-10 text-right text-xs text-slate-400">{{ incomePercentages.get(row) ?? 0 }}%</span>
            </div>
            <ProgressBar :ratio="getIncomeByCategory.get(row) as number / totalIncome" height="sm" tone="income" />
          </li>
        </ul>

        <div v-else class="flex flex-col items-center gap-2 py-8 text-center">
          <Wallet class="w-9 h-9 text-slate-300" />
          <p class="text-sm font-medium text-slate-700">No income yet</p>
          <p class="text-sm text-slate-500">Record a paycheck to see it here.</p>
        </div>
      </Card>
    </div>

    <Card title="Recent transactions" subtitle="Last 5 entries">
      <template #action>
        <button
            type="button"
            class="text-sm font-medium text-indigo-600 cursor-pointer hover:underline"
            @click="router.push('/transactions')"
        >
          All
        </button>
      </template>

      <ul v-if="recentTransactions.length > 0" class="divide-y divide-slate-100">
        <li
            v-for="transaction in recentTransactions"
            :key="transaction.id"
            class="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
        >
          <div class="min-w-0">
            <p class="text-sm font-medium text-slate-800 truncate">
              {{ transaction.note || transaction.category.label }}
            </p>
            <p class="text-xs text-slate-500">
              {{ transaction.category.label }} &middot; {{ transaction.date }}
            </p>
          </div>

          <span
              class="ml-auto text-sm font-semibold whitespace-nowrap"
              :class="transaction.type === 'income' ? 'text-emerald-600' : 'text-slate-800'"
          >
            {{ signedAmount(transaction) }}
          </span>
        </li>
      </ul>

      <div v-else class="flex flex-col items-center gap-2 py-8 text-center">
        <Inbox class="w-9 h-9 text-slate-300" />
        <p class="text-sm font-medium text-slate-700">No transactions yet</p>
        <p class="text-sm text-slate-500">Add your first entry to see it here.</p>
        <Button size="sm" @click="router.push('/transactions')">
          <Plus class="w-4 h-4" />
          Add transaction
        </Button>
      </div>
    </Card>
  </div>
</template>
