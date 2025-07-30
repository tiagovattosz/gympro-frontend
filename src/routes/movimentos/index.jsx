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
import { Person } from "@mui/icons-material";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";

export const Route = createFileRoute("/movimentos/")({
  component: MovimentosPage,
});

function MovimentosPage() {
  const [movimentos, setMovimentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovimentos() {
      try {
        const token = localStorage.getItem("auth_token");

        const response = await fetch("/api/movimentos", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro na requisição: " + response.status);
        }

        const data = await response.json();
        setMovimentos(data);
      } catch (error) {
        console.error("Erro ao buscar movimentos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMovimentos();
  }, []);

  function formatarData(data) {
    return format(new Date(data), "dd/MM/yyyy");
  }

  function formatHora(horaCompleta) {
    return horaCompleta.substring(0, 8); // "HH:mm:ss"
  }

  function formatarCPF(cpf) {
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
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
        Registros de Entrada e Saída
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>CPF</TableCell>
            <TableCell>Matrícula</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Hora</TableCell>
            <TableCell>Tipo de Movimento</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {movimentos.map((mov) => (
            <TableRow key={mov.id}>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  {mov.tipoPessoa === "F" && <Person color="primary" />}
                  {mov.nome}
                </Box>
              </TableCell>
              <TableCell>{formatarCPF(mov.cpf)}</TableCell>
              <TableCell>{mov.matricula}</TableCell>
              <TableCell>{formatarData(mov.data)}</TableCell>
              <TableCell>{formatHora(mov.hora)}</TableCell>
              <TableCell>{mov.tipoMovimentacao}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
