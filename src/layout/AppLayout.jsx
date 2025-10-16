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

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

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

  const renderMenu = () => {
    if (!user) return null;

    if (user.role === "ADMIN") {
      return (
        <>
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
          <Divider sx={{ my: 1.5 }} />

          {["Movimentos", "Catraca Entrada", "Catraca Saida"].map(
            (text, idx) => {
              const icons = [<AssignmentIcon />, <EventIcon />, <EventIcon />];
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

          {["Modalidades", "Aulas"].map((text, idx) => {
            const icons = [<FitnessCenterIcon />, <EventIcon />];
            const paths = ["/modalidades", "/aulas"];
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
        </>
      );
    }

    if (user.role === "USER") {
      return (
        <>
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
          <Divider sx={{ my: 1.5 }} />

          {["Movimentos", "Catraca Entrada", "Catraca Saida"].map(
            (text, idx) => {
              const icons = [<AssignmentIcon />, <EventIcon />, <EventIcon />];
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
            }
          )}
          <Divider sx={{ my: 1.5 }} />

          <ListItem
            button
            component={Link}
            to="/clientes"
            sx={{
              "&:hover": { backgroundColor: theme.palette.action.hover },
              borderRadius: 1,
              my: 0.5,
            }}
          >
            <ListItemIcon sx={{ color: theme.palette.primary.main }}>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Clientes" />
          </ListItem>
          <Divider sx={{ my: 1.5 }} />

          <ListItem
            button
            component={Link}
            to="/aulas"
            sx={{
              "&:hover": { backgroundColor: theme.palette.action.hover },
              borderRadius: 1,
              my: 0.5,
            }}
          >
            <ListItemIcon sx={{ color: theme.palette.primary.main }}>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Aulas" />
          </ListItem>
          <Divider sx={{ my: 1.5 }} />

          <ListItem
            button
            component={Link}
            to="/equipamentos"
            sx={{
              "&:hover": { backgroundColor: theme.palette.action.hover },
              borderRadius: 1,
              my: 0.5,
            }}
          >
            <ListItemIcon sx={{ color: theme.palette.primary.main }}>
              <FitnessCenterIcon />
            </ListItemIcon>
            <ListItemText primary="Equipamentos" />
          </ListItem>

          <ListItem
            button
            component={Link}
            to="/manutencoes"
            sx={{
              "&:hover": { backgroundColor: theme.palette.action.hover },
              borderRadius: 1,
              my: 0.5,
            }}
          >
            <ListItemIcon sx={{ color: theme.palette.primary.main }}>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Manutenções" />
          </ListItem>
          <Divider sx={{ my: 1.5 }} />
        </>
      );
    }

    return null;
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
        {renderMenu()}
        <ListItem
          button
          component={Link}
          to="/area-do-cliente"
          target="blank"
          sx={{
            "&:hover": { backgroundColor: theme.palette.action.hover },
            borderRadius: 1,
            my: 0.5,
          }}
        >
          <ListItemIcon sx={{ color: theme.palette.primary.main }}>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Área do cliente" />
        </ListItem>
        <Divider sx={{ my: 1.5 }} />
        <ListItem
          button
          component={ButtonBase}
          onClick={handleLogout}
          sx={{ borderRadius: 1, my: 0.5 }}
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
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
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
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#d4dcff" }}>
              GymPro
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body1" sx={{ mr: 2 }}>
            Olá, {user.nome}
          </Typography>
        </Toolbar>
      </AppBar>

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
