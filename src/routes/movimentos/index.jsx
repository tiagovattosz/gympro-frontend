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

function formatISODate(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function MovimentosPage() {
  const [movimentos, setMovimentos] = useState([]);
  const [filteredMovimentos, setFilteredMovimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matricula, setMatricula] = useState("");

  const hoje = new Date();
  const semanaPassada = new Date();
  semanaPassada.setDate(hoje.getDate() - 7);

  const [dataInicio, setDataInicio] = useState(formatISODate(semanaPassada));
  const [dataFim, setDataFim] = useState(formatISODate(hoje));

  useEffect(() => {
    async function carregar() {
      await fetchMovimentos();
    }
    carregar();
  }, []);

  useEffect(() => {
    if (movimentos.length > 0) {
      handleFilter(); // aplica o filtro automático assim que carregar
    }
  }, [movimentos]);

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
      const [anoI, mesI, diaI] = dataInicio.split("-").map(Number);
      const inicio = new Date(anoI, mesI - 1, diaI, 0, 0, 0, 0);

      const [anoF, mesF, diaF] = dataFim.split("-").map(Number);
      const fim = new Date(anoF, mesF - 1, diaF, 23, 59, 59, 999);

      filtrados = filtrados.filter((mov) => {
        const [ano, mes, dia] = mov.data.split("-").map(Number);
        const [hora, minuto, segundo] = mov.hora
          .split(":")
          .map((v) => parseInt(v) || 0);

        const dataMov = new Date(ano, mes - 1, dia, hora, minuto, segundo);

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

  function parseDateStringToLocal(dateStr) {
    if (!dateStr) return null;
    const onlyDate = dateStr.split("T")[0];
    const match = onlyDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
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

  function formatHora(horaCompleta) {
    if (!horaCompleta) return "-";
    const semMicros = horaCompleta.split(".")[0];
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
