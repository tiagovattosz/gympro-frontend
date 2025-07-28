export function removerToken() {
  localStorage.removeItem("auth_token");
}

export async function login({ username, password }) {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Credenciais inválidas");
  }

  const data = await response.json();
  localStorage.setItem("auth_token", data.token);
  return data.token;
}

export async function fetchUserData() {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  const response = await fetch("/api/login/dados", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (response.status === 403) {
    removerToken();
    return null;
  }

  const data = await response.json();
  return data;
}
