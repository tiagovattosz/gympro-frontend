import { createRootRoute, Outlet } from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import AppLayout from "../layout/AppLayout";
import { useMatchRoute } from "@tanstack/react-router";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "../../theme";

export const Route = createRootRoute({
  component: () => {
    const matchRoute = useMatchRoute();

    const isLoginPage = matchRoute({ to: "/login", fuzzy: false });
    const isCatracaEntrada = matchRoute({
      to: "/catraca/entrada",
      fuzzy: false,
    });
    const isCatracaSaida = matchRoute({ to: "/catraca/saida", fuzzy: false });
    const isAreaDoCliente = matchRoute({ to: "/area-do-cliente", fuzzy: true });

    return (
      <>
        <ThemeProvider theme={theme}>
          {isLoginPage ||
          isCatracaEntrada ||
          isCatracaSaida ||
          isAreaDoCliente ? (
            <Outlet />
          ) : (
            <AppLayout>
              <Outlet />
            </AppLayout>
          )}
          {/* <TanStackRouterDevtools /> */}
        </ThemeProvider>
      </>
    );
  },
});
