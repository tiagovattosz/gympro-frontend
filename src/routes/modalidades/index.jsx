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

export const Route = createFileRoute("/modalidades/")({
  component: ModalidadesPage,
});

function ModalidadesPage() {
  const [modalidades, setModalidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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

    fetchModalidades();
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
        <Typography variant="h5">Lista de Modalidades</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate({ to: "/modalidades/novo" })}
        >
          Novo Cliente
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Descrição</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {modalidades.map((modalidade) => (
            <TableRow key={modalidade.id}>
              <TableCell>{modalidade.descricao}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
