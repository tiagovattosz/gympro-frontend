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
  TextField,
  Button,
} from "@mui/material";
import { Person, Search } from "@mui/icons-material";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";

export const Route = createFileRoute("/movimentos/")({
  component: MovimentosPage,
});

function MovimentosPage() {
  const [movimentos, setMovimentos] = useState([]);
  const [filteredMovimentos, setFilteredMovimentos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [matricula, setMatricula] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    fetchMovimentos();
  }, []);

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
      setFilteredMovimentos(data);
    } catch (error) {
      console.error("Erro ao buscar movimentos:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleFilter() {
    let filtrados = [...movimentos];

    if (matricula.trim() !== "") {
      filtrados = filtrados.filter((mov) =>
        mov.matricula?.toLowerCase().includes(matricula.toLowerCase())
      );
    }

    if (dataInicio !== "" && dataFim !== "") {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      // normaliza fim para incluir todo o dia (até 23:59:59.999)
      fim.setHours(23, 59, 59, 999);
      filtrados = filtrados.filter((mov) => {
        const dataMov = parseDateStringToLocal(mov.data);
        return dataMov >= inicio && dataMov <= fim;
      });
    }

    setFilteredMovimentos(filtrados);
  }

  function limparFiltros() {
    setMatricula("");
    setDataInicio("");
    setDataFim("");
    setFilteredMovimentos(movimentos);
  }

  // Recebe "YYYY-MM-DD" e retorna Date local (evita shift UTC)
  function parseDateStringToLocal(dateStr) {
    if (!dateStr) return null;
    // aceita também caso já venha no formato 'YYYY-MM-DDTHH:mm:ss' (retira parte da hora)
    const onlyDate = dateStr.split("T")[0];
    const match = onlyDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      // fallback: tenta criar Date normalmente
      return new Date(dateStr);
    }
    const [, yyyy, mm, dd] = match;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }

  function formatarData(dataStr) {
    const d = parseDateStringToLocal(dataStr);
    if (!d || Number.isNaN(d.getTime())) return "-";
    return format(d, "dd/MM/yyyy");
  }

  // Recebe "HH:mm" ou "HH:mm:ss" ou "HH:mm:ss.sssss" -> retorna "HH:mm:ss" (sem microssegundos)
  function formatHora(horaCompleta) {
    if (!horaCompleta) return "-";
    // se hora completa contém ponto (microsegundos), remova tudo após o ponto
    const semMicros = horaCompleta.split(".")[0];
    // se for apenas "HH:mm", devolve como está; se tiver segundos, pega primeiro 8 chars
    if (semMicros.length >= 8) return semMicros.substring(0, 8);
    return semMicros;
  }

  function formatarCPF(cpf) {
    if (!cpf) return "-";
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
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Registros de Entrada e Saída
      </Typography>

      {/* filtros */}
      <Box
        display="flex"
        flexWrap="wrap"
        alignItems="center"
        gap={2}
        mb={3}
        mt={2}
      >
        <TextField
          label="Matrícula"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          size="small"
        />

        <TextField
          label="Data Início"
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Data Fim"
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />

        <Button
          variant="contained"
          color="primary"
          startIcon={<Search />}
          onClick={handleFilter}
        >
          Filtrar
        </Button>

        <Button variant="outlined" color="secondary" onClick={limparFiltros}>
          Limpar
        </Button>
      </Box>

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
          {filteredMovimentos.length > 0 ? (
            filteredMovimentos.map((mov) => (
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Nenhum movimento encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
