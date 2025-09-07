import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";

export const Route = createFileRoute("/equipamentos/$id/editar")({
  component: EditarEquipamentoPage,
});

function EditarEquipamentoPage() {
  const navigate = useNavigate();
  const { id } = useParams("/equipamentos/$id/editar");

  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    emManutencao: false,
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchEquipamento() {
      try {
        const token = localStorage.getItem("auth_token");

        const response = await fetch(`/api/equipamentos/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar equipamento");
        }

        const data = await response.json();
        setForm({
          nome: data.nome || "",
          descricao: data.descricao || "",
          emManutencao: !!data.emManutencao,
        });
      } catch (error) {
        console.error(error);
        setGlobalError("Erro ao carregar equipamento.");
      } finally {
        setLoading(false);
      }
    }

    fetchEquipamento();
  }, [id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

      const response = await fetch(`/api/equipamentos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setGlobalError(data.message || "Erro inesperado ao atualizar.");
      } else {
        navigate({ to: "/equipamentos" });
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
        Editar Equipamento
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
        <FormControlLabel
          control={
            <Checkbox
              checked={form.emManutencao}
              onChange={handleChange}
              name="emManutencao"
              color="primary"
            />
          }
          label="Em Manutenção"
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
