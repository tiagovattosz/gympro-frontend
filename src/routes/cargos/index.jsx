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

export const Route = createFileRoute("/cargos/")({
  component: CargosPage,
});

function CargosPage() {
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cargoSelecionado, setCargoSelecionado] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCargos();
  }, []);

  async function fetchCargos() {
    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/cargos", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro na requisição: " + response.status);
      }

      const data = await response.json();

      const sorted = data.sort((a, b) =>
        a.descricao.localeCompare(b.descricao, "pt-BR")
      );

      setCargos(sorted);
    } catch (error) {
      console.error("Erro ao buscar cargos:", error);
    } finally {
      setLoading(false);
    }
  }

  function abrirDialogExclusao(cargo) {
    setCargoSelecionado(cargo);
    setConfirmDialogOpen(true);
  }

  async function excluirCargo() {
    if (!cargoSelecionado) return;

    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`/api/cargos/${cargoSelecionado.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir cargo: " + response.status);
      }

      setCargos((prev) => prev.filter((c) => c.id !== cargoSelecionado.id));
    } catch (error) {
      console.error("Erro ao excluir cargo:", error);
    } finally {
      setConfirmDialogOpen(false);
      setCargoSelecionado(null);
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
        <Typography variant="h5">Lista de Cargos</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate({ to: "/cargos/novo" })}
        >
          Novo Cargo
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Descrição</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cargos.map((cargo) => (
            <TableRow key={cargo.id}>
              <TableCell>{cargo.descricao}</TableCell>
              <TableCell>
                {/* Botão de Edição */}
                <IconButton
                  color="primary"
                  onClick={() => navigate({ to: `/cargos/${cargo.id}/editar` })}
                >
                  <EditIcon />
                </IconButton>

                {/* Botão de Exclusão */}
                <IconButton
                  color="error"
                  onClick={() => abrirDialogExclusao(cargo)}
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
          Deseja realmente excluir o cargo{" "}
          <strong>{cargoSelecionado?.descricao}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
          <Button color="error" onClick={excluirCargo}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
