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
import { createFileRoute } from "@tanstack/react-router";
import { AdminPanelSettings } from "@mui/icons-material";

export const Route = createFileRoute("/funcionarios/")({
  component: FuncionariosPage,
});

function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFuncionarios() {
      try {
        const token = localStorage.getItem("auth_token");

        const response = await fetch("/api/funcionarios", {
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

        setFuncionarios(sorted);
      } catch (error) {
        console.error("Erro ao buscar funcionários:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFuncionarios();
  }, []);

  function formatCPF(cpf) {
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }

  function formatCelular(celular) {
    return celular.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
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
        Lista de Funcionários
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Matrícula</TableCell>
            <TableCell>CPF</TableCell>
            <TableCell>Celular</TableCell>
            <TableCell>Cargo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {funcionarios.map((func) => (
            <TableRow key={func.id}>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  {func.admin && (
                    <AdminPanelSettings fontSize="small" color="primary" />
                  )}
                  {func.nome}
                </Box>
              </TableCell>

              <TableCell>{func.matricula}</TableCell>
              <TableCell>{formatCPF(func.cpf)}</TableCell>
              <TableCell>{formatCelular(func.celular)}</TableCell>
              <TableCell>{func.cargo || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
