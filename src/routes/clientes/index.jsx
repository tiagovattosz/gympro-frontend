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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { CheckCircle, Cancel, Delete as DeleteIcon } from "@mui/icons-material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { differenceInCalendarDays } from "date-fns";

export const Route = createFileRoute("/clientes/")({
  component: ClientesPage,
});

function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClientes();
  }, []);

  async function fetchClientes() {
    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/clientes", {
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

      setClientes(sorted);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function excluirCliente() {
    if (!clienteSelecionado) return;

    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`/api/clientes/${clienteSelecionado.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir cliente: " + response.status);
      }

      setClientes((prev) =>
        prev.filter((cliente) => cliente.id !== clienteSelecionado.id)
      );
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
    } finally {
      setConfirmDialogOpen(false);
      setClienteSelecionado(null);
    }
  }

  function abrirDialogExclusao(cliente) {
    setClienteSelecionado(cliente);
    setConfirmDialogOpen(true);
  }

  function isAssinaturaAtiva(dataTermino) {
    if (!dataTermino) return false;
    return new Date(dataTermino) > new Date();
  }

  function formatCPF(cpf) {
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }

  function formatCelular(celular) {
    return celular.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }

  function diasRestantes(dataTermino) {
    const hoje = new Date();
    const termino = new Date(dataTermino);
    return differenceInCalendarDays(termino, hoje) + 1;
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
        <Typography variant="h5">Lista de Clientes</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate({ to: "/clientes/novo" })}
        >
          Novo Cliente
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Matrícula</TableCell>
            <TableCell>CPF</TableCell>
            <TableCell>Celular</TableCell>
            <TableCell>Plano</TableCell>
            <TableCell>Status da Assinatura</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell>{cliente.nome}</TableCell>
              <TableCell>{cliente.matricula}</TableCell>
              <TableCell>{formatCPF(cliente.cpf)}</TableCell>
              <TableCell>{formatCelular(cliente.celular)}</TableCell>
              <TableCell>{cliente.plano || "-"}</TableCell>
              <TableCell>
                {isAssinaturaAtiva(cliente.dataTerminoAssinatura) ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle color="success" />
                    <Typography variant="body2" color="textSecondary">
                      {diasRestantes(cliente.dataTerminoAssinatura)} dias
                      restantes
                    </Typography>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Cancel color="error" />
                    <Typography variant="body2" color="error">
                      Vencida
                    </Typography>
                  </Box>
                )}
              </TableCell>
              <TableCell>
                <IconButton
                  color="error"
                  onClick={() => abrirDialogExclusao(cliente)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialogo de confirmação */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          Deseja realmente excluir o cliente{" "}
          <strong>{clienteSelecionado?.nome}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
          <Button color="error" onClick={excluirCliente}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
