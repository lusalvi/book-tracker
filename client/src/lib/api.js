// client/src/lib/api.js

const API_URL = import.meta.env.VITE_API_URL;

/* ---------------------------
   Helper base para requests
---------------------------- */
async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = {};
  try {
    data = await res.json();
  } catch { /* empty */ }

  if (!res.ok) {
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

export async function apiRegister({ email, password, nombre }) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, nombre }),
  });
}

export async function apiLoginWithGoogle(id_token) {
  const data = await request("/auth/login/google", {
    method: "POST",
    body: JSON.stringify({ id_token }),
  });

  localStorage.setItem("book_token", data.access_token);
  localStorage.setItem("book_user", JSON.stringify(data.user));

  return data.user;
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
