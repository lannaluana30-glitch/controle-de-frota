const jwt = require("jsonwebtoken");
const SECRET = "isa_secret";

function gerarToken(user) {
  return jwt.sign(user, SECRET);
}

function verificarToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(403);

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.sendStatus(401);
    req.user = decoded;
    next();
  });
}

module.exports = { gerarToken, verificarToken };