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

## Folder structure

```text
.
├── public/
│   └── favicon.ico          # Static assets served at the site root
├── src/
│   ├── App.vue              # Root shell: sidebar + top nav + <RouterView>
│   ├── main.ts              # App entry point: mounts app, registers router
│   ├── style.css            # Global styles + Tailwind directives
│   ├── components/          # Shared, reusable UI components
│   │   ├── Sidebar.vue      # Primary navigation
│   │   ├── TopNavBar.vue    # Header bar
│   │   └── common/          # Generic building-block components
│   ├── composables/         # State + logic units (composition API)
│   ├── router/              # Router instance and route definitions
│   ├── types/               # TypeScript interfaces and type aliases
│   ├── utils/               # Pure helper functions and constants
│   └── views/               # Route-level page components
├── index.html               # Vite HTML entry template
├── package.json             # Dependencies and npm scripts
├── vite.config.ts           # Vite build/dev configuration
├── tailwind.config.js       # Tailwind CSS theme and content paths
├── postcss.config.js        # PostCSS plugins (Tailwind, Autoprefixer)
├── tsconfig.json            # Root TS config, references the other two
├── tsconfig.app.json        # TS config for app source code
├── tsconfig.node.json       # TS config for build tooling
├── env.d.ts                 # Ambient types (e.g. *.vue modules)
└── README.md
```

### `src/components/`

Reusable UI building blocks used across views.

| Component           | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| `Sidebar.vue`       | Primary navigation between views                  |
| `TopNavBar.vue`     | Top header bar                                    |
| `common/Button.vue` | Primary button                                    |
| `common/Card.vue`   | Container card for grouped content                |
| `common/Label.vue`  | Form label                                        |
| `common/Modal.vue`  | Dialog / overlay                                  |
| `common/ProgressBar.vue` | Progress indicator (e.g. budget usage)      |
| `common/SelectInput.vue` | Styled select dropdown                      |
| `common/StatCard.vue`    | Dashboard metric summary card                |
| `common/TextInput.vue`   | Styled text input                            |

### `src/composables/`

Encapsulates stateful logic using the Composition API. Each file exports a composable that other components can reuse.

- `useLocalStorage.ts` — syncs a `ref` with a `localStorage` key
- `useTransaction.ts` — manages the transaction ledger
- `useBudget.ts` — manages the budget ledger

### `src/router/`

Vue Router configuration.

- `index.ts` — creates and exports the router instance
- `routes.ts` — route table mapping paths to view components

### `src/types/`

Central TypeScript type definitions shared across the app (e.g. `Transaction`, `Category`, `Budget`).

### `src/utils/`

Pure, side-effect-free helpers and constants.

- `categories.ts` — expense and income category definitions
- `format.currency.ts` — currency formatting
- `format.date.ts` — date formatting
- `storage.ts` — `localStorage` read/write helpers and storage keys

### `src/views/`

Route-level page components, one per screen.

- `DashboardView.vue` — `/dashboard`
- `TransactionsView.vue` — `/transactions`
- `BudgetView.vue` — `/budget`

## Notes

- There is no backend or user auth.
- The app is intended for a single browser/device instance.
- Budget and transaction data are local to the browser where they are created.
