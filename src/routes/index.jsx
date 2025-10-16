import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  getHoje,
  getSemanaPassada,
  parseDateSemTimezone,
} from "../utils/getHoje";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const [entradasPorDia, setEntradasPorDia] = useState([]);
  const [assinaturas, setAssinaturas] = useState(null);
  const [clientesPorPlano, setClientesPorPlano] = useState([]);
  const [modalidadesPopulares, setModalidadesPopulares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtros, setFiltros] = useState({
    inicio: getSemanaPassada(),
    fim: getHoje(),
  });

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("auth_token");

      const [entradasRes, assinaturasRes, planosRes, modalidadesRes] =
        await Promise.all([
          fetch(
            `/api/dashboard/entradas-por-dia?inicio=${filtros.inicio}&fim=${filtros.fim}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(`/api/dashboard/contagem-ativas-vencidas`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/dashboard/clientes-por-plano`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/dashboard/modalidades-mais-populares`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      if (
        !entradasRes.ok ||
        !assinaturasRes.ok ||
        !planosRes.ok ||
        !modalidadesRes.ok
      ) {
        throw new Error("Erro ao carregar dados do dashboard");
      }

      const entradasData = await entradasRes.json();
      const assinaturasData = await assinaturasRes.json();
      const planosData = await planosRes.json();
      const modalidadesData = await modalidadesRes.json();

      setEntradasPorDia(
        entradasData.map((item) => ({
          data: format(parseDateSemTimezone(item.data), "dd/MM"),
          quantidade: item.quantidadeEntradas,
        }))
      );

      setAssinaturas(assinaturasData[0]);
      setClientesPorPlano(planosData);
      setModalidadesPopulares(modalidadesData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const COLORS = ["#4caf50", "#f44336", "#2196f3", "#ff9800", "#9c27b0"];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* filtros */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Período
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            label="Data início"
            type="date"
            value={filtros.inicio}
            onChange={(e) =>
              setFiltros((prev) => ({ ...prev, inicio: e.target.value }))
            }
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Data fim"
            type="date"
            value={filtros.fim}
            onChange={(e) =>
              setFiltros((prev) => ({ ...prev, fim: e.target.value }))
            }
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" onClick={carregarDados}>
            Atualizar
          </Button>
        </Box>
      </Card>

      <Grid container spacing={3}>
        {/* entradas por dia */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Entradas por dia
              </Typography>
              <Box display="flex" justifyContent="center">
                <LineChart
                  width={900}
                  height={350}
                  data={entradasPorDia}
                  margin={{ top: 20, right: 30, bottom: 10, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="quantidade"
                    stroke="#1976d2"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* assinaturas ativas / vencidas, clientes por plano, modalidade popular  */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Assinaturas ativas vs vencidas
              </Typography>
              <PieChart width={300} height={300}>
                <Pie
                  dataKey="value"
                  data={[
                    {
                      name: "Ativas",
                      value: assinaturas?.clientesComAssinaturaAtiva || 0,
                    },
                    {
                      name: "Vencidas",
                      value: assinaturas?.clientesComAssinaturaVencida || 0,
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  <Cell fill="#4caf50" />
                  <Cell fill="#f44336" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Clientes por plano
              </Typography>
              <BarChart
                width={300}
                height={300}
                data={clientesPorPlano}
                margin={{ top: 20, right: 20, bottom: 10, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nomePlano" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidadeClientes" fill="#2196f3" />
              </BarChart>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Modalidades mais populares
              </Typography>
              <BarChart
                width={300}
                height={300}
                data={modalidadesPopulares}
                margin={{ top: 20, right: 20, bottom: 10, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="descricaoModalidade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalInscricoes" fill="#9c27b0" />
              </BarChart>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
