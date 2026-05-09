import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import OrdersPage from "./pages/OrdersPage";
import ProductsPage from "./pages/ProductsPage";
import CategoriesPage from "./pages/CategoriesPage";
import SubCategoriesPage from "./pages/SubCategoriesPage";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./auth/ProtectedRoute";
import ClientsPage from "./pages/ClientsPage";
import BestsellersPage from "./pages/BestsellersPage";
import CartRecommendationPage from "./pages/CartRecommendationPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AdminLayout />,
        children: [
      { index: true, element: <DashboardPage /> },
      { path: "users", element: <UsersPage /> },
          { path: "orders", element: <OrdersPage /> },
          { path: "products", element: <ProductsPage /> },
          { path: "categories", element: <CategoriesPage /> },
          { path: "subcategories", element: <SubCategoriesPage /> },
          { path: "bestsellers", element: <BestsellersPage /> },
          { path: "cart-recommendations", element: <CartRecommendationPage /> },
          { path: "clients", element: <ClientsPage /> }
        ],
      },
    ],
  },
]);


export const AppRouter = () => <RouterProvider router={router} />;

