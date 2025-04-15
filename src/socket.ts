import { io } from "socket.io-client";

const serverURL = import.meta.env.VITE_ENVIRONMENT === 'LOCAL'
  ? import.meta.env.VITE_LOCAL_SERVER_URL
  : import.meta.env.VITE_SERVER_URL;

export const socket = io(serverURL, {
  autoConnect: true,
});