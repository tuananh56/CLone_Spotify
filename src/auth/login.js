
import Swal from "sweetalert2";
import { api } from "../app/api.js";

const ADMIN_ID = "b6ea8a1b-9bc6-410b-bff3-f4780094d507";

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
      throw new Error("Không tìm thấy token trong phản hồi API.");
    }

    // Lưu token và thông tin người dùng
    const userId = user.id || user._id || null;

    localStorage.setItem("token", token);

    localStorage.setItem(
      "user",
      JSON.stringify({
        id: userId,
        email: user.email || email,
        name: user.name || user.display_name || "",
        username: user.username || "",
        avatar_url: user.avatar_url || null,
      })
    );

    // Kiểm tra tài khoản Admin
    const isAdmin = userId === ADMIN_ID;

    await Swal.fire({
      icon: "success",
      title: "Đăng nhập thành công",
      text: isAdmin
        ? "Chào mừng Admin đến với trang quản trị!"
        : `Chào mừng ${user.name || user.email || email} quay lại!`,
      timer: 1500,
      showConfirmButton: false,
    });

    // Điều hướng theo quyền
    window.location.href = isAdmin
      ? `${import.meta.env.BASE_URL}admin-dashboard.html`
      : `${import.meta.env.BASE_URL}home.html`;

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
