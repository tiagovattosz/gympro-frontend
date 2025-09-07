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
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/planos/")({
  component: PlanosPage,
});

function PlanosPage() {
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planoSelecionado, setPlanoSelecionado] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlanos();
  }, []);

  async function fetchPlanos() {
    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/planos", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro na requisição: " + response.status);
      }

      const data = await response.json();
      const sorted = data.sort((a, b) => a.valor - b.valor);

      setPlanos(sorted);
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
    } finally {
      setLoading(false);
    }
  }

  function abrirDialogExclusao(plano) {
    setPlanoSelecionado(plano);
    setConfirmDialogOpen(true);
  }

  async function excluirPlano() {
    if (!planoSelecionado) return;

    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`/api/planos/${planoSelecionado.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 409) {
        const errorData = await response.json();
        alert(errorData.message || "Erro de integridade ao excluir plano.");
        return;
      }

      if (!response.ok) {
        throw new Error("Erro ao excluir plano: " + response.status);
      }

      setPlanos((prev) => prev.filter((p) => p.id !== planoSelecionado.id));
    } catch (error) {
      console.error("Erro ao excluir plano:", error);
      alert("Erro inesperado ao excluir o plano.");
    } finally {
      setConfirmDialogOpen(false);
      setPlanoSelecionado(null);
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
        <Typography variant="h5">Lista de Planos</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate({ to: "/planos/novo" })}
        >
          Novo Plano
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Descrição</TableCell>
            <TableCell>Valor (R$)</TableCell>
            <TableCell>Máximo Inscrições</TableCell>
            <TableCell>Duração em meses</TableCell>
            <TableCell>Detalhes</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {planos.map((plano) => (
            <TableRow key={plano.id}>
              <TableCell>{plano.descricao}</TableCell>
              <TableCell>
                {String(plano.valor.toFixed(2)).replace(".", ",")}
              </TableCell>
              <TableCell>{plano.maximoInscricoes}</TableCell>
              <TableCell>{plano.duracaoEmMeses}</TableCell>
              <TableCell>{plano.detalhes || "-"}</TableCell>
              <TableCell>
                {/* Botão de edição */}
                <IconButton
                  color="primary"
                  onClick={() => navigate({ to: `/planos/${plano.id}/editar` })}
                >
                  <EditIcon />
                </IconButton>

                {/* Botão de exclusão */}
                <IconButton
                  color="error"
                  onClick={() => abrirDialogExclusao(plano)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialog de Confirmação */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          Deseja realmente excluir o plano{" "}
          <strong>{planoSelecionado?.descricao}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
          <Button color="error" onClick={excluirPlano}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
