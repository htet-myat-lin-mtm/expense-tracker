import DashboardView from "@/views/DashboardView.vue";
import TransactionsView from "@/views/TransactionsView.vue";
import Sidebar from "@/components/Sidebar.vue";
import BudgetView from "@/views/BudgetView.vue";

export const routes = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/",
    component: Sidebar,
    children: [
      {
        path: "dashboard",
        component: DashboardView,
        name: "Dashboard",
      },
      {
        path: "transactions",
        component: TransactionsView,
        name: "Transactions",
      },
      {
        path: "budget",
        component: BudgetView,
        name: "Budget"
      }
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/dashboard",
  },
]
