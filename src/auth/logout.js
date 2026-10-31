import { api } from "../app/api.js";
import Swal from "sweetalert2";
import { updateHeaderUI } from "../components/header.js";

export async function handleLogout() {
  try {
    const res = await api.post("/api/auth/logout");
    // console.log("Logout response:", res.data);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    Swal.fire({
      icon: "success",
      title: "Đăng xuất thành công",
    });
    window.location.href = "./home.html";
  } catch (error) {
    console.error("Logout error:", error);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.response?.data?.message || "Đăng xuất thất bại",
    });
  }
}
