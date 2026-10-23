import { initLibrary } from "./component/library.js";
import { initSidebar } from "./component/sidebar.js";
import { handleRegister } from "./auth/register.js";
import { handleLogin } from "./auth/login.js";
import { handleLogout } from "./auth/logout.js";
import { api } from "./app/router.js";
import { initHeader, updateHeaderUI } from "./component/header.js";

// === Main View ===
async function loadMainView() {
  try {
    // Lấy thông tin user từ localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      console.warn("User chưa đăng nhập hoặc thiếu ID");
      return;
    }

    const [tracksRes, artistsRes, albumsRes, playlistsRes] = await Promise.all([
      api.get("/api/tracks/trending"),
      api.get("/api/artists/trending"),
      api.get("/api/albums/popular"),
      api.get(`/api/users/${user.id}/playlists`), // playlist theo user
    ]);

    renderSection("trendingTracks", tracksRes.data.tracks, "track");
    renderSection("trendingArtists", artistsRes.data.artists, "artist");
    renderSection("popularAlbums", albumsRes.data.albums, "album");

    // Nếu API trả về mảng trực tiếp thì dùng playlistsRes.data
    const playlists = playlistsRes.data.playlists || playlistsRes.data;
    renderSection("allPlaylists", playlists, "playlist");
  } catch (err) {
    console.error("Main view fetch error:", err);
  }
}

function renderSection(containerId, items = [], type) {
  if (!Array.isArray(items)) {
    console.warn(`Dữ liệu ${type} không hợp lệ:`, items);
    return;
  }

  const container = document.getElementById(containerId);
  container.innerHTML = items
    .map((item) => {
      const id = item.id || item.artistId || item._id;
      const name =
        item.title ||
        item.name ||
        item.album_title ||
        item.albumName ||
        "Unknown";
      const image =
        item.cover_image_url ||
        item.image_url ||
        item.album_cover_image_url ||
        "/src/assets/playlist.png";
      const sub =
        type === "artist"
          ? `${item.monthly_listeners?.toLocaleString()} người nghe/tháng`
          : item.artist_name ||
            item.artist ||
            item.owner?.display_name ||
            item.publisher ||
            "";
      const detailUrl = `/${type}.html?id=${id}`;

      return `
        <div
          class="flex-shrink-0 w-44 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition cursor-pointer"
          onclick="window.location.href='${detailUrl}'"
        >
          <img src="${image}" class="w-full h-44 object-cover rounded mb-2" />
          <p class="text-white text-sm font-semibold truncate">${name}</p>
          <p class="text-xs text-gray-400 truncate">${sub}</p>
        </div>`;
    })
    .join("");
}

function scrollSection(id, direction) {
  const container = document.getElementById(id);
  const scrollAmount = 400;
  container.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
}
window.scrollSection = scrollSection;

// === Forms & Auth ===
function initForms() {
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

  const avatar = document.querySelector("#userAvatar");
  if (avatar) {
    avatar.addEventListener("click", () => handleLogout());
  }
}

// === Init ===
document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  updateHeaderUI();
  initSidebar(); // Sidebar từ sidebar.js
  initLibrary(); // Library view
  initForms(); // Login/Register/Logout
  loadMainView(); // Main View (Trang chủ)
});
