const express = require("express");
const db = require("./database");
const multer = require("multer");
const { verificarToken } = require("./auth");

const app = express();
app.use(express.json());

const upload = multer({ dest: "uploads/" });

function parseFrota(frota) {
  const [prefixo, numero] = frota.split("-");
  return { prefixo, numero: parseInt(numero) };
}

function verificarRevisao(equipamento) {
  if (equipamento.horimetro_atual >= equipamento.proxima_revisao) {
    db.run(
      "INSERT INTO os (tipo, descricao, status, equipamento_id) VALUES ('preventiva','Revisão automática','aberta',?)",
      [equipamento.id]
    );

    db.run(
      "UPDATE equipamentos SET proxima_revisao = proxima_revisao + 500 WHERE id=?",
      [equipamento.id]
    );
  }
}

app.post("/equipamento", verificarToken, (req, res) => {
  const { numero_frota, tipo, contrato_id } = req.body;
  const dados = parseFrota(numero_frota);

  db.run(
    `INSERT INTO equipamentos 
    (numero_frota, prefixo, numero, tipo, contrato_id)
    VALUES (?,?,?,?,?)`,
    [numero_frota, dados.prefixo, dados.numero, tipo, contrato_id]
  );

  res.send("Equipamento cadastrado");
});

app.post("/os", verificarToken, upload.single("foto"), (req, res) => {
  const { frota, tipo, descricao } = req.body;

  db.get(
    "SELECT * FROM equipamentos WHERE numero_frota=?",
    [frota],
    (err, equipamento) => {
      if (!equipamento) return res.send("Equipamento não encontrado");

      db.run(
        "INSERT INTO os (tipo, descricao, status, equipamento_id) VALUES (?,?, 'aberta',?)",
        [tipo, descricao, equipamento.id]
      );

      res.send("OS criada");
    }
  );
});

app.post("/finalizar-os/:id", verificarToken, (req, res) => {
  const osId = req.params.id;

  db.all(
    "SELECT * FROM os_pecas WHERE os_id=?",
    [osId],
    (err, pecas) => {

      let erroEstoque = false;

      pecas.forEach(p => {
        db.get(
          "SELECT quantidade FROM pecas WHERE id=?",
          [p.peca_id],
          (err, estoque) => {
            if (estoque.quantidade < p.quantidade) {
              erroEstoque = true;
            }
          }
        );
      });

      if (erroEstoque) return res.send("Estoque insuficiente");

      pecas.forEach(p => {
        db.run(
          "UPDATE pecas SET quantidade = quantidade - ? WHERE id=?",
          [p.quantidade, p.peca_id]
        );
      });

      db.run("UPDATE os SET status='finalizada' WHERE id=?", [osId]);

      res.send("OS finalizada com baixa de estoque");
    }
  );
});

app.listen(3000, () => console.log("Servidor rodando"));
require("./whatsapp");
