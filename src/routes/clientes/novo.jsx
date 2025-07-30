// src/routes/clientes/novo.tsx
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
import { isValid as isValidCPF } from "@fnando/cpf";
import { differenceInYears, parseISO } from "date-fns";

export const Route = createFileRoute("/clientes/novo")({
  component: NovoClientePage,
});

function NovoClientePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    celular: "",
    email: "",
    dataNascimento: "",
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validateForm() {
    const newErrors = {};

    if (!form.nome.trim()) {
      newErrors.nome = "Nome é obrigatório.";
    } else if (form.nome.length > 255) {
      newErrors.nome = "Nome deve ter no máximo 255 caracteres.";
    }

    if (!form.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório.";
    } else if (!isValidCPF(form.cpf)) {
      newErrors.cpf = "CPF inválido.";
    }

    if (!form.celular.trim()) {
      newErrors.celular = "Celular é obrigatório.";
    } else if (form.celular.length > 255) {
      newErrors.celular = "Celular deve ter no máximo 255 caracteres.";
    }

    if (!form.dataNascimento) {
      newErrors.dataNascimento = "Data de nascimento é obrigatória.";
    } else {
      const idade = differenceInYears(
        new Date(),
        parseISO(form.dataNascimento)
      );
      if (idade < 18) {
        newErrors.dataNascimento = "Cliente deve ter no mínimo 18 anos.";
      }
    }

    if (form.email && form.email.length > 255) {
      newErrors.email = "E-mail deve ter no máximo 255 caracteres.";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGlobalError("");
    setErrors({});
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/clientes", {
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
          setGlobalError("Erro ao criar cliente.");
        }
      } else {
        navigate({ to: "/clientes" });
      }
    } catch (err) {
      setGlobalError("Erro inesperado ou de rede.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box maxWidth="sm" mx="auto" p={3}>
      <Typography variant="h5" gutterBottom>
        Novo Cliente
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
          label="CPF"
          name="cpf"
          value={form.cpf}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!errors.cpf}
          helperText={errors.cpf}
        />
        <TextField
          label="Celular"
          name="celular"
          value={form.celular}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!errors.celular}
          helperText={errors.celular}
        />
        <TextField
          label="Data de Nascimento"
          name="dataNascimento"
          type="date"
          value={form.dataNascimento}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          InputLabelProps={{ shrink: true }}
          error={!!errors.dataNascimento}
          helperText={errors.dataNascimento}
        />
        <TextField
          label="E-mail"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!errors.email}
          helperText={errors.email}
        />

        <Box mt={3}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
            fullWidth
          >
            {submitting ? <CircularProgress size={24} /> : "Cadastrar Cliente"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
