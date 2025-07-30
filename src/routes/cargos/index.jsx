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

export const Route = createFileRoute("/cargos/")({
  component: CargosPage,
});

function CargosPage() {
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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

    fetchCargos();
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
          </TableRow>
        </TableHead>
        <TableBody>
          {cargos.map((cargo) => (
            <TableRow key={cargo.id}>
              <TableCell>{cargo.descricao}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
