import { initTrackPage } from "./playlists/track.js";
import { initArtistPage } from "./playlists/artist.js";
import { initAlbumPage } from "./playlists/album.js";
import { initPlaylistPage } from "./playlists/playlist.js";

import { navigate } from "./app/router.js";
import { initLibrary, initSidebarPlaylists } from "./component/library.js";
import { initSidebar } from "./component/sidebar.js";
import { handleRegister } from "./auth/register.js";
import { handleLogin } from "./auth/login.js";
import { handleLogout } from "./auth/logout.js";
import { api } from "./app/api.js";
import { initHeader, updateHeaderUI } from "./component/header.js";

// ==================== MAIN VIEW ====================

async function loadMainView() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user?.id) {
      console.warn("User chưa đăng nhập hoặc thiếu ID");
      return;
    }

    const [tracksRes, artistsRes, albumsRes, playlistsRes] = await Promise.all([
      api.get("/api/tracks/trending"),
      api.get("/api/artists/trending"),
      api.get("/api/albums/popular"),
      api.get(`/api/users/${user.id}/playlists`),
    ]);

    renderSection("trendingTracks", tracksRes.data?.tracks, "track");
    renderSection("trendingArtists", artistsRes.data?.artists, "artist");
    renderSection("popularAlbums", albumsRes.data?.albums, "album");

    const playlists = playlistsRes.data?.playlists ?? playlistsRes.data;
    initLibrary();
    // renderSection("allPlaylists", playlists, "playlist");
  } catch (error) {
    console.error("Lỗi tải giao diện trang chủ:", error);
  }
}

// ==================== RENDER SECTIONS ====================

function renderSection(containerId, items = [], type) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.warn(`Không tìm thấy phần tử #${containerId}`);
    return;
  }

  if (!Array.isArray(items)) {
    console.warn(`Dữ liệu ${type} không hợp lệ:`, items);
    container.innerHTML = "";
    return;
  }

  container.innerHTML = items
    .map((item) => {
      const id = item.id ?? item.artistId ?? item._id;

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
          ? `${Number(
              item.monthly_listeners || 0,
            ).toLocaleString()} người nghe/tháng`
          : item.artist_name ||
            item.artist ||
            item.owner?.display_name ||
            item.publisher ||
            "";

      const safeId = String(id ?? "");
      const safeName = escapeHTML(name);
      const safeImage = escapeHTML(image);
      const safeSub = escapeHTML(sub);

      let clickAction = "";

      if (safeId) {
        clickAction = `onclick="window.openDetail('${type}', '${escapeJS(safeId)}')"`;
      }

      return `
        <div
          class="flex-shrink-0 w-44 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition cursor-pointer"
          ${clickAction}
        >
          <img
            src="${safeImage}"
            class="w-full h-44 object-cover rounded mb-2"
            alt="${safeName}"
            loading="lazy"
          />

          <p class="text-white text-sm font-semibold truncate">
            ${safeName}
          </p>

          <p class="text-xs text-gray-400 truncate">
            ${safeSub}
          </p>
        </div>
      `;
    })
    .join("");
}

// ==================== ESCAPE HELPERS ====================

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}

function escapeJS(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}

// ==================== NAVIGATION ====================

// Mở trang chi tiết bài hát mà không tải lại toàn bộ trang.
window.openTrack = (id) => {
  if (id == null || id === "") {
    console.error("Không tìm thấy ID bài hát");
    return;
  }

  navigate("track", { id: String(id) });
};

// Nút Home dùng router SPA.
window.goHome = () => {
  navigate("home");
};

// ==================== SCROLL SECTIONS ====================

function scrollSection(id, direction) {
  const container = document.getElementById(id);

  if (!container) {
    console.warn(`Không tìm thấy phần tử #${id}`);
    return;
  }

  container.scrollBy({
    left: direction * 400,
    behavior: "smooth",
  });
}

window.scrollSection = scrollSection;

// ==================== FORMS & AUTH ====================

function initForms() {
  const loginForm = document.querySelector("#loginForm");

  if (loginForm && !loginForm.dataset.initialized) {
    loginForm.dataset.initialized = "true";

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      handleLogin(event.target.email.value, event.target.password.value);
    });
  }

  const registerForm = document.querySelector("#registerForm");

  if (registerForm && !registerForm.dataset.initialized) {
    registerForm.dataset.initialized = "true";

    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();

      handleRegister(event.target.email.value, event.target.password.value);
    });
  }

  const logoutBtn = document.querySelector("#logoutBtn");

  if (logoutBtn && !logoutBtn.dataset.initialized) {
    logoutBtn.dataset.initialized = "true";

    logoutBtn.addEventListener("click", (event) => {
      event.preventDefault();
      handleLogout();
    });
  }

  const avatar = document.querySelector("#userAvatar");

  if (avatar && !avatar.dataset.initialized) {
    avatar.dataset.initialized = "true";

    avatar.addEventListener("click", () => handleLogout());
  }
}

// ==================== PAGE INITIALIZATION ====================

let homePageInitialized = false;

function initHomePage() {
  initSidebar();
  initLibrary();
  initSidebarPlaylists();
  loadMainView();
}

function initApp() {
  initHeader();
  updateHeaderUI();
  initForms();

  // Chỉ tải dữ liệu trang chủ khi đang ở trang chủ.
  if (document.querySelector("#trendingTracks")) {
    initHomePage();
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp, {
    once: true,
  });
} else {
  initApp();
}

document.addEventListener("pagechanged", (event) => {
  const { page, params } = event.detail || {};
  const id =
    params?.id || new URLSearchParams(window.location.search).get("id");

  switch (page) {
    case "home":
      initSidebar();
      initSidebarPlaylists();
      loadMainView();
      break;

    case "track":
      if (id) initTrackPage(id);
      break;

    case "artist":
      if (id) initArtistPage(id);
      break;

    case "album":
      if (id) initAlbumPage(id);
      break;

    case "playlist":
      if (id) initPlaylistPage(id);
      break;
  }
});

window.openDetail = function (type, id) {
  if (!id) return;

  const allowedTypes = ["track", "artist", "album", "playlist"];

  if (!allowedTypes.includes(type)) {
    console.error("Loại trang không hợp lệ:", type);
    return;
  }

  navigate(type, { id: String(id) });
};
