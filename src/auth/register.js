import { updateHeaderUI } from "../components/header.js";
import { api } from "../app/api.js";
import Swal from "sweetalert2";
export async function handleRegister(email, password) {
  const isValidPassword =
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    password.length >= 6;

  if (!isValidPassword) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Password phải >=6 ký tự, có chữ hoa, thường và số",
    });
    return;
  }

  try {
    // Gọi API bằng axios instance
    const res = await api.post("/api/auth/register", { email, password });
    // console.log("Register response:", res.data);

    Swal.fire({
      icon: "success",
      title: "Đăng ký thành công",
      text: "Vui lòng kiểm tra email để xác nhận tài khoản",
    });

    // Lưu token và user
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    // Điều hướng sang trang login
    window.location.href = "./login.html";
  } catch (error) {
    // console.error("Register error:", error);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.response?.data?.message || "Đăng ký thất bại",
    });
  }
}
function initToggleRegisterPassword() {
  const passwordInput = document.getElementById("registerPassword");
  const toggleButton = document.getElementById("togglePassword");
  const eyeIcon = toggleButton?.querySelector("i");

  if (!passwordInput || !toggleButton || !eyeIcon) {
    return;
  }

  toggleButton.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";

    eyeIcon.classList.toggle("fa-eye", !isHidden);
    eyeIcon.classList.toggle("fa-eye-slash", isHidden);

    toggleButton.setAttribute(
      "aria-label",
      isHidden ? "Ẩn mật khẩu" : "Hiện mật khẩu",
    );

    toggleButton.setAttribute("aria-pressed", String(isHidden));
  });
}

initToggleRegisterPassword();
