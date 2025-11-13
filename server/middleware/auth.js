// server/middleware/auth.js
const { supabase } = require('../config/supabase');

async function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';

  const [, token] = authHeader.split(' '); // "Bearer xxx"

  if (!token) {
    return res.status(401).json({ error: 'Falta token' });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  // Usuario autenticado
  req.user = data.user;
  next();
}

module.exports = auth;
