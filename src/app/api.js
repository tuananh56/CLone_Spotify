import axios from "axios";
import Swal from "sweetalert2";

export const BASE_URL = "https://spotify.f8team.dev";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

// Tự động gắn token nếu đã đăng nhập
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Nếu gửi FormData, để trình duyệt/Axios tự thiết lập
  // multipart/form-data cùng boundary chính xác.
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else if (config.data !== undefined && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// Xử lý lỗi API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      "Có lỗi xảy ra!";

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
