import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { fetchUserData, removerToken } from "../auth/auth";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarUsuario() {
      const data = await fetchUserData();
      if (!data) {
        navigate({ to: "/login" });
      } else {
        setUser(data);
      }
    }
    carregarUsuario();
  }, [navigate]);

  const handleLogout = () => {
    removerToken();
    navigate({ to: "/login" });
  };

  if (!user) return null; // ou um loader

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Plataforma Academia
          </Typography>
          <Box>
            {user.role === "ADMIN" && (
              <Button color="inherit">Administrador</Button>
            )}
            {user.role === "USER" && (
              <Button color="inherit">Funcionário</Button>
            )}
            <Button color="inherit" onClick={handleLogout}>
              Sair
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box p={2}>
        <Outlet />
      </Box>
    </>
  );
}
