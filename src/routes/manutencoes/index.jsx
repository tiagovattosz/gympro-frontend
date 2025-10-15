import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import { Check, Close } from "@mui/icons-material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/manutencoes/")({
  component: ManutencoesPage,
});

function ManutencoesPage() {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [manutencoes, setManutencoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const endpoints = [
      "/api/manutencoes/solicitacoes",
      "/api/manutencoes/em-realizacao",
      "/api/manutencoes/realizadas",
      "/api/manutencoes/canceladas-e-rejeitadas",
    ];
    const fetchManutencoes = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(endpoints[tabIndex], {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Erro ao buscar manutenções");
        const data = await response.json();
        setManutencoes(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchManutencoes();
  }, [tabIndex]);

  async function handleAcao(id, acao) {
    try {
      const token = localStorage.getItem("auth_token");
      const url = `/api/manutencoes/${acao}/${id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erro na ação");
      }
      setManutencoes((prev) => prev.filter((m) => m.id !== id));
      setSuccess(`Manutenção ${acao} com sucesso!`);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  const renderAcoes = (manutencao) => {
    switch (tabIndex) {
      case 0: // Solicitações
        return (
          <>
            <IconButton
              color="success"
              onClick={() => handleAcao(manutencao.id, "aceitar-manutencao")}
            >
              <Check />
            </IconButton>
            <IconButton
              color="error"
              onClick={() => handleAcao(manutencao.id, "rejeitar-manutencao")}
            >
              <Close />
            </IconButton>
          </>
        );
      case 1: // Em realização
        return (
          <>
            <IconButton
              color="success"
              onClick={() => handleAcao(manutencao.id, "realizar-manutencao")}
            >
              <Check />
            </IconButton>
            <IconButton
              color="error"
              onClick={() => handleAcao(manutencao.id, "cancelar-manutencao")}
            >
              <Close />
            </IconButton>
          </>
        );
      default:
        return null; // realizadas e canceladas/rejeitadas não têm ações
    }
  };

  return (
    <Box p={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Lista de Manutenções</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate({ to: "/manutencoes/novo" })}
        >
          Nova Solicitação
        </Button>
      </Box>

      <Tabs
        value={tabIndex}
        onChange={(e, val) => setTabIndex(val)}
        sx={{ mb: 2 }}
      >
        <Tab label="Novas Solicitações" />
        <Tab label="Em Realização" />
        <Tab label="Realizadas" />
        <Tab label="Canceladas/Rejeitadas" />
      </Tabs>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Funcionário</TableCell>
            <TableCell>Equipamento</TableCell>
            <TableCell>Descrição</TableCell>
            <TableCell>Data Solicitação</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {manutencoes.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{m.nomeFuncionario}</TableCell>
              <TableCell>{m.nomeEquipamento}</TableCell>
              <TableCell>{m.descricao}</TableCell>
              <TableCell>
                {new Date(m.dataSolicitacao).toLocaleString("pt-BR")}
              </TableCell>
              <TableCell>{renderAcoes(m)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* snackbar de sucesso */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
      >
        <Alert severity="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      </Snackbar>

      {/* snackbar de erro */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError("")}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
