const { Client, LocalAuth } = require("whatsapp-web.js");
const db = require("./database");

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on("message", msg => {
  const texto = msg.body.toLowerCase();

  if (texto.startsWith("abrir os")) {
    const frota = texto.match(/[A-Z]{2}-\d+/i)[0];

    db.get(
      "SELECT id FROM equipamentos WHERE numero_frota=?",
      [frota],
      (err, eq) => {
        if (!eq) return msg.reply("Frota não encontrada");

        db.run(
          "INSERT INTO os (tipo, descricao, status, equipamento_id) VALUES ('corretiva','via whatsapp','aberta',?)",
          [eq.id]
        );

        msg.reply("OS aberta para " + frota);
      }
    );
  }
});

client.initialize();