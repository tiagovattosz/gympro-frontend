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

export const Route = createFileRoute("/equipamentos/novo")({
  component: NovoEquipamentoPage,
});

function NovoEquipamentoPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
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
    if (!form.nome.trim()) {
      newErrors.nome = "O nome é obrigatório.";
    } else if (form.nome.length > 255) {
      newErrors.nome = "Máximo de 255 caracteres.";
    }

    if (form.descricao && form.descricao.length > 1000) {
      newErrors.descricao = "Máximo de 1000 caracteres.";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    setGlobalError("");

    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/equipamentos", {
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
          setGlobalError("Erro inesperado ao criar equipamento.");
        }
      } else {
        navigate({ to: "/equipamentos" });
      }
    } catch (error) {
      console.error("Erro ao enviar:", error);
      setGlobalError("Erro de rede ou inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box maxWidth="sm" mx="auto" p={3}>
      <Typography variant="h5" gutterBottom>
        Novo Equipamento
      </Typography>

      {globalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {globalError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Nome"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!errors.nome}
          helperText={errors.nome}
        />
        <TextField
          label="Descrição"
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          minRows={3}
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
              "Cadastrar Equipamento"
            )}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
