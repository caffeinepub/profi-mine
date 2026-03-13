import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import RootComponent from "./components/layout/RootComponent";
import PaymentFailure from "./components/payment/PaymentFailure";
import PaymentSuccess from "./components/payment/PaymentSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LoginPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-success",
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-failure",
  component: PaymentFailure,
});

const paymentCancelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-cancel",
  component: PaymentFailure,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  paymentCancelRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

export default function App() {
  return <RouterProvider router={router} />;
}
