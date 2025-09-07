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
  Snackbar,
  Alert,
} from "@mui/material";
import { CheckCircle, Cancel, Delete, Edit } from "@mui/icons-material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/equipamentos/")({
  component: EquipamentosPage,
});

function EquipamentosPage() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // equipamento selecionado para excluir
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchEquipamentos();
  }, []);

  async function fetchEquipamentos() {
    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/equipamentos", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro na requisição: " + response.status);
      }

      const data = await response.json();

      const sorted = data.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

      setEquipamentos(sorted);
    } catch (error) {
      console.error("Erro ao buscar equipamentos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/equipamentos/${selected.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erro ao excluir equipamento.");
      }

      setEquipamentos((prev) => prev.filter((eq) => eq.id !== selected.id));
      setSuccess("Equipamento excluído com sucesso!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSelected(null);
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
        <Typography variant="h5">Lista de Equipamentos</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate({ to: "/equipamentos/novo" })}
        >
          Novo Equipamento
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Descrição</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {equipamentos.map((eq) => (
            <TableRow key={eq.id}>
              <TableCell>{eq.nome}</TableCell>
              <TableCell>{eq.descricao}</TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  {eq.emManutencao ? (
                    <>
                      <Cancel color="error" />
                      <Typography variant="body2" color="error">
                        Em manutenção
                      </Typography>
                    </>
                  ) : (
                    <>
                      <CheckCircle color="success" />
                      <Typography variant="body2" color="textSecondary">
                        Operando
                      </Typography>
                    </>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <IconButton
                  color="primary"
                  onClick={() =>
                    navigate({ to: `/equipamentos/${eq.id}/editar` })
                  }
                >
                  <Edit />
                </IconButton>
                <IconButton color="error" onClick={() => setSelected(eq)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Diálogo de confirmação */}
      <Dialog open={!!selected} onClose={() => setSelected(null)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o equipamento{" "}
            <strong>{selected?.nome}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de sucesso */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
      >
        <Alert
          severity="success"
          onClose={() => setSuccess("")}
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>

      {/* Snackbar de erro */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError("")}
      >
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
