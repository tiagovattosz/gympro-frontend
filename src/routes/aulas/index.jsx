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

export const Route = createFileRoute("/aulas/")({
  component: AulasPage,
});

function AulasPage() {
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAulas() {
      try {
        const token = localStorage.getItem("auth_token");

        const response = await fetch("/api/aulas", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro na requisição: " + response.status);
        }

        const data = await response.json();

        const ordemDias = [
          "SEGUNDA",
          "TERÇA",
          "QUARTA",
          "QUINTA",
          "SEXTA",
          "SÁBADO",
          "DOMINGO",
        ];

        const sorted = data.sort((a, b) => {
          const diaA = ordemDias.indexOf(a.diaDaSemana.toUpperCase());
          const diaB = ordemDias.indexOf(b.diaDaSemana.toUpperCase());

          if (diaA !== diaB) return diaA - diaB;

          return a.horario.localeCompare(b.horario);
        });

        setAulas(sorted);
      } catch (error) {
        console.error("Erro ao buscar aulas:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAulas();
  }, []);

  function temVaga(aula) {
    return aula.numeroInscricoes < aula.maximoInscricoes;
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Lista de Aulas</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate({ to: "/aulas/novo" })}
        >
          Nova Aula
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Modalidade</TableCell>
            <TableCell>Professor</TableCell>
            <TableCell>Dia da Semana</TableCell>
            <TableCell>Horário</TableCell>
            <TableCell>Inscrições</TableCell>
            <TableCell>Vagas?</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {aulas.map((aula) => (
            <TableRow key={aula.id}>
              <TableCell>{aula.modalidadeNome}</TableCell>
              <TableCell>{aula.professorNome}</TableCell>
              <TableCell>{aula.diaDaSemana}</TableCell>
              <TableCell>{aula.horario}</TableCell>
              <TableCell>
                {aula.numeroInscricoes} / {aula.maximoInscricoes}
              </TableCell>
              <TableCell>
                {temVaga(aula) ? (
                  <CheckCircle color="success" />
                ) : (
                  <Cancel color="error" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
