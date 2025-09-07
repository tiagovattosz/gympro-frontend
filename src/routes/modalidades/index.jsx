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
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Delete, Edit } from "@mui/icons-material";

export const Route = createFileRoute("/modalidades/")({
  component: ModalidadesPage,
});

function ModalidadesPage() {
  const [modalidades, setModalidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedModalidade, setSelectedModalidade] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchModalidades();
  }, []);

  async function fetchModalidades() {
    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/modalidades", {
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

      setModalidades(sorted);
    } catch (error) {
      console.error("Erro ao buscar modalidades:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleDeleteClick(modalidade) {
    setSelectedModalidade(modalidade);
    setOpenDialog(true);
  }

  function handleCloseDialog() {
    setOpenDialog(false);
    setSelectedModalidade(null);
  }

  async function handleConfirmDelete() {
    if (!selectedModalidade) return;

    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch(
        `/api/modalidades/${selectedModalidade.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Erro ao excluir modalidade");

      setModalidades((prev) =>
        prev.filter((m) => m.id !== selectedModalidade.id)
      );
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir modalidade.");
    } finally {
      handleCloseDialog();
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
        <Typography variant="h5">Lista de Modalidades</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate({ to: "/modalidades/novo" })}
        >
          Nova Modalidade
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
          {modalidades.map((modalidade) => (
            <TableRow key={modalidade.id}>
              <TableCell>{modalidade.descricao}</TableCell>
              <TableCell>
                {/* Botão de Editar */}
                <IconButton
                  color="primary"
                  onClick={() =>
                    navigate({ to: `/modalidades/${modalidade.id}/editar` })
                  }
                >
                  <Edit />
                </IconButton>

                {/* Botão de Deletar */}
                <IconButton
                  color="error"
                  onClick={() => handleDeleteClick(modalidade)}
                >
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialog de confirmação */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir a modalidade{" "}
            <strong>{selectedModalidade?.descricao}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button color="error" onClick={handleConfirmDelete}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
