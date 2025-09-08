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
  ListItemIcon,
  Divider,
  CssBaseline,
  useMediaQuery,
  ButtonBase,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useTheme } from "@mui/material/styles";

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <HomeIcon />, path: "/" },
  { text: "Clientes", icon: <PeopleIcon />, path: "/clientes" },
  { text: "Manutenções", icon: <AssignmentIcon />, path: "/manutencoes" },
  { text: "Aulas", icon: <EventIcon />, path: "/aulas" },
  { text: "Modalidades", icon: <FitnessCenterIcon />, path: "/modalidades" },
  { text: "Inscrições", icon: <PeopleIcon />, path: "/inscricoes" },
  { text: "Equipamentos", icon: <FitnessCenterIcon />, path: "/equipamentos" },
];

const adminItems = [
  { text: "Cargos", icon: <AssignmentIcon />, path: "/cargos" },
  { text: "Planos", icon: <EventIcon />, path: "/planos" },
  { text: "Funcionários", icon: <PeopleIcon />, path: "/funcionarios" },
  { text: "Movimentos", icon: <AssignmentIcon />, path: "/movimentos" },
  { text: "Catraca Entrada", icon: <EventIcon />, path: "/catraca/entrada" },
  { text: "Catraca Saida", icon: <EventIcon />, path: "/catraca/saida" },
];

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    async function carregarUsuario() {
      const data = await fetchUserData();
      if (!data) navigate({ to: "/login" });
      else setUser(data);
    }
    carregarUsuario();
  }, [navigate]);

  const handleLogout = () => {
    removerToken();
    navigate({ to: "/login" });
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box sx={{ width: drawerWidth }}>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Plataforma Academia
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {/* Dashboard */}
        <ListItem
          button
          component={Link}
          to="/"
          sx={{
            "&:hover": { backgroundColor: theme.palette.action.hover },
            borderRadius: 1,
            my: 0.5,
          }}
        >
          <ListItemIcon sx={{ color: theme.palette.primary.main }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <Divider sx={{ my: 1.5 }} /> {/* separação categoria */}
        {/* Movimentos e Catraca */}
        {user?.role === "ADMIN" && (
          <>
            {["Movimentos", "Catraca Entrada", "Catraca Saida"].map(
              (text, idx) => {
                const icons = [
                  <AssignmentIcon />,
                  <EventIcon />,
                  <EventIcon />,
                ];
                const paths = [
                  "/movimentos",
                  "/catraca/entrada",
                  "/catraca/saida",
                ];
                return (
                  <ListItem
                    key={text}
                    button
                    component={Link}
                    to={paths[idx]}
                    sx={{
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                      borderRadius: 1,
                      my: 0.5,
                    }}
                  >
                    <ListItemIcon sx={{ color: theme.palette.secondary.main }}>
                      {icons[idx]}
                    </ListItemIcon>
                    <ListItemText primary={text} />
                  </ListItem>
                );
              }
            )}
            <Divider sx={{ my: 1.5 }} />
          </>
        )}
        {/* Cargos e Funcionários */}
        {user?.role === "ADMIN" && (
          <>
            {["Cargos", "Funcionários"].map((text, idx) => {
              const icons = [<AssignmentIcon />, <PeopleIcon />];
              const paths = ["/cargos", "/funcionarios"];
              return (
                <ListItem
                  key={text}
                  button
                  component={Link}
                  to={paths[idx]}
                  sx={{
                    "&:hover": { backgroundColor: theme.palette.action.hover },
                    borderRadius: 1,
                    my: 0.5,
                  }}
                >
                  <ListItemIcon sx={{ color: theme.palette.secondary.main }}>
                    {icons[idx]}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItem>
              );
            })}
            <Divider sx={{ my: 1.5 }} />
          </>
        )}
        {/* Planos e Clientes */}
        {["Planos", "Clientes"].map((text, idx) => {
          const icons = [<EventIcon />, <PeopleIcon />];
          const paths = ["/planos", "/clientes"];
          return (
            <ListItem
              key={text}
              button
              component={Link}
              to={paths[idx]}
              sx={{
                "&:hover": { backgroundColor: theme.palette.action.hover },
                borderRadius: 1,
                my: 0.5,
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                {icons[idx]}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          );
        })}
        <Divider sx={{ my: 1.5 }} />
        {/* Modalidades, Aulas, Inscrições */}
        {["Modalidades", "Aulas", "Inscrições"].map((text, idx) => {
          const icons = [<FitnessCenterIcon />, <EventIcon />, <PeopleIcon />];
          const paths = ["/modalidades", "/aulas", "/inscricoes"];
          return (
            <ListItem
              key={text}
              button
              component={Link}
              to={paths[idx]}
              sx={{
                "&:hover": { backgroundColor: theme.palette.action.hover },
                borderRadius: 1,
                my: 0.5,
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                {icons[idx]}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          );
        })}
        <Divider sx={{ my: 1.5 }} />
        {/* Equipamentos e Manutenções */}
        {["Equipamentos", "Manutenções"].map((text, idx) => {
          const icons = [<FitnessCenterIcon />, <AssignmentIcon />];
          const paths = ["/equipamentos", "/manutencoes"];
          return (
            <ListItem
              key={text}
              button
              component={Link}
              to={paths[idx]}
              sx={{
                "&:hover": { backgroundColor: theme.palette.action.hover },
                borderRadius: 1,
                my: 0.5,
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                {icons[idx]}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          );
        })}
        <Divider sx={{ my: 1.5 }} />
        {/* Logout */}
        <ListItem
          button
          component={ButtonBase}
          onClick={handleLogout}
          sx={{
            borderRadius: 1,
            my: 0.5,
          }}
        >
          <ListItemIcon sx={{ color: theme.palette.error.main }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Sair" />
        </ListItem>
      </List>
    </Box>
  );

  if (!user) return null;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {/* Logo/Home + Nome GymPro */}
          <Box
            display="flex"
            alignItems="center"
            onClick={() => navigate("/")}
            sx={{ cursor: "pointer", mr: 2 }}
          >
            <Avatar
              src="/src/assets/dumbbell.png"
              alt="Logo"
              sx={{ width: 32, height: 32, mr: 1 }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#d4dcff", // dourado, por exemplo
              }}
            >
              GymPro
            </Typography>
          </Box>

          {/* Espaço flexível para empurrar o nome do usuário à direita */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Saudação ao usuário */}
          <Typography variant="body1" sx={{ mr: 2 }}>
            Olá, {user.nome}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
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

      {/* Main content */}
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
