import axios from "axios";
import Swal from "sweetalert2";

export const BASE_URL = "https://spotify.f8team.dev";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Tự động gắn token vào header nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Bắt lỗi chung
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Có lỗi xảy ra!";
    Swal.fire({ icon: "error", title: "Oops...", text: message });
    return Promise.reject(error);
  }
);
