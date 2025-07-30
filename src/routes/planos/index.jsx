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
} from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/planos/")({
  component: PlanosPage,
});

function PlanosPage() {
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
