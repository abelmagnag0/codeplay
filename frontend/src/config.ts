const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
const socketUrl = import.meta.env.VITE_SOCKET_URL ?? apiUrl;

export const config = {
  apiUrl,
  socketUrl,
};
