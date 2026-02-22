const express = require("express");
const db = require("./database");
const multer = require("multer");
const { verificarToken, gerarToken } = require("./auth");
const path = require("path");

const app = express();
app.use(express.json());

// Esta linha faz o servidor mostrar as telas (HTML/CSS) que vamos criar
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });

/* ================= ROTAS DO SISTEMA ================= */

// Rota inicial (Caso não exista a pasta public, ele mostra este texto)
app.get("/status", (req, res) => {
  res.send("<h1>✅ Sistema de Controle de Frota Ativo!</h1><p>O servidor está rodando e o banco de dados está ligado.</p>");
});

// Cadastro de Equipamentos (Linha Amarela)
app.post("/equipamento", (req, res) => {
  const { numero_frota, tipo, contrato_id } = req.body;
  
  db.run(
    `INSERT INTO equipamentos (numero_frota, tipo, contrato_id) VALUES (?,?,?)`,
    [numero_frota, tipo, contrato_id],
    function(err) {
      if (err) return res.status(500).send("Erro ao cadastrar: " + err.message);
      res.json({ mensagem: "Equipamento " + numero_frota + " cadastrado!", id: this.lastID });
    }
  );
});

// Criar Ordem de Serviço
app.post("/os", upload.single("foto"), (req, res) => {
  const { equipamento_id, tipo, descricao } = req.body;

  db.run(
    "INSERT INTO os (tipo, descricao, status, equipamento_id) VALUES (?,?, 'aberta',?)",
    [tipo, descricao, equipamento_id],
    function(err) {
      if (err) return res.status(500).send("Erro ao abrir OS");
      res.json({ mensagem: "OS Aberta com sucesso!", os_id: this.lastID });
    }
  );
});

// Listar todas as Máquinas
app.get("/frota", (req, res) => {
  db.all("SELECT * FROM equipamentos", (err, rows) => {
    res.json(rows);
  });
});

/* ================= INICIALIZAÇÃO ================= */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
