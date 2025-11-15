// client/src/lib/api.js

const API_URL = import.meta.env.VITE_API_URL;

/* ---------------------------
   Helper base para requests
---------------------------- */
async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  console.log("request:", url, options);

  // 1) Mezclamos headers SIN pisar el Content-Type
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // 2) Armamos el fetch poniendo primero ...options y luego headers ya fusionados
  const res = await fetch(url, {
    ...options,
    headers,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    /* empty */
  }

  if (!res.ok) {
    console.error("❌ Error en la API:", res.status, data);
    throw new Error(data.error || "Error en la API");
  }

  return data;
}

/* ---------------------------
         AUTH
---------------------------- */
export async function apiLogin({ email, password }) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // Guardamos el token del backend
  localStorage.setItem("book_token", data.access_token);

  return data;
}

export async function apiRegister({ email, password, nombre, apellido }) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, nombre, apellido }),
  });
}

export async function apiLoginWithGoogle(id_token) {
  const data = await request("/auth/login/google", {
    method: "POST",
    body: JSON.stringify({ id_token }),
  });

  if (data.access_token) {
    localStorage.setItem("book_token", data.access_token);
  } else {
    console.error("❌ No vino access_token desde login/google:", data);
  }

  localStorage.setItem("book_user", JSON.stringify(data.user));

  return data.user;
}

export async function apiVerifyEmail(token_hash, type) {
  const data = await request("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token_hash, type }),
  });

  // Guardar tokens
  if (data.access_token) {
    localStorage.setItem("book_token", data.access_token);
  }
  if (data.refresh_token) {
    localStorage.setItem("book_refresh_token", data.refresh_token);
  }
  if (data.user) {
    localStorage.setItem("book_user", JSON.stringify(data.user));
  }

  return data;
}
/* ---------------------------
   Helper para auth headers
---------------------------- */
function authHeaders() {
  const token = localStorage.getItem("book_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ---------------------------
         BOOKS
---------------------------- */

// GET: buscar libros por texto
export async function apiSearchBooks(query) {
  return request(`/search?q=${encodeURIComponent(query)}`, {
    headers: authHeaders(),
  });
}

// GET: libros del usuario
export async function apiGetBooks() {
  return request("/books", {
    headers: authHeaders(),
  });
}

// POST: agregar libro al usuario
export async function apiCreateBook(bookData) {
  return request("/books", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(bookData),
  });
}

// PUT: actualizar estado/progreso
export async function apiUpdateBook(id, data) {
  return request(`/books/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

// DELETE: sacar un libro del usuario
export async function apiDeleteBook(id) {
  return request(`/books/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}
/* ---------------------------
         GOALS
---------------------------- */

// GET: metas anual + mensual
export async function apiGetGoals({ year, month }) {
  const params = new URLSearchParams({ year: String(year) });
  if (month) params.append("month", String(month));

  return request(`/goals?${params.toString()}`, {
    headers: authHeaders(),
  });
}

// PUT: guardar metas
export async function apiUpdateGoals({ year, month, annualTarget, monthlyTarget }) {
  return request(`/goals`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      year,
      month,
      annualTarget,
      monthlyTarget,
    }),
  });
}
