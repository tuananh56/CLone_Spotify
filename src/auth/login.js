import { updateHeaderUI } from "../layout/header.js";
import { api } from "../app/router.js";
import Swal from "sweetalert2";

export async function handleLogin(email, password) {
  try {
    // Gọi API login
    const res = await api.post("/api/auth/login", { email, password });
    console.log("Login response:", res.data);

    Swal.fire({
      icon: "success",
      title: "Đăng nhập thành công",
      text: `Chào mừng ${res.data.user.name || "bạn"} (${res.data.user.email}) quay lại!`,
    });

    // Lưu token và user vào localStorage
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    updateHeaderUI(); // Cập nhật giao diện header sau khi đăng nhập

    // Điều hướng sang trang home
    window.location.href = "/home.html";
  } catch (error) {
    console.error("Login error:", error);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.response?.data?.message || "Đăng nhập thất bại",
    });
  }
}
