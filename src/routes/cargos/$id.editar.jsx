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
import { useAdminGuard } from "../../hooks/useAdminGuard";

export const Route = createFileRoute("/cargos/$id/editar")({
  component: EditarCargoPage,
});

function EditarCargoPage() {
  const navigate = useNavigate();
  const { id } = useParams("/cargos/$id/editar");

  const [form, setForm] = useState({
    descricao: "",
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchCargo() {
      try {
        const token = localStorage.getItem("auth_token");

        const response = await fetch(`/api/cargos/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar cargo");
        }

        const data = await response.json();
        setForm({
          descricao: data.descricao || "",
        });
      } catch (error) {
        console.error(error);
        setGlobalError("Erro ao carregar cargo.");
      } finally {
        setLoading(false);
      }
    }

    fetchCargo();
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

      const response = await fetch(`/api/cargos/${id}`, {
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
        navigate({ to: "/cargos" });
      }
    } catch (error) {
      console.error(error);
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
        Editar Cargo
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
