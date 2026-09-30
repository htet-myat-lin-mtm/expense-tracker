# Expense Tracker

A lightweight personal finance app for tracking income, expenses, and category budgets in the browser. It is built with Vue 3, TypeScript, Vite, and Tailwind CSS, and uses browser `localStorage` for persistence so there is no backend or database to run.

## Features

- Dashboard with balance, income, expenses, and category totals
- Transactions list with search, filters, pagination, and bulk actions
- Add, edit, and delete transaction workflows with validation
- Budget tracking by expense category with progress bars and over-budget warnings
- Responsive sidebar navigation and mobile-friendly layout
- Data persistence in the browser only

## Tech stack

| Concern    | Choice                             |
| ---------- | ---------------------------------- |
| Framework  | Vue 3.5                            |
| Language   | TypeScript                         |
| Build tool | Vite 8                             |
| Styling    | Tailwind CSS 3                     |
| Routing    | Vue Router 5                       |
| State      | Local composables + `localStorage` |
| Icons      | `@lucide/vue`                      |
| Toasts     | `vue-toastification`               |

## Requirements

- Node.js `^22.18.0 || >=24.12.0`
- npm

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:3000` and opens automatically. The app redirects to `/dashboard`.

## Scripts

| Script               | Description                                        |
| -------------------- | -------------------------------------------------- |
| `npm run dev`        | Start the Vite dev server                          |
| `npm run build`      | Run type-checking and build the production bundle  |
| `npm run build-only` | Create the production bundle without type checking |
| `npm run type-check` | Run `vue-tsc --build`                              |
| `npm run preview`    | Preview the production build                       |

## App structure

The app currently includes three main views:

- `/dashboard` — summary cards and category breakdowns
- `/transactions` — ledger management, filtering, and bulk deletion
- `/budget` — monthly category budget setup and spending tracking

## Data persistence

State is stored using a small storage wrapper and composables.

- `src/utils/storage.ts` exposes `STORAGE_KEYS`, `READ_STORAGE`, and `WRITE_STORAGE`
- `src/composables/useLocalStorage.ts` keeps a ref synced with localStorage
- `src/composables/useTransaction.ts` manages the transaction ledger
- `src/composables/useBudget.ts` manages the budget ledger

Current keys:

| Key                    | Contents         |
| ---------------------- | ---------------- |
| `expense:transactions` | Transaction list |
| `expense:budget`       | Budget list      |

Notes:

- The app does not seed data on first launch.
- Invalid JSON is safely ignored and falls back to the default value.
- Data remains in the browser only; clearing localStorage removes it.

## Data model

The core types live in `src/types/types.ts`.

```ts
interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: Category;
  date: string;
  note?: string;
}

interface Category {
  label: string;
  type: "income" | "expense";
}

interface Budget {
  category: Category;
  limitAmount: number;
}
```

Expense categories and income categories are defined in `src/utils/categories.ts` and are used to populate the form selectors and dashboard summaries.

## Project structure

```text
.
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── env.d.ts
├── public/
├── src/
│   ├── App.vue
│   ├── main.ts
│   ├── style.css
│   ├── components/
│   │   ├── Sidebar.vue
│   │   ├── TopNavBar.vue
│   │   └── common/
│   │       ├── Button.vue
│   │       ├── Card.vue
│   │       ├── Label.vue
│   │       ├── Modal.vue
│   │       ├── ProgressBar.vue
│   │       ├── SelectInput.vue
│   │       ├── StatCard.vue
│   │       └── TextInput.vue
│   ├── composables/
│   │   ├── useBudget.ts
│   │   ├── useLocalStorage.ts
│   │   └── useTransaction.ts
│   ├── router/
│   │   ├── index.ts
│   │   └── routes.ts
│   ├── types/
│   │   └── types.ts
│   ├── utils/
│   │   ├── categories.ts
│   │   ├── format.currency.ts
│   │   ├── format.date.ts
│   │   └── storage.ts
│   └── views/
│       ├── BudgetView.vue
│       ├── DashboardView.vue
│       └── TransactionsView.vue
└── README.md
```

## Notes

- There is no backend or user auth.
- The app is intended for a single browser/device instance.
- Budget and transaction data are local to the browser where they are created.
