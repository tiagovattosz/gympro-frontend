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
import { CheckCircle, Cancel } from "@mui/icons-material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/equipamentos/")({
  component: EquipamentosPage,
});

function EquipamentosPage() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEquipamentos() {
      try {
        const token = localStorage.getItem("auth_token");

        const response = await fetch("/api/equipamentos", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro na requisição: " + response.status);
        }

        const data = await response.json();

        // Ordenar por nome
        const sorted = data.sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR")
        );

        setEquipamentos(sorted);
      } catch (error) {
        console.error("Erro ao buscar equipamentos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEquipamentos();
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
        <Typography variant="h5">Lista de Equipamentos</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate({ to: "/equipamentos/novo" })}
        >
          Novo Equipamento
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Descrição</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {equipamentos.map((eq) => (
            <TableRow key={eq.id}>
              <TableCell>{eq.nome}</TableCell>
              <TableCell>{eq.descricao}</TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  {eq.emManutencao ? (
                    <>
                      <Cancel color="error" />
                      <Typography variant="body2" color="error">
                        Em manutenção
                      </Typography>
                    </>
                  ) : (
                    <>
                      <CheckCircle color="success" />
                      <Typography variant="body2" color="textSecondary">
                        Operando
                      </Typography>
                    </>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
