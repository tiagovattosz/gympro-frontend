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
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { createFileRoute } from "@tanstack/react-router";
import { differenceInCalendarDays } from "date-fns";

export const Route = createFileRoute("/clientes/")({
  component: ClientesPage,
});

function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

        const sorted = data.sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR")
        );

        setClientes(sorted);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchClientes();
  }, []);

  function isAssinaturaAtiva(dataTermino) {
    if (!dataTermino) {
      return false;
    }
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
      <Typography variant="h5" gutterBottom>
        Lista de Clientes
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Matrícula</TableCell>
            <TableCell>CPF</TableCell>
            <TableCell>Celular</TableCell>
            <TableCell>Plano</TableCell>
            <TableCell>Status da Assinatura</TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
