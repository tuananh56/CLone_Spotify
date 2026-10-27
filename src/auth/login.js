import Swal from "sweetalert2";
import { updateHeaderUI } from "../components/header.js";
import { api } from "../app/api.js";

export async function handleLogin(email, password) {
  try {
    const res = await api.post("/api/auth/login", {
      email,
      password,
    });

    const data = res.data;
    const user = data.user || data.data?.user || {};

    const token =
      data.token ||
      data.access_token ||
      data.data?.token ||
      data.data?.access_token ||
      null;

    if (!token) {
      console.error("Login response:", data);
      throw new Error("Không tìm thấy token trong phản hồi API.");
    }

    // Lưu token và thông tin người dùng
    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: user.id || user._id || null,
        email: user.email || email,
        name: user.name || "",
      }),
    );

    await Swal.fire({
      icon: "success",
      title: "Đăng nhập thành công",
      text: `Chào mừng ${user.name || user.email || email} quay lại!`,
    });

    window.location.href = `${import.meta.env.BASE_URL}home.html`;
  } catch (error) {
    console.error("Login error:", error);

    await Swal.fire({
      icon: "error",
      title: "Đăng nhập thất bại",
      text:
        error.response?.data?.message ||
        error.message ||
        "Đã xảy ra lỗi khi đăng nhập.",
    });
  }
}
