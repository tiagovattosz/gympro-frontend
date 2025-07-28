import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import AppLayout from "../layout/AppLayout";
import { useMatchRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => {
    const matchRoute = useMatchRoute();

    const isLoginPage = matchRoute({ to: "/login", fuzzy: false });

    return (
      <>
        {isLoginPage ? (
          <Outlet />
        ) : (
          <AppLayout>
            <Outlet />
          </AppLayout>
        )}
        <TanStackRouterDevtools />
      </>
    );
  },
});
