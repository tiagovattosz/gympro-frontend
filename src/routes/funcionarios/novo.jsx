import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { isValid as isValidCPF } from "@fnando/cpf";
import { differenceInYears } from "date-fns";
import { useAdminGuard } from "../../hooks/useAdminGuard";

export const Route = createFileRoute("/funcionarios/novo")({
  component: NovoFuncionarioPage,
});

function NovoFuncionarioPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    nome: "",
    celular: "",
    email: "",
    dataNascimento: "",
    cpf: "",
    admin: false,
    idCargo: "",
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cargos, setCargos] = useState([]);

  useEffect(() => {
    async function fetchCargos() {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch("/api/cargos", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setCargos(data);
        }
      } catch (error) {
        console.error("Erro ao buscar cargos:", error);
      }
    }

    fetchCargos();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function validate() {
    const newErrors = {};

    if (!form.username || form.username.length > 255)
      newErrors.username = "Informe um username com até 255 caracteres.";
    if (!form.password || form.password.length > 255)
      newErrors.password = "Informe uma senha com até 255 caracteres.";
    if (!form.nome || form.nome.length > 255)
      newErrors.nome = "Informe o nome com até 255 caracteres.";
    if (!form.cpf || !isValidCPF(form.cpf))
      newErrors.cpf = "Informe um CPF válido.";
    if (!form.celular || form.celular.length > 255)
      newErrors.celular = "Informe o celular com até 255 caracteres.";
    if (!form.dataNascimento)
      newErrors.dataNascimento = "Informe a data de nascimento.";
    else if (differenceInYears(new Date(), new Date(form.dataNascimento)) < 18)
      newErrors.dataNascimento = "Funcionário deve ter mais de 18 anos.";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Informe um e-mail válido.";

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

      const response = await fetch("/api/funcionarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          idCargo: form.idCargo ? Number(form.idCargo) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setGlobalError(data.message || "Erro inesperado ao criar funcionário.");
      } else {
        navigate({ to: "/funcionarios" });
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
        Novo Funcionário
      </Typography>

      {globalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {globalError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!errors.username}
          helperText={errors.username}
        />
        <TextField
          label="Senha"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          error={!!errors.password}
          helperText={errors.password}
        />
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
          required
          error={!!errors.email}
          helperText={errors.email}
        />
        <TextField
          label="Cargo (opcional)"
          name="idCargo"
          select
          value={form.idCargo}
          onChange={handleChange}
          fullWidth
          margin="normal"
        >
          <MenuItem value="">Nenhum</MenuItem>
          {cargos.map((cargo) => (
            <MenuItem key={cargo.id} value={cargo.id}>
              {cargo.descricao}
            </MenuItem>
          ))}
        </TextField>

        <Box mt={2}>
          <FormControlLabel
            control={
              <Checkbox
                name="admin"
                checked={form.admin}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Administrador"
          />
        </Box>

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
              "Cadastrar Funcionário"
            )}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
