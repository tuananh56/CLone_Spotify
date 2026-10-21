import { initLibrary } from "./layout/library.js";
import { initSidebar } from "./layout/sidebar.js";
import { handleRegister } from "./auth/register.js";
import { handleLogin } from "./auth/login.js";
import { handleLogout } from "./auth/logout.js";
import { api } from "./app/router.js";
import { initHeader, updateHeaderUI } from "./layout/header.js";

async function loadSidebarData() {
  try {
    const res = await api.get("/api/playlists"); // hoặc endpoint phù hợp
    sidebarItems = res.data;
    renderSidebarList(sidebarItems);
  } catch (err) {
    console.error("Sidebar fetch error:", err);
  }
}
function renderSidebarList(items) {
  const sidebarList = document.getElementById("sidebarList");
  sidebarList.innerHTML = items
    .map(
      (item) => `
      <div class="flex items-center space-x-3 p-2 hover:bg-neutral-800 cursor-pointer">
        <img src="${item.image || "/src/assets/placeholder.png"}" class="w-10 h-10 rounded" />
        <span>${item.name}</span>
      </div>`,
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  loadSidebarData();
});

// Forms
const loginForm = document.querySelector("#loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleLogin(e.target.email.value, e.target.password.value);
  });
}

const registerForm = document.querySelector("#registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleRegister(e.target.email.value, e.target.password.value);
  });
}

const logoutBtn = document.querySelector("#logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    handleLogout();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  updateHeaderUI();
  initSidebar();
  initLibrary();
});

// Sidebar search
let sidebarItems = []; // sẽ gán khi fetch dữ liệu từ API
const searchBtn = document.getElementById("sidebarSearchBtn");
const searchBox = document.getElementById("sidebarSearchBox");
const sidebarSearchInput = document.getElementById("sidebarSearchInput");

searchBtn.addEventListener("click", () => {
  searchBox.classList.toggle("hidden");
  if (!searchBox.classList.contains("hidden")) {
    sidebarSearchInput.focus();
  }
});

sidebarSearchInput.addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  const filtered = sidebarItems.filter((item) =>
    item.name.toLowerCase().includes(keyword),
  );
  renderSidebarList(filtered);
});

// Logout khi click avatar
document.addEventListener("DOMContentLoaded", () => {
  const avatar = document.querySelector("#userAvatar");
  if (avatar) {
    avatar.addEventListener("click", () => {
      handleLogout();
    });
  }
});
