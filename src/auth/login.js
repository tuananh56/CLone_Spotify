import { updateHeaderUI } from "../component/header.js";
import { api } from "../app/router.js";
import Swal from "sweetalert2";

export async function handleLogin(email, password) {
  try {
    // Gọi API login
    const res = await api.post("/api/auth/login", { email, password });
    console.log("Login response full:", res.data);

    const user = res.data.user || {};
    const token =
      res.data.token ||
      res.data.access_token ||
      res.data.data?.token ||
      null;

    if (!token) {
      throw new Error("Không tìm thấy token trong phản hồi API");
    }

    // Hiển thị thông báo thành công
    Swal.fire({
      icon: "success",
      title: "Đăng nhập thành công",
      text: `Chào mừng ${user.name || "bạn"} (${user.email}) quay lại!`,
    });

    // Lưu token và user (bao gồm id) vào localStorage
    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: user.id || user._id || null, // đảm bảo có id
        email: user.email,
        name: user.name,
      })
    );

    // Cập nhật giao diện header
    updateHeaderUI();

    // Điều hướng sang trang home
    window.location.href = "/home.html";
  } catch (error) {
    console.error("Login error:", error);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text:
        error.response?.data?.message ||
        error.message ||
        "Đăng nhập thất bại",
    });
  }
}
