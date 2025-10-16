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
import { getHoje } from "../../utils/getHoje";
import { normalizarTexto } from "../../utils/normalizarTexto";
import formatCelular from "../../utils/formatCelular";
import formatCPF from "../../utils/formatCPF";
import { formatDate } from "../../utils/formatDate";

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
  const [erroData, setErroData] = useState("");
  const [filtroAssinatura, setFiltroAssinatura] = useState("todos");
  const [filtroPlano, setFiltroPlano] = useState("todos");

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

  function handleDataChange(e) {
    const valor = e.target.value;
    setDataInicio(valor);

    const hoje = getHoje();
    if (valor > hoje) {
      setErroData("A data de início não pode ser posterior ao dia de hoje.");
    } else {
      setErroData("");
    }
  }

  useEffect(() => {
    const termoNormalizado = normalizarTexto(termoPesquisa);

    const filtrados = clientes.filter((cliente) => {
      const nome = normalizarTexto(cliente.nome);
      const matricula = normalizarTexto(cliente.matricula);
      const cpf = normalizarTexto(cliente.cpf);

      // filtro nome cpf matricula
      let passaFiltroPrincipal = true;
      if (filtro === "nome") {
        passaFiltroPrincipal = nome.includes(termoNormalizado);
      } else if (filtro === "matricula") {
        passaFiltroPrincipal = matricula.includes(termoNormalizado);
      } else if (filtro === "cpf") {
        passaFiltroPrincipal = cpf.includes(termoNormalizado);
      }

      // filtro assinatura
      const ativa = isAssinaturaAtiva(cliente.dataTerminoAssinatura);
      let passaFiltroAssinatura = true;
      if (filtroAssinatura === "ativa") passaFiltroAssinatura = ativa;
      else if (filtroAssinatura === "vencida") passaFiltroAssinatura = !ativa;

      // filtro plano
      let passaFiltroPlano = true;
      if (filtroPlano !== "todos") {
        passaFiltroPlano =
          normalizarTexto(cliente.plano) === normalizarTexto(filtroPlano);
      }

      return passaFiltroPrincipal && passaFiltroAssinatura && passaFiltroPlano;
    });

    setClientesFiltrados(filtrados);
  }, [termoPesquisa, filtro, clientes, filtroAssinatura, filtroPlano]);

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
    const hoje = new Date().toLocaleDateString("en-CA");
    setClienteSelecionado(cliente);
    setPlanoId("");
    setDataInicio(hoje);
    setPlanoDialogOpen(true);
  }

  async function removerPlano() {
    if (!clienteSelecionado) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/assinaturas/remover-plano", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clienteId: clienteSelecionado.id }),
      });

      if (!response.ok) throw new Error("Erro ao remover plano");

      setPlanoDialogOpen(false);
      await fetchClientes();
    } catch (error) {
      console.error("Erro ao remover plano:", error);
      alert("Não foi possível remover o plano.");
    }
  }

  function abrirDialogExclusao(cliente) {
    setClienteSelecionado(cliente);
    setConfirmDialogOpen(true);
  }

  function isAssinaturaAtiva(dataTermino) {
    if (!dataTermino) return false;
    return new Date(dataTermino) > new Date();
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h5">Lista de Clientes</Typography>

        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <TextField
            select
            label="Filtrar por plano"
            value={filtroPlano}
            onChange={(e) => setFiltroPlano(e.target.value)}
            size="small"
            sx={{ minWidth: 250 }}
          >
            <MenuItem value="todos">Todos os planos</MenuItem>
            {planos.map((p) => (
              <MenuItem key={p.id} value={p.descricao}>
                {p.descricao}
              </MenuItem>
            ))}
          </TextField>

          {/* filtro assinatura */}
          <TextField
            select
            size="small"
            value={filtroAssinatura}
            onChange={(e) => setFiltroAssinatura(e.target.value)}
            label="Assinatura"
          >
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="ativa">Ativa</MenuItem>
            <MenuItem value="vencida">Vencida</MenuItem>
          </TextField>

          {/* tipo cpf, nome, matricula */}
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

          {/* input */}
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

      <Box mb={2}></Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Matrícula</TableCell>
            <TableCell>CPF</TableCell>
            <TableCell>Celular</TableCell>
            <TableCell>Plano</TableCell>
            <TableCell>Inscrições</TableCell>
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
                {cliente.plano
                  ? cliente.numeroInscricoesAtivas +
                    "/" +
                    cliente.limiteDeInscricoes
                  : "-"}
              </TableCell>
              <TableCell>
                {isAssinaturaAtiva(cliente.dataTerminoAssinatura) ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle color="success" />
                    <Typography variant="body2" color="textSecondary">
                      {formatDate(cliente.dataTerminoAssinatura) + " "} -
                      {" " + diasRestantes(cliente.dataTerminoAssinatura)} dias
                      restantes
                    </Typography>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Cancel color="error" />
                    <Typography variant="body2" color="error">
                      Vencida em {formatDate(cliente.dataTerminoAssinatura)}
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

      {/* dialog assinatura */}
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
            onChange={handleDataChange}
            error={!!erroData}
            helperText={erroData}
            inputProps={{
              max: new Date().toLocaleDateString("en-CA"),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlanoDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={removerPlano}>
            Remover plano
          </Button>
          <Button
            disabled={!!erroData}
            variant="contained"
            onClick={definirPlano}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* dialog exclusão */}
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
