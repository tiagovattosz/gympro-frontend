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

export const Route = createFileRoute("/modalidades/$id/editar")({
  component: EditarModalidadePage,
});

function EditarModalidadePage() {
  const navigate = useNavigate();
  const { id } = useParams({ strict: false });

  const [form, setForm] = useState({
    descricao: "",
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchModalidade() {
      try {
        const token = localStorage.getItem("auth_token");

        const response = await fetch(`/api/modalidades/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar modalidade");
        }

        const data = await response.json();
        setForm({ descricao: data.descricao });
      } catch (error) {
        console.error(error);
        setGlobalError("Erro ao carregar dados da modalidade.");
      } finally {
        setLoading(false);
      }
    }

    fetchModalidade();
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

      const response = await fetch(`/api/modalidades/${id}`, {
        method: "PUT",
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
          setGlobalError("Erro inesperado ao atualizar modalidade.");
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
        Editar Modalidade
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
            {submitting ? <CircularProgress size={24} /> : "Salvar Alterações"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
