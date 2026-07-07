import axios from "axios";
import { getToken } from "../utils/auth";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const baseURL = `${API_URL.replace(/\/$/, "")}/api`;

const api = axios.create({
    baseURL
});

api.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
