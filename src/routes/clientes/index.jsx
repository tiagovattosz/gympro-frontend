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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { differenceInCalendarDays } from "date-fns";

export const Route = createFileRoute("/clientes/")({
  component: ClientesPage,
});

function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [planoDialogOpen, setPlanoDialogOpen] = useState(false);
  const [planoId, setPlanoId] = useState("");
  const [dataInicio, setDataInicio] = useState("");

  const [filtro, setFiltro] = useState("nome");
  const [termoPesquisa, setTermoPesquisa] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchClientes();
    fetchPlanos();
  }, []);

  async function fetchClientes() {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/clientes", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok)
        throw new Error("Erro na requisição: " + response.status);

      const data = await response.json();
      const sorted = data.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
      setClientes(sorted);
      setClientesFiltrados(sorted);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPlanos() {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/planos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPlanos(data);
      }
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
    }
  }

  function normalizarTexto(texto) {
    return texto
      ? texto
          .toString()
          .normalize("NFD") // remove acentuação
          .replace(/[\u0300-\u036f]/g, "") // remove diacríticos
          .replace(/[.\-\/\s]/g, "") // remove pontuação comum
          .toLowerCase()
      : "";
  }

  useEffect(() => {
    const termoNormalizado = normalizarTexto(termoPesquisa);

    const filtrados = clientes.filter((cliente) => {
      const nome = normalizarTexto(cliente.nome);
      const matricula = normalizarTexto(cliente.matricula);
      const cpf = normalizarTexto(cliente.cpf);

      if (filtro === "nome") {
        return nome.includes(termoNormalizado);
      } else if (filtro === "matricula") {
        return matricula.includes(termoNormalizado);
      } else if (filtro === "cpf") {
        return cpf.includes(termoNormalizado);
      }
      return true;
    });

    setClientesFiltrados(filtrados);
  }, [termoPesquisa, filtro, clientes]);

  async function excluirCliente() {
    if (!clienteSelecionado) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/clientes/${clienteSelecionado.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erro ao excluir cliente");

      setClientes((prev) => prev.filter((c) => c.id !== clienteSelecionado.id));
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
    } finally {
      setConfirmDialogOpen(false);
      setClienteSelecionado(null);
    }
  }

  async function definirPlano() {
    if (!clienteSelecionado || !planoId || !dataInicio) return;

    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/assinaturas/definir-plano", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clienteId: clienteSelecionado.id,
          planoId: Number(planoId),
          dataInicioAssinatura: dataInicio,
        }),
      });

      if (!response.ok) throw new Error("Erro ao definir plano");

      setPlanoDialogOpen(false);
      setPlanoId("");
      setDataInicio("");
      await fetchClientes();
    } catch (error) {
      alert("Não foi possível definir plano");
      console.error("Erro ao definir plano:", error);
    }
  }

  function abrirDialogPlano(cliente) {
    setClienteSelecionado(cliente);
    setPlanoDialogOpen(true);
  }

  function abrirDialogExclusao(cliente) {
    setClienteSelecionado(cliente);
    setConfirmDialogOpen(true);
  }

  function isAssinaturaAtiva(dataTermino) {
    if (!dataTermino) return false;
    return new Date(dataTermino) > new Date();
  }

  function formatCPF(cpf) {
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }

  function formatCelular(celular) {
    return celular.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }

  function diasRestantes(dataTermino) {
    const hoje = new Date();
    const termino = new Date(dataTermino);
    return differenceInCalendarDays(termino, hoje) + 1;
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
      {/* Cabeçalho e filtros */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h5">Lista de Clientes</Typography>

        <Box display="flex" alignItems="center" gap={2}>
          {/* Tipo de filtro */}
          <TextField
            select
            size="small"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <MenuItem value="nome">Nome</MenuItem>
            <MenuItem value="matricula">Matrícula</MenuItem>
            <MenuItem value="cpf">CPF</MenuItem>
          </TextField>

          {/* Campo de pesquisa */}
          <TextField
            size="small"
            placeholder={`Pesquisar por ${filtro}`}
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate({ to: "/clientes/novo" })}
          >
            Novo Cliente
          </Button>
        </Box>
      </Box>

      {/* Tabela */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Matrícula</TableCell>
            <TableCell>CPF</TableCell>
            <TableCell>Celular</TableCell>
            <TableCell>Plano</TableCell>
            <TableCell>Status da Assinatura</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clientesFiltrados.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell>{cliente.nome}</TableCell>
              <TableCell>{cliente.matricula}</TableCell>
              <TableCell>{formatCPF(cliente.cpf)}</TableCell>
              <TableCell>{formatCelular(cliente.celular)}</TableCell>
              <TableCell>{cliente.plano || "-"}</TableCell>
              <TableCell>
                {isAssinaturaAtiva(cliente.dataTerminoAssinatura) ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle color="success" />
                    <Typography variant="body2" color="textSecondary">
                      {diasRestantes(cliente.dataTerminoAssinatura)} dias
                      restantes
                    </Typography>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Cancel color="error" />
                    <Typography variant="body2" color="error">
                      Vencida
                    </Typography>
                  </Box>
                )}
              </TableCell>
              <TableCell>
                <IconButton
                  color="primary"
                  onClick={() =>
                    navigate({ to: `/clientes/${cliente.id}/editar` })
                  }
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="secondary"
                  onClick={() => abrirDialogPlano(cliente)}
                >
                  <AssignmentIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => abrirDialogExclusao(cliente)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal: Definir Plano */}
      <Dialog open={planoDialogOpen} onClose={() => setPlanoDialogOpen(false)}>
        <DialogTitle>Definir Plano</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            Cliente: <strong>{clienteSelecionado?.nome}</strong>
          </Typography>

          <TextField
            select
            label="Plano"
            fullWidth
            margin="normal"
            value={planoId}
            onChange={(e) => setPlanoId(e.target.value)}
          >
            {planos.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.descricao}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Data de Início"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlanoDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={definirPlano}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogo de confirmação */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          Deseja realmente excluir o cliente{" "}
          <strong>{clienteSelecionado?.nome}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
          <Button color="error" onClick={excluirCliente}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
