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

export const Route = createFileRoute("/modalidades/")({
  component: ModalidadesPage,
});

function ModalidadesPage() {
  const [modalidades, setModalidades] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <Typography variant="h5" gutterBottom>
        Lista de Modalidades
      </Typography>
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
