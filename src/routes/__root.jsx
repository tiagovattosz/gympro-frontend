import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import AppLayout from "../layout/AppLayout";
import { useMatchRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => {
    const matchRoute = useMatchRoute();

    const isLoginPage = matchRoute({ to: "/login", fuzzy: false });
    const isCatracaEntrada = matchRoute({
      to: "/catraca/entrada",
      fuzzy: false,
    });
    const isCatracaSaida = matchRoute({ to: "/catraca/saida", fuzzy: false });

    return (
      <>
        {isLoginPage || isCatracaEntrada || isCatracaSaida ? (
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
