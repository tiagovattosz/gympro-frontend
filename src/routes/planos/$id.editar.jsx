import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";

export const Route = createFileRoute("/planos/$id/editar")({
  component: EditarPlanoPage,
});

function EditarPlanoPage() {
  const navigate = useNavigate();
  const { id } = useParams("/planos/$id/editar");

  const [form, setForm] = useState({
    descricao: "",
    maximoInscricoes: "",
    valor: "",
    duracaoEmMeses: "",
    detalhes: "",
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchPlano() {
      try {
        const token = localStorage.getItem("auth_token");

        const response = await fetch(`/api/planos/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Erro ao buscar plano");

        const data = await response.json();
        setForm({
          descricao: data.descricao || "",
          maximoInscricoes: data.maximoInscricoes?.toString() || "",
          valor: data.valor?.toString() || "",
          duracaoEmMeses: data.duracaoEmMeses?.toString() || "",
          detalhes: data.detalhes || "",
        });
      } catch (error) {
        console.error(error);
        setGlobalError("Erro ao carregar plano.");
      } finally {
        setLoading(false);
      }
    }

    fetchPlano();
  }, [id]);

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

    if (
      !form.maximoInscricoes ||
      isNaN(form.maximoInscricoes) ||
      Number(form.maximoInscricoes) <= 0
    ) {
      newErrors.maximoInscricoes =
        "Máximo de inscrições deve ser um número positivo.";
    }

    if (
      !form.valor ||
      isNaN(form.valor) ||
      Number(form.valor) <= 0 ||
      !/^\d{1,9}(\.\d{1,2})?$/.test(form.valor)
    ) {
      newErrors.valor =
        "Valor deve ser um número positivo com até 9 dígitos e 2 casas decimais.";
    }

    if (
      !form.duracaoEmMeses ||
      isNaN(form.duracaoEmMeses) ||
      parseInt(form.duracaoEmMeses) <= 0 ||
      !Number.isInteger(Number(form.duracaoEmMeses))
    ) {
      newErrors.duracaoEmMeses = "Duração deve ser um número inteiro positivo.";
    }

    if (form.detalhes && form.detalhes.length > 1000) {
      newErrors.detalhes = "Detalhes deve ter no máximo 1000 caracteres.";
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

      const response = await fetch(`/api/planos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          descricao: form.descricao,
          maximoInscricoes: Number(form.maximoInscricoes),
          valor: Number(form.valor),
          duracaoEmMeses: Number(form.duracaoEmMeses),
          detalhes: form.detalhes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setGlobalError(data.message || "Erro inesperado ao atualizar plano.");
      } else {
        navigate({ to: "/planos" });
      }
    } catch (error) {
      console.error(error);
      setGlobalError("Erro de rede ou inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth="sm" mx="auto" p={3}>
      <Typography variant="h5" gutterBottom>
        Editar Plano
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
        <TextField
          label="Máximo de Inscrições"
          name="maximoInscricoes"
          type="number"
          value={form.maximoInscricoes}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!errors.maximoInscricoes}
          helperText={errors.maximoInscricoes}
        />
        <TextField
          label="Valor (R$)"
          name="valor"
          type="number"
          inputProps={{ step: "0.01" }}
          value={form.valor}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!errors.valor}
          helperText={errors.valor}
        />
        <TextField
          label="Duração em Meses"
          name="duracaoEmMeses"
          type="number"
          value={form.duracaoEmMeses}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!errors.duracaoEmMeses}
          helperText={errors.duracaoEmMeses}
        />
        <TextField
          label="Detalhes (opcional)"
          name="detalhes"
          value={form.detalhes}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          rows={4}
          error={!!errors.detalhes}
          helperText={errors.detalhes}
        />

        <Box mt={3}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
            fullWidth
          >
            {submitting ? <CircularProgress size={24} /> : "Salvar Alterações"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
