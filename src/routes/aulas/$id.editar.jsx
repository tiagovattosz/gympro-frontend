import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";

export const Route = createFileRoute("/aulas/$id/editar")({
  component: EditarAulaPage,
});

function EditarAulaPage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/aulas/$id/editar" });

  const [modalidades, setModalidades] = useState([]);
  const [professores, setProfessores] = useState([]);

  const [form, setForm] = useState({
    modalidadeId: "",
    professorId: "",
    diaDaSemana: "",
    horario: "",
    maximoInscricoes: "",
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    async function fetchData() {
      try {
        const [aulaRes, modalidadesRes, professoresRes] = await Promise.all([
          fetch(`/api/aulas/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/modalidades", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/funcionarios", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!aulaRes.ok) throw new Error("Erro ao buscar aula.");
        const aulaData = await aulaRes.json();
        const modalidadesData = await modalidadesRes.json();
        const professoresData = await professoresRes.json();

        setForm({
          modalidadeId: aulaData.modalidadeId || "",
          professorId: aulaData.professorId || "",
          diaDaSemana: aulaData.diaDaSemana || "",
          horario: aulaData.horario || "",
          maximoInscricoes: aulaData.maximoInscricoes?.toString() || "",
        });

        setModalidades(modalidadesData);
        setProfessores(professoresData);
      } catch (error) {
        console.error(error);
        setGlobalError("Erro ao carregar os dados.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const newErrors = {};
    if (!form.diaDaSemana) newErrors.diaDaSemana = "Selecione o dia da semana.";
    if (!form.horario) newErrors.horario = "Horário é obrigatório.";
    if (
      !form.maximoInscricoes ||
      isNaN(form.maximoInscricoes) ||
      parseInt(form.maximoInscricoes) <= 0 ||
      !Number.isInteger(Number(form.maximoInscricoes))
    ) {
      newErrors.maximoInscricoes = "Informe um número inteiro positivo.";
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

      const response = await fetch(`/api/aulas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          modalidadeId: form.modalidadeId ? Number(form.modalidadeId) : null,
          professorId: form.professorId ? Number(form.professorId) : null,
          diaDaSemana: form.diaDaSemana,
          horario: form.horario,
          maximoInscricoes: Number(form.maximoInscricoes),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setGlobalError(data.message || "Erro ao atualizar aula.");
      } else {
        navigate({ to: "/aulas" });
      }
    } catch (err) {
      setGlobalError("Erro de rede ou inesperado: " + err);
    } finally {
      setSubmitting(false);
    }
  }

  const diasDaSemana = [
    "SEGUNDA",
    "TERCA",
    "QUARTA",
    "QUINTA",
    "SEXTA",
    "SABADO",
    "DOMINGO",
  ];

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
        Editar Aula
      </Typography>

      {globalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {globalError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <FormControl fullWidth margin="normal">
          <InputLabel>Modalidade</InputLabel>
          <Select
            name="modalidadeId"
            value={form.modalidadeId}
            label="Modalidade"
            onChange={handleChange}
          >
            <MenuItem value="">
              <em>Nenhuma</em>
            </MenuItem>
            {modalidades.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.descricao}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Professor</InputLabel>
          <Select
            name="professorId"
            value={form.professorId}
            label="Professor"
            onChange={handleChange}
          >
            <MenuItem value="">
              <em>Nenhum</em>
            </MenuItem>
            {professores.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          fullWidth
          margin="normal"
          required
          error={!!errors.diaDaSemana}
        >
          <InputLabel>Dia da Semana</InputLabel>
          <Select
            name="diaDaSemana"
            value={form.diaDaSemana}
            label="Dia da Semana"
            onChange={handleChange}
          >
            {diasDaSemana.map((dia) => (
              <MenuItem key={dia} value={dia}>
                {dia}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Horário"
          name="horario"
          type="time"
          value={form.horario}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 300 }}
          error={!!errors.horario}
          helperText={errors.horario}
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

        <Box mt={3} display="flex" gap={2}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate({ to: "/aulas" })}
          >
            Voltar
          </Button>
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
