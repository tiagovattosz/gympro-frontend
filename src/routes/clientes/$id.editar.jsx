import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Divider,
} from "@mui/material";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { isValid as isValidCPF } from "@fnando/cpf";
import { differenceInYears, parseISO } from "date-fns";
import { Delete } from "@mui/icons-material";
import { formatDate } from "../../utils/formatDate";

export const Route = createFileRoute("/clientes/$id/editar")({
  component: EditarClientePage,
});

function EditarClientePage() {
  const navigate = useNavigate();
  const { id } = useParams("/clientes/:id/editar");

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    celular: "",
    email: "",
    dataNascimento: "",
    matricula: "",
  });
  const [inscricoes, setInscricoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchCliente() {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`/api/clientes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao carregar cliente");
        const data = await res.json();
        setForm({
          nome: data.nome,
          cpf: data.cpf,
          celular: data.celular,
          email: data.email || "",
          dataNascimento: data.dataNascimento,
          matricula: data.matricula,
        });
        setInscricoes(data.inscricoes || []);
      } catch (err) {
        setGlobalError("Erro ao carregar dados do cliente: " + err);
      } finally {
        setLoading(false);
      }
    }
    fetchCliente();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validateForm() {
    const newErrors = {};
    if (!form.nome.trim()) newErrors.nome = "Nome é obrigatório.";
    else if (form.nome.length > 255)
      newErrors.nome = "Nome deve ter no máximo 255 caracteres.";
    if (!form.cpf.trim() || !isValidCPF(form.cpf))
      newErrors.cpf = "CPF inválido.";
    if (!form.celular.trim()) newErrors.celular = "Celular é obrigatório.";
    else if (form.celular.length > 255)
      newErrors.celular = "Celular deve ter no máximo 255 caracteres.";
    if (!form.dataNascimento)
      newErrors.dataNascimento = "Data de nascimento é obrigatória.";
    else {
      const idade = differenceInYears(
        new Date(),
        parseISO(form.dataNascimento)
      );
      if (idade < 18)
        newErrors.dataNascimento = "Cliente deve ter no mínimo 18 anos.";
    }
    if (form.email && form.email.length > 255)
      newErrors.email = "E-mail deve ter no máximo 255 caracteres.";
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
      const body = {
        nome: form.nome,
        celular: form.celular,
        email: form.email,
        dataNascimento: form.dataNascimento,
      };
      const response = await fetch(`/api/clientes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok)
        setGlobalError(data.message || "Erro ao atualizar cliente.");
      else navigate({ to: "/clientes" });
    } catch (err) {
      setGlobalError("Erro inesperado ou de rede: " + err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoverInscricao(inscricaoId) {
    if (!confirm("Deseja realmente remover esta inscrição?")) return;
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/inscricoes-aula/${inscricaoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao remover inscrição");
      setInscricoes((prev) => prev.filter((i) => i.id !== inscricaoId));
    } catch (err) {
      alert("Erro ao remover inscrição: " + err);
    }
  }

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box maxWidth="md" mx="auto" p={3}>
      <Typography variant="h5" gutterBottom>
        Editar Cliente
      </Typography>
      {globalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {globalError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Matrícula"
          name="matricula"
          value={form.matricula}
          fullWidth
          margin="normal"
          disabled
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
          fullWidth
          margin="normal"
          required
          disabled
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
            {submitting ? <CircularProgress size={24} /> : "Salvar Alterações"}
          </Button>
        </Box>
      </form>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        Inscrições Atuais
      </Typography>
      {inscricoes.length === 0 ? (
        <Typography>Nenhuma inscrição encontrada.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Aula</TableCell>
              <TableCell>Professor</TableCell>
              <TableCell>Dia</TableCell>
              <TableCell>Horário</TableCell>
              <TableCell>Data da Inscrição</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inscricoes.map((i) => (
              <TableRow key={i.id}>
                <TableCell>{i.aulaDescricao}</TableCell>
                <TableCell>{i.professorNome}</TableCell>
                <TableCell>{i.diaDaSemana}</TableCell>
                <TableCell>{i.horario}</TableCell>
                <TableCell>{formatDate(i.dataInscricao)}</TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoverInscricao(i.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
