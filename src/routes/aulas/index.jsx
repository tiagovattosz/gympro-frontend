import { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  CircularProgress,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Collapse,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Delete as DeleteIcon,
  Edit as EditIcon,
  KeyboardArrowDown,
  KeyboardArrowUp,
  RemoveCircle as RemoveCircleIcon,
} from "@mui/icons-material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { formatDate } from "../../utils/formatDate";
import { getHoje } from "../../utils/getHoje";

export const Route = createFileRoute("/aulas/")({
  component: AulasPage,
});

function AulasPage() {
  const [aulas, setAulas] = useState([]);
  const [aulasFiltradas, setAulasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aulaSelecionada, setAulaSelecionada] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [inscricaoDialogOpen, setInscricaoDialogOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [alunosInscritos, setAlunosInscritos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [submitting, setSubmitting] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [detalhesAulas, setDetalhesAulas] = useState({});
  const [filtrarComVagas, setFiltrarComVagas] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAulas() {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch("/api/aulas", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok)
          throw new Error("Erro na requisição: " + response.status);

        const data = await response.json();
        const ordemDias = [
          "SEGUNDA",
          "TERCA",
          "QUARTA",
          "QUINTA",
          "SEXTA",
          "SABADO",
          "DOMINGO",
        ];

        const sorted = data.sort((a, b) => {
          const diaA = ordemDias.indexOf(a.diaDaSemana);
          const diaB = ordemDias.indexOf(b.diaDaSemana);
          if (diaA !== diaB) return diaA - diaB;
          return a.horario.localeCompare(b.horario);
        });

        setAulas(sorted);
        setAulasFiltradas(sorted);
      } catch (error) {
        console.error("Erro ao buscar aulas:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAulas();
  }, []);

  function temVaga(aula) {
    return aula.numeroInscricoes < aula.maximoInscricoes;
  }

  // filtro vagas
  useEffect(() => {
    if (filtrarComVagas) {
      setAulasFiltradas(aulas.filter((a) => temVaga(a)));
    } else {
      setAulasFiltradas(aulas);
    }
  }, [filtrarComVagas, aulas]);

  function abrirDialogExclusao(aula) {
    setAulaSelecionada(aula);
    setConfirmDialogOpen(true);
  }

  async function excluirAula() {
    if (!aulaSelecionada) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/aulas/${aulaSelecionada.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
        throw new Error("Erro ao excluir aula: " + response.status);
      setAulas((prev) => prev.filter((a) => a.id !== aulaSelecionada.id));
    } catch (error) {
      console.error("Erro ao excluir aula:", error);
    } finally {
      setConfirmDialogOpen(false);
      setAulaSelecionada(null);
    }
  }

  async function abrirDialogInscricao(aula) {
    setAulaSelecionada(aula);
    setAlunoSelecionado("");
    try {
      const token = localStorage.getItem("auth_token");

      const [clientesRes, aulaRes] = await Promise.all([
        fetch("/api/clientes", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/aulas/${aula.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!clientesRes.ok || !aulaRes.ok)
        throw new Error("Erro ao buscar dados");

      const clientesData = await clientesRes.json();
      const aulaData = await aulaRes.json();

      setClientes(clientesData);
      setAlunosInscritos(aulaData.alunosInscritos || []);
      setInscricaoDialogOpen(true);
    } catch (error) {
      console.error("Erro ao abrir inscrição:", error);
      setSnackbar({
        open: true,
        message: "Erro ao carregar dados.",
        severity: "error",
      });
    }
  }

  async function confirmarInscricao() {
    if (!alunoSelecionado) return;
    setSubmitting(true);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/inscricoes-aula", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          aulaId: aulaSelecionada.id,
          clienteId: alunoSelecionado,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Erro ao inscrever aluno.");

      setAulas((prev) =>
        prev.map((a) =>
          a.id === aulaSelecionada.id
            ? { ...a, numeroInscricoes: a.numeroInscricoes + 1 }
            : a
        )
      );

      if (detalhesAulas[aulaSelecionada.id]) {
        setDetalhesAulas((prev) => ({
          ...prev,
          [aulaSelecionada.id]: {
            ...prev[aulaSelecionada.id],
            alunosInscritos: [
              ...prev[aulaSelecionada.id].alunosInscritos,
              clientes.find((c) => c.id === alunoSelecionado),
            ],
          },
        }));
      }

      setSnackbar({
        open: true,
        message: "Inscrição realizada com sucesso!",
        severity: "success",
      });
      setInscricaoDialogOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleExpand(aula) {
    const isExpanded = expandedRows[aula.id];

    if (!isExpanded && !detalhesAulas[aula.id]) {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`/api/aulas/${aula.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Erro ao buscar detalhes da aula");

        const data = await response.json();
        setDetalhesAulas((prev) => ({ ...prev, [aula.id]: data }));
      } catch (error) {
        console.error(error);
        setSnackbar({
          open: true,
          message: "Erro ao carregar inscrições.",
          severity: "error",
        });
      }
    }

    setExpandedRows((prev) => ({ ...prev, [aula.id]: !isExpanded }));
  }

  async function removerInscricao(idInscricao, aulaId) {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/inscricoes-aula/${idInscricao}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao remover inscrição.");

      setDetalhesAulas((prev) => ({
        ...prev,
        [aulaId]: {
          ...prev[aulaId],
          alunosInscritos: prev[aulaId].alunosInscritos.filter(
            (aluno) => aluno.idInscricao !== idInscricao
          ),
        },
      }));

      setAulas((prev) =>
        prev.map((a) =>
          a.id === aulaId
            ? { ...a, numeroInscricoes: a.numeroInscricoes - 1 }
            : a
        )
      );

      setSnackbar({
        open: true,
        message: "Inscrição removida com sucesso!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    }
  }

  function getMotivoInelegibilidade(c) {
    const hoje = new Date();

    if (!c.plano) return "sem plano";
    if (!c.dataTerminoAssinatura) return "sem assinatura";
    if (new Date(c.dataTerminoAssinatura) < hoje) return "assinatura vencida";
    if (c.numeroInscricoesAtivas >= c.limiteDeInscricoes)
      return "sem inscrições disponíveis";

    return null;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={2}>
      {/* filtros */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h5">Lista de Aulas</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={filtrarComVagas}
                onChange={(e) => setFiltrarComVagas(e.target.checked)}
              />
            }
            label="Com vagas"
          />

          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate({ to: "/aulas/novo" })}
          >
            Nova Aula
          </Button>
        </Box>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Modalidade</TableCell>
            <TableCell>Professor</TableCell>
            <TableCell>Dia da Semana</TableCell>
            <TableCell>Horário</TableCell>
            <TableCell>Inscrições</TableCell>
            <TableCell>Vagas?</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {aulasFiltradas.map((aula) => (
            <>
              <TableRow key={aula.id}>
                <TableCell>
                  <IconButton onClick={() => toggleExpand(aula)}>
                    {expandedRows[aula.id] ? (
                      <KeyboardArrowUp />
                    ) : (
                      <KeyboardArrowDown />
                    )}
                  </IconButton>
                </TableCell>
                <TableCell>{aula.modalidadeNome ?? "-"}</TableCell>
                <TableCell>{aula.professorNome ?? "-"}</TableCell>
                <TableCell>{aula.diaDaSemana}</TableCell>
                <TableCell>{aula.horario}</TableCell>
                <TableCell>
                  {aula.numeroInscricoes} / {aula.maximoInscricoes}
                </TableCell>
                <TableCell>
                  {temVaga(aula) ? (
                    <CheckCircle color="success" />
                  ) : (
                    <Cancel color="error" />
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    disabled={!temVaga(aula)}
                    onClick={() => abrirDialogInscricao(aula)}
                    title="Inscrever aluno"
                  >
                    🎟️
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => navigate({ to: `/aulas/${aula.id}/editar` })}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => abrirDialogExclusao(aula)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>

              {/* lista de inscricoes */}
              <TableRow>
                <TableCell colSpan={8} sx={{ p: 0 }}>
                  <Collapse
                    in={expandedRows[aula.id]}
                    timeout="auto"
                    unmountOnExit
                  >
                    <Box m={2} marginLeft={17}>
                      <Typography variant="subtitle1" gutterBottom>
                        Inscrições
                      </Typography>
                      {detalhesAulas[aula.id] ? (
                        <Table size="small">
                          <TableBody>
                            {detalhesAulas[aula.id].alunosInscritos.length >
                            0 ? (
                              detalhesAulas[aula.id].alunosInscritos.map(
                                (aluno) => (
                                  <TableRow key={aluno.idInscricao}>
                                    <TableCell sx={{ borderBottom: "none" }}>
                                      {aluno.nome} - Inscrito em{" "}
                                      {aluno.dataDaInscricao
                                        ? formatDate(aluno.dataDaInscricao)
                                        : formatDate(getHoje())}
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: "none" }}>
                                      <IconButton
                                        color="error"
                                        onClick={() =>
                                          removerInscricao(
                                            aluno.idInscricao,
                                            aula.id
                                          )
                                        }
                                      >
                                        <RemoveCircleIcon />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                )
                              )
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={2}
                                  align="center"
                                  sx={{ borderBottom: "none" }}
                                >
                                  Nenhum aluno inscrito
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      ) : (
                        <Box display="flex" justifyContent="center" p={2}>
                          <CircularProgress size={24} />
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </>
          ))}
        </TableBody>
      </Table>

      {/* dialog inscricao */}
      <Dialog
        open={inscricaoDialogOpen}
        onClose={() => setInscricaoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Inscrever Aluno</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel id="aluno-select-label">Aluno</InputLabel>
            <Select
              labelId="aluno-select-label"
              value={alunoSelecionado}
              onChange={(e) => setAlunoSelecionado(e.target.value)}
              label="Aluno"
            >
              {alunosInscritos
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .map((aluno) => (
                  <MenuItem key={aluno.id} value={aluno.id} disabled>
                    {aluno.nome} (já inscrito)
                  </MenuItem>
                ))}

              {clientes
                // nao inscritos
                .filter((c) => !alunosInscritos.some((a) => a.id === c.id))
                // ordernacao nome
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .map((cliente) => {
                  const motivo = getMotivoInelegibilidade(cliente);
                  const isDisabled = Boolean(motivo);

                  return (
                    <MenuItem
                      key={cliente.id}
                      value={cliente.id}
                      disabled={isDisabled}
                    >
                      {cliente.nome}
                      {isDisabled && ` (${motivo})`}
                    </MenuItem>
                  );
                })}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInscricaoDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={confirmarInscricao}
            disabled={!alunoSelecionado || submitting}
            variant="contained"
          >
            {submitting ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* dialog exclusao */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          Deseja realmente excluir a aula de{" "}
          <strong>{aulaSelecionada?.modalidadeNome}</strong> com o professor{" "}
          <strong>{aulaSelecionada?.professorNome}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={excluirAula}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* snackbar confirmacao e erro */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
