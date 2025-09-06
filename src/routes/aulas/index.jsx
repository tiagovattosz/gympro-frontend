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
} from "@mui/material";
import { CheckCircle, Cancel, Delete as DeleteIcon } from "@mui/icons-material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/aulas/")({
  component: AulasPage,
});

function AulasPage() {
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aulaSelecionada, setAulaSelecionada] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
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

        if (!response.ok) {
          throw new Error("Erro na requisição: " + response.status);
        }

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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir aula: " + response.status);
      }

      setAulas((prev) => prev.filter((a) => a.id !== aulaSelecionada.id));
    } catch (error) {
      console.error("Erro ao excluir aula:", error);
    } finally {
      setConfirmDialogOpen(false);
      setAulaSelecionada(null);
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
    <Box p={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Lista de Aulas</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate({ to: "/aulas/novo" })}
        >
          Nova Aula
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
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
          {aulas.map((aula) => (
            <TableRow key={aula.id}>
              <TableCell>{aula.modalidadeNome}</TableCell>
              <TableCell>{aula.professorNome}</TableCell>
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
                  color="error"
                  onClick={() => abrirDialogExclusao(aula)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* dialog de exclusao */}
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
    </Box>
  );
}
