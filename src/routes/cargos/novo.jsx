import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/cargos/novo")({
  component: NovoCargoPage,
});

function NovoCargoPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    descricao: "",
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const newErrors = {};
    if (!form.descricao || form.descricao.length > 255) {
      newErrors.descricao =
        "Descrição é obrigatória e deve ter no máximo 255 caracteres.";
    }
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setGlobalError("");
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/cargos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message) {
          setGlobalError(data.message);
        } else {
          setGlobalError("Erro inesperado ao criar cargo.");
        }
      } else {
        navigate({ to: "/cargos" });
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      setGlobalError("Erro de rede ou inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box maxWidth="sm" mx="auto" p={3}>
      <Typography variant="h5" gutterBottom>
        Novo Cargo
      </Typography>

      {globalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {globalError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Descrição"
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!errors.descricao}
          helperText={errors.descricao}
        />

        <Box mt={3}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
            fullWidth
          >
            {submitting ? <CircularProgress size={24} /> : "Cadastrar Cargo"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
