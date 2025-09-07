import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "@tanstack/react-router";
import { fetchUserData, removerToken } from "../auth/auth";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  CssBaseline,
  useMediaQuery,
  ButtonBase,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTheme } from "@mui/material/styles";

const drawerWidth = 240;

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: drawerWidth }}>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Plataforma Academia
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem button component={Link} to="/">
          <ListItemText primary="Dashboard" />
        </ListItem>

        <ListItem button component={Link} to="/clientes">
          <ListItemText primary="Clientes" />
        </ListItem>

        <ListItem button component={Link} to="/manutencoes">
          <ListItemText primary="Manutenções" />
        </ListItem>

        <ListItem button component={Link} to="/aulas">
          <ListItemText primary="Aulas" />
        </ListItem>

        <ListItem button component={Link} to="/modalidades">
          <ListItemText primary="Modalidades" />
        </ListItem>

        <ListItem button component={Link} to="/inscricoes">
          <ListItemText primary="Inscrições" />
        </ListItem>

        <ListItem button component={Link} to="/equipamentos">
          <ListItemText primary="Equipamentos" />
        </ListItem>

        {user?.role === "ADMIN" && (
          <>
            <ListItem button component={Link} to="/cargos">
              <ListItemText primary="Cargos" />
            </ListItem>

            <ListItem button component={Link} to="/planos">
              <ListItemText primary="Planos" />
            </ListItem>

            <ListItem button component={Link} to="/funcionarios">
              <ListItemText primary="Funcionários" />
            </ListItem>

            <ListItem button component={Link} to="/movimentos">
              <ListItemText primary="Movimentos" />
            </ListItem>

            <ListItem button component={Link} to="/catraca/entrada">
              <ListItemText primary="Catraca Entrada" />
            </ListItem>

            <ListItem button component={Link} to="/catraca/saida">
              <ListItemText primary="Catraca Saida" />
            </ListItem>
          </>
        )}

        <ListItem button component={ButtonBase} onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} />
          <ListItemText primary="Sair" />
        </ListItem>
      </List>
    </Box>
  );

  if (!user) return null; // ou um loader

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* AppBar com botão de menu para mobile */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div">
            Bem-vindo, {user.nome}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer lateral */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Drawer para mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/* Drawer permanente para telas maiores */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
