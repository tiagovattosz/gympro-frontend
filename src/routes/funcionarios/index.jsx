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
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminPanelSettings, Delete, Edit, Search } from "@mui/icons-material";

export const Route = createFileRoute("/funcionarios/")({
  component: FuncionariosPage,
});

function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionariosFiltrados, setFuncionariosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);

  // 🔍 Controle de filtro e pesquisa
  const [filtro, setFiltro] = useState("nome");
  const [termoPesquisa, setTermoPesquisa] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  async function fetchFuncionarios() {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/funcionarios", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok)
        throw new Error("Erro na requisição: " + response.status);

      const data = await response.json();
      const sorted = data.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
      setFuncionarios(sorted);
      setFuncionariosFiltrados(sorted);
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
    } finally {
      setLoading(false);
    }
  }

  // 🧩 Normalizador de texto (remove acentos, pontuação e espaços)
  function normalizarTexto(texto) {
    return texto
      ? texto
          .toString()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[.\-\/\s]/g, "")
          .toLowerCase()
      : "";
  }

  // 🔎 Filtro dinâmico
  useEffect(() => {
    const termoNormalizado = normalizarTexto(termoPesquisa);

    const filtrados = funcionarios.filter((func) => {
      const nome = normalizarTexto(func.nome);
      const matricula = normalizarTexto(func.matricula);
      const cpf = normalizarTexto(func.cpf);
      const cargo = normalizarTexto(func.cargo);

      if (filtro === "nome") return nome.includes(termoNormalizado);
      if (filtro === "matricula") return matricula.includes(termoNormalizado);
      if (filtro === "cpf") return cpf.includes(termoNormalizado);
      if (filtro === "cargo") return cargo.includes(termoNormalizado);
      return true;
    });

    setFuncionariosFiltrados(filtrados);
  }, [termoPesquisa, filtro, funcionarios]);

  function handleDeleteClick(func) {
    setSelectedFuncionario(func);
    setOpenDialog(true);
  }

  function handleCloseDialog() {
    setOpenDialog(false);
    setSelectedFuncionario(null);
  }

  async function handleConfirmDelete() {
    if (!selectedFuncionario) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/funcionarios/${selectedFuncionario.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Erro ao excluir funcionário");

      setFuncionarios((prev) =>
        prev.filter((f) => f.id !== selectedFuncionario.id)
      );
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir funcionário.");
    } finally {
      handleCloseDialog();
    }
  }

  function formatCPF(cpf) {
    return cpf
      ? cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")
      : "";
  }

  function formatCelular(celular) {
    return celular
      ? celular.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")
      : "";
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
      {/* Cabeçalho + filtros */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h5">Lista de Funcionários</Typography>

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
            <MenuItem value="cargo">Cargo</MenuItem>
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
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate({ to: "/funcionarios/novo" })}
          >
            Novo Funcionário
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
            <TableCell>Cargo</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {funcionariosFiltrados.length > 0 ? (
            funcionariosFiltrados.map((func) => (
              <TableRow key={func.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {func.admin && (
                      <AdminPanelSettings fontSize="small" color="primary" />
                    )}
                    {func.nome}
                  </Box>
                </TableCell>
                <TableCell>{func.matricula}</TableCell>
                <TableCell>{formatCPF(func.cpf)}</TableCell>
                <TableCell>{formatCelular(func.celular)}</TableCell>
                <TableCell>{func.cargo || "-"}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() =>
                      navigate({ to: `/funcionarios/${func.id}/editar` })
                    }
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(func)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Nenhum funcionário encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Dialog de Confirmação */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o funcionário{" "}
            <strong>{selectedFuncionario?.nome}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button color="error" onClick={handleConfirmDelete}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
