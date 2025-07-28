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

export const Route = createFileRoute("/planos/")({
  component: PlanosPage,
});

function PlanosPage() {
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchPlanos();
  }, []);

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
        Lista de Planos
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Descrição</TableCell>
            <TableCell>Valor (R$)</TableCell>
            <TableCell>Máximo Inscrições</TableCell>
            <TableCell>Detalhes</TableCell>
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
              <TableCell>{plano.detalhes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
