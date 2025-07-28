import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { login } from "../auth/auth";
import { TextField, Button, Container, Typography, Box } from "@mui/material";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login({ username, password });
      navigate({ to: "/" }); // Redireciona para a home após login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={10} p={4} boxShadow={2} borderRadius={2}>
        <Typography variant="h5" mb={2}>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Usuário"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Senha"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Entrar
          </Button>
        </form>
      </Box>
    </Container>
  );
}
