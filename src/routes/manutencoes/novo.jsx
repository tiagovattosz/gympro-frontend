import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/manutencoes/novo")({
  component: NovaManutencaoPage,
});

function NovaManutencaoPage() {
  const navigate = useNavigate();

  const [equipamentos, setEquipamentos] = useState([]);

  const [form, setForm] = useState({
    equipamentoId: "",
    descricao: "",
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    const fetchEquipamentos = async () => {
      try {
        const res = await fetch("/api/equipamentos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setEquipamentos(data);
      } catch {
        setEquipamentos([]);
      }
    };

    fetchEquipamentos();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const newErrors = {};
    if (!form.equipamentoId)
      newErrors.equipamentoId = "Selecione um equipamento.";
    if (!form.descricao || form.descricao.length < 3)
      newErrors.descricao = "Informe uma descrição válida.";
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

      const response = await fetch("/api/manutencoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          equipamentoId: Number(form.equipamentoId),
          descricao: form.descricao,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setGlobalError(
          data.message || "Erro ao criar solicitação de manutenção."
        );
      } else {
        navigate({ to: "/manutencoes" });
      }
    } catch (err) {
      setGlobalError("Erro de rede ou inesperado: " + err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box maxWidth="sm" mx="auto" p={3}>
      <Typography variant="h5" gutterBottom>
        Nova Solicitação de Manutenção
      </Typography>

      {globalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {globalError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <FormControl fullWidth margin="normal" error={!!errors.equipamentoId}>
          <InputLabel>Equipamento</InputLabel>
          <Select
            name="equipamentoId"
            value={form.equipamentoId}
            label="Equipamento"
            onChange={handleChange}
          >
            <MenuItem value="">
              <em>Selecione</em>
            </MenuItem>
            {equipamentos.map((eq) => (
              <MenuItem key={eq.id} value={eq.id}>
                {eq.nome}
              </MenuItem>
            ))}
          </Select>
          {errors.equipamentoId && (
            <Typography variant="caption" color="error">
              {errors.equipamentoId}
            </Typography>
          )}
        </FormControl>

        <TextField
          label="Descrição do Problema"
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          multiline
          rows={3}
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
              "Solicitar Manutenção"
            )}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
