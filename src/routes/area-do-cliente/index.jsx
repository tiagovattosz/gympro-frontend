import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  TextField,
  Typography,
  Avatar,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { formatDate } from "../../utils/formatDate";

export const Route = createFileRoute("/area-do-cliente/")({
  component: AreaDoCliente,
});

function AreaDoCliente() {
  const [matricula, setMatricula] = useState("");
  const [dados, setDados] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBuscar = async () => {
    if (!matricula.trim()) {
      setError("Por favor, digite uma matrícula válida.");
      return;
    }

    setError("");
    setDados(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/area-do-cliente/${matricula}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Matrícula não encontrada.");
        } else {
          throw new Error("Erro ao buscar informações. Tente novamente.");
        }
      }

      const data = await response.json();
      setDados(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calcularStatus = (inicio, termino) => {
    if (!inicio || !termino) return "Sem plano ativo";
    return new Date(termino) > new Date() ? "Ativo" : "Inativo";
  };

  return (
    <Container maxWidth="md" sx={{ mt: 10 }}>
      {/* cabecalho */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        mb={4}
        textAlign="center"
      >
        <Avatar
          src="/src/assets/dumbbell.png"
          alt="Logo"
          sx={{ width: 60, height: 60, mb: 1 }}
        />
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}
        >
          GymPro
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Consulte sua área do cliente e acompanhe suas inscrições e assinatura
        </Typography>
      </Box>

      {/* input matricula */}
      <Box display="flex" gap={2} justifyContent="center" mb={4}>
        <TextField
          label="Matrícula"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          variant="outlined"
          sx={{ width: "60%" }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleBuscar}
          startIcon={<SearchIcon />}
          disabled={loading}
        >
          Consultar
        </Button>
      </Box>

      {loading && (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" align="center" mt={2}>
          {error}
        </Typography>
      )}

      {dados && (
        <Box>
          {/* card principal */}
          <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {dados.nome || "—"}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Matrícula: {dados.matricula || "—"}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Typography>
                <strong>Plano:</strong> {dados.plano || "Sem plano ativo"}
              </Typography>
              <Typography>
                <strong>Status:</strong>{" "}
                {calcularStatus(
                  dados.dataInicioAssinatura,
                  dados.dataTerminoAssinatura
                )}
              </Typography>
              <Typography>
                <strong>Período:</strong>{" "}
                {dados.dataInicioAssinatura || dados.dataTerminoAssinatura
                  ? `${formatDate(dados.dataInicioAssinatura)} até ${formatDate(
                      dados.dataTerminoAssinatura
                    )}`
                  : "—"}
              </Typography>
              <Typography>
                <strong>Inscrições ativas:</strong>{" "}
                {dados.numeroInscricoesAtivas ?? 0} /{" "}
                {dados.limiteDeInscricoes ?? 0}
              </Typography>
            </CardContent>
          </Card>

          {/* inscricoes */}
          <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Suas inscrições
              </Typography>
              {dados.inscricoes && dados.inscricoes.length > 0 ? (
                <List>
                  {dados.inscricoes.map((i) => (
                    <ListItem
                      key={i.id}
                      sx={{ borderBottom: "1px solid #eee" }}
                    >
                      <ListItemIcon>
                        <FitnessCenterIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={i.aulaDescricao || "—"}
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              Professor: {i.professorNome || "—"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Data da inscrição: {formatDate(i.dataInscricao)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  Nenhuma inscrição ativa no momento.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
}
