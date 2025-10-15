import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Button,
} from "@mui/material";

export const Route = createFileRoute("/catraca/entrada")({
  component: CatracaEntrada,
});

export default function CatracaEntrada() {
  const [matricula, setMatricula] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [mensagem, setMensagem] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!matricula || matricula.length !== 6) return;

    setLoading(true);
    setResultado(null);

    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/entradas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ matricula }),
      });

      const data = await response.json();

      if (response.ok) {
        setResultado("sucesso");
        setMensagem(
          `${data.tipoMovimentacao} liberada para ${data.nome} (${data.tipoPessoa === "C" ? "Cliente" : "Funcionário"})\nHora: ${data.hora}`
        );
      } else {
        setResultado("erro");
        setMensagem(data.message || "Erro desconhecido");
      }

      setTimeout(() => {
        setMatricula("");
        setResultado(null);
        setMensagem("");
      }, 5000);
    } catch (err) {
      console.error(err);
      setResultado("erro");
      setMensagem("Erro de rede ou inesperado");
      setTimeout(() => {
        setMatricula("");
        setResultado(null);
        setMensagem("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  }

  if (resultado) {
    return (
      <Box
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        sx={{
          bgcolor: resultado === "sucesso" ? "green" : "red",
          color: "white",
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h3" gutterBottom>
          {resultado === "sucesso"
            ? "Entrada liberada ✅"
            : "Entrada negada ❌"}
        </Typography>
        <Typography variant="h5" whiteSpace="pre-line">
          {mensagem}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        sx={{ bgcolor: "#1976d2", color: "white", p: 4 }}
      >
        <Typography variant="h2" mb={4}>
          Digite sua Matrícula
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            inputProps={{
              maxLength: 6,
              style: { fontSize: "2rem", textAlign: "center" },
            }}
            sx={{ input: { color: "white" }, mb: 2 }}
            placeholder="000001"
            autoFocus
          />
          <Box mt={2}>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Liberar"}
            </Button>
          </Box>
        </form>
      </Box>
      <Box width="100vw" display="flex" justifyContent="flex-end">
        <Link to={"/"}>Voltar</Link>
      </Box>
    </>
  );
}
