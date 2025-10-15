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
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/aulas/novo")({
  component: NovaAulaPage,
});

function NovaAulaPage() {
  const navigate = useNavigate();

  const [modalidades, setModalidades] = useState([]);
  const [professores, setProfessores] = useState([]);

  const [form, setForm] = useState({
    modalidadeId: "",
    professorId: "",
    diaDaSemana: "",
    horario: "",
    maximoInscricoes: "",
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    const fetchModalidades = async () => {
      try {
        const res = await fetch("/api/modalidades", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setModalidades(data);
      } catch {
        setModalidades([]);
      }
    };

    const fetchProfessores = async () => {
      try {
        const res = await fetch("/api/funcionarios", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProfessores(data);
      } catch {
        setProfessores([]);
      }
    };

    fetchModalidades();
    fetchProfessores();
  }, []);

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

      const response = await fetch("/api/aulas", {
        method: "POST",
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

      const data = await response.json();

      if (!response.ok) {
        setGlobalError(data.message || "Erro ao criar aula.");
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

  return (
    <Box maxWidth="sm" mx="auto" p={3}>
      <Typography variant="h5" gutterBottom>
        Nova Aula
      </Typography>

      {globalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {globalError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <FormControl fullWidth margin="normal" error={!!errors.modalidadeId}>
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

        <FormControl fullWidth margin="normal" error={!!errors.professorId}>
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

        <Box mt={3}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
            fullWidth
          >
            {submitting ? <CircularProgress size={24} /> : "Cadastrar Aula"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
