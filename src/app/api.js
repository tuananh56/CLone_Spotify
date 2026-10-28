
import axios from "axios";
import Swal from "sweetalert2";

export const BASE_URL = "https://spotify.f8team.dev";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động gắn token nếu đã đăng nhập
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Xử lý lỗi API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "Có lỗi xảy ra!";

    if (status !== 401) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: message,
      });
    }

    return Promise.reject(error);
  },
);
