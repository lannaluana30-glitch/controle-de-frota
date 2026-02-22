const express = require("express");
const db = require("./database");
const { verificarToken } = require("./auth");

const app = express();
app.use(express.json());

// Rota inicial para confirmar que o sistema ligou
app.get("/", (req, res) => {
  res.send("<h1>✅ Sistema de Controle de Frota Ativo!</h1><p>O servidor está rodando e o banco de dados está ligado.</p>");
});

// Suas rotas originais continuam aqui
app.post("/equipamento", verificarToken, (req, res) => {
  const { numero_frota, tipo, contrato_id } = req.body;
  res.send("Equipamento recebido");
});

// Configuração da porta para a nuvem
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Servidor rodando na porta " + PORT));
