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
import { useAdminGuard } from "../../hooks/useAdminGuard";

export const Route = createFileRoute("/modalidades/novo")({
  component: NovaModalidadePage,
});

function NovaModalidadePage() {
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

      const response = await fetch("/api/modalidades", {
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
          setGlobalError("Erro inesperado ao criar modalidade.");
        }
      } else {
        navigate({ to: "/modalidades" });
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      setGlobalError("Erro de rede ou inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  const isAdmin = useAdminGuard();

  if (isAdmin === null) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAdmin === false) {
    return (
      <Box p={2}>
        <Typography variant="h6">
          Você não tem permissão para acessar esse recurso.
        </Typography>
      </Box>
    );
  }

  return (
    <Box maxWidth="sm" mx="auto" p={3}>
      <Typography variant="h5" gutterBottom>
        Nova Modalidade
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
            {submitting ? (
              <CircularProgress size={24} />
            ) : (
              "Cadastrar Modalidade"
            )}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
