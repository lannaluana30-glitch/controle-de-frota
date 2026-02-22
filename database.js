const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("banco.db");

db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS contratos (
      id INTEGER PRIMARY KEY,
      nome TEXT,
      cliente TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS equipamentos (
      id INTEGER PRIMARY KEY,
      numero_frota TEXT UNIQUE,
      prefixo TEXT,
      numero INTEGER,
      tipo TEXT,
      horimetro_atual INTEGER DEFAULT 0,
      proxima_revisao INTEGER DEFAULT 500,
      contrato_id INTEGER,
      FOREIGN KEY (contrato_id) REFERENCES contratos(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS os (
      id INTEGER PRIMARY KEY,
      tipo TEXT,
      descricao TEXT,
      status TEXT,
      equipamento_id INTEGER,
      data_abertura DATETIME DEFAULT CURRENT_TIMESTAMP,
      custo_total REAL DEFAULT 0,
      FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pecas (
      id INTEGER PRIMARY KEY,
      codigo_fabricante TEXT,
      descricao TEXT,
      valor REAL,
      quantidade INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS os_pecas (
      id INTEGER PRIMARY KEY,
      os_id INTEGER,
      peca_id INTEGER,
      quantidade INTEGER,
      FOREIGN KEY (os_id) REFERENCES os(id),
      FOREIGN KEY (peca_id) REFERENCES pecas(id)
    )
  `);

});

module.exports = db;