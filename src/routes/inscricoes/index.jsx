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
import { format, parseISO, compareAsc } from "date-fns";

export const Route = createFileRoute("/inscricoes/")({
  component: InscricoesPage,
});

function InscricoesPage() {
  const [inscricoes, setInscricoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInscricoes() {
      try {
        const token = localStorage.getItem("auth_token");

        const response = await fetch("/api/inscricoes-aula", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro na requisição: " + response.status);
        }

        const data = await response.json();

        // Ordenar por dataInscricao (do mais antigo para o mais recente)
        const sorted = data.sort((a, b) =>
          compareAsc(parseISO(a.dataInscricao), parseISO(b.dataInscricao))
        );

        setInscricoes(sorted);
      } catch (error) {
        console.error("Erro ao buscar inscrições:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInscricoes();
  }, []);

  function formatarData(data) {
    return format(parseISO(data), "dd/MM/yyyy");
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
        Lista de Inscrições
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Cliente</TableCell>
            <TableCell>Aula</TableCell>
            <TableCell>Data da Inscrição</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inscricoes.map((insc) => (
            <TableRow key={insc.id}>
              <TableCell>{insc.clienteNome}</TableCell>
              <TableCell>{insc.aulaDescricao}</TableCell>
              <TableCell>{formatarData(insc.dataInscricao)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
