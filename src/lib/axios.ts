import axios from "axios";
import { BASE_URL } from "@/constant/baseUrl";

// Create axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
