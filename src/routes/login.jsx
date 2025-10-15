import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { login } from "../auth/auth";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Divider,
} from "@mui/material";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login({ username, password });
      navigate({ to: "/" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #504ead 0%, #504ead 100%)",
        px: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 400,
          width: "100%",
          p: 4,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Avatar
          src="/src/assets/dumbbell.png"
          alt="GymPro Logo"
          sx={{ width: 64, height: 64, mx: "auto", mb: 2 }}
        />

        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#3f51b5",
            mb: 1,
            fontFamily: "Roboto, sans-serif",
          }}
        >
          GymPro
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Bem-vindo de volta! Faça login para acessar sua conta e gerenciar sua
          academia.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <TextField
            label="Usuário"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Senha"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" sx={{ mt: 1, mb: 1 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              mt: 2,
              py: 1.5,
              fontWeight: "bold",
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            Entrar
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
