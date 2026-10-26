import { navigate } from "../app/router.js";
import { handleLogout } from "../auth/logout.js";
import { api } from "../app/api.js";

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export function initHeader() {
  const searchInput = document.querySelector("#searchInput");
  const searchResults = document.querySelector("#searchResults");

  // Nếu không có searchInput (trang không có header đầy đủ) → bỏ qua
  if (!searchInput || !searchResults) return;

  if (searchInput.dataset.initialized === "true") return;
  searchInput.dataset.initialized = "true";

  // Nhập từ khóa → gọi Universal Search (debounce)
  searchInput.addEventListener(
    "input",
    debounce(async (e) => {
      const keyword = e.target.value.trim();
      if (!keyword) {
        searchResults.classList.add("hidden");
        return;
      }

      searchResults.innerHTML = `
        <div class="p-2 text-gray-400 text-sm italic animate-pulse">
          Đang tìm kiếm...
        </div>`;
      searchResults.classList.remove("hidden");

      try {
        const res = await api.get(
          `/api/search?q=${keyword}&type=all&limit=20&offset=0`,
        );
        const results = res.data.results || {};
        const data = [
          ...(results.tracks || []),
          ...(results.artists || []),
          ...(results.albums || []),
          ...(results.playlists || []),
        ];
        renderSearchResults(data);
      } catch (err) {
        console.error("Search error:", err);
        searchResults.innerHTML = `<div class="p-2 text-red-400">Lỗi khi tìm kiếm</div>`;
      }
    }, 500),
  );

  function renderSearchResults(results) {
    if (!results || results.length === 0) {
      searchResults.innerHTML = `
        <div class="p-2 text-gray-400 text-sm italic">
          Không có kết quả phù hợp
        </div>`;
      return;
    }

    searchResults.innerHTML = results
      .map((item) => {
        const displayName = item.name || item.title || "Không rõ tên";
        const imageSrc =
          item.image_url ||
          item.image ||
          item.thumbnail ||
          "/src/assets/placeholder.png";
        const subLabel =
          item.type === "track"
            ? item.artists?.[0]?.name
            : item.creator || item.artist || "";
        const tagLabel =
          item.type === "artist"
            ? "Nghệ sĩ"
            : item.type === "playlist"
              ? "Danh sách phát"
              : item.type === "album"
                ? "Album"
                : "Bài hát";

        return `
          <div class="flex justify-between items-center p-2 hover:bg-neutral-800 transition-colors duration-200 cursor-pointer search-item rounded-md" data-type="${item.type}" data-id="${item.id}">
            <div class="flex items-center space-x-3">
              <img src="${imageSrc}" alt="${displayName}" class="w-12 h-12 rounded-md object-cover" />
              <div>
                <p class="text-sm font-semibold text-white">${displayName}</p>
                <span class="text-xs text-gray-400">${subLabel}</span>
              </div>
            </div>
            <span class="text-xs bg-neutral-700 text-gray-300 px-2 py-1 rounded">${tagLabel}</span>
          </div>`;
      })
      .join("");

    searchResults.classList.remove("hidden");
  }

  // Click kết quả → chuyển trang chi tiết
  // Click kết quả → chuyển trang bằng SPA router
  searchResults.addEventListener("click", (e) => {
    const item = e.target.closest(".search-item");
    if (!item) return;

    const type = item.dataset.type;
    const id = item.dataset.id;

    if (!id) return;

    const allowedTypes = ["track", "artist", "album", "playlist"];

    if (!allowedTypes.includes(type)) return;

    navigate(type, { id });
    searchResults.classList.add("hidden");
  });
  // Ctrl + Shift + L → focus ô tìm kiếm
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.shiftKey && event.code === "KeyL") {
      event.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.classList.add("ring-2", "ring-white");
        setTimeout(
          () => searchInput.classList.remove("ring-2", "ring-white"),
          1000,
        );
      }
    }
  });
}

export function updateHeaderUI() {
  const user = localStorage.getItem("user");
  const signupBtn = document.querySelector("#signupBtn");
  const loginBtn = document.querySelector("#loginBtn");
  const avatar = document.querySelector("#userAvatar");
  const avatarLetter = document.querySelector("#avatarLetter");

  if (!avatar || !avatarLetter) return;

  let emailDisplay = document.querySelector("#userEmail");
  if (!emailDisplay) {
    emailDisplay = document.createElement("span");
    emailDisplay.id = "userEmail";
    emailDisplay.className = "ml-2 text-sm text-gray-300";
    avatar.parentNode.insertBefore(emailDisplay, avatar.nextSibling);
  }

  if (user) {
    const parsedUser = JSON.parse(user);
    signupBtn?.classList.add("hidden");
    loginBtn?.classList.add("hidden");

    const firstLetter = parsedUser.email?.charAt(0).toUpperCase() || "A";
    avatarLetter.textContent = firstLetter;
    // avatar.style.backgroundColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;

    avatar.classList.remove("hidden");
    emailDisplay.textContent = parsedUser.email;
    emailDisplay.classList.remove("hidden");
  } else {
    signupBtn?.classList.remove("hidden");
    loginBtn?.classList.remove("hidden");
    avatar.classList.add("hidden");
    emailDisplay.classList.add("hidden");
  }
}

// === Các sự kiện riêng cho login/register/logout ===
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn)
    loginBtn.addEventListener(
      "click",
      () => (window.location.href = "/login.html"),
    );

  const signupBtn = document.getElementById("signupBtn");
  if (signupBtn)
    signupBtn.addEventListener(
      "click",
      () => (window.location.href = "/register.html"),
    );

  const avatar = document.querySelector("#userAvatar");
  if (avatar) avatar.addEventListener("click", () => handleLogout());

  const registerPassword = document.getElementById("registerPassword");
  const toggleRegister = document.getElementById("togglePassword");
  if (registerPassword && toggleRegister) {
    toggleRegister.addEventListener("click", () => {
      const type =
        registerPassword.getAttribute("type") === "password"
          ? "text"
          : "password";
      registerPassword.setAttribute("type", type);
      toggleRegister.innerHTML =
        type === "password"
          ? '<i class="fa-solid fa-eye"></i>'
          : '<i class="fa-solid fa-eye-slash"></i>';
    });
  }

  const loginPassword = document.getElementById("loginPassword");
  const toggleLogin = document.getElementById("toggleLoginPassword");
  if (loginPassword && toggleLogin) {
    toggleLogin.addEventListener("click", () => {
      const type =
        loginPassword.getAttribute("type") === "password" ? "text" : "password";
      loginPassword.setAttribute("type", type);
      toggleLogin.innerHTML =
        type === "password"
          ? '<i class="fa-solid fa-eye"></i>'
          : '<i class="fa-solid fa-eye-slash"></i>';
    });
  }
});
