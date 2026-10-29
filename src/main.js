import { initAllAlbumPage } from "./components/page/allalbum.js";
import { initAllArtistPage } from "./components/page/allartist.js";
import { initAllPlaylistPage } from "./components/page/allplaylist.js";
import { initAllTrackPage } from "./components/page/alltrack.js";

import { initFooter } from "./components/footer.js";
import { initSidebarToggle } from "./components/sidebar-toggle.js";
import { initPlayer } from "./player.js";

import { initTrackPage } from "./playlists/track.js";
import { initArtistPage } from "./playlists/artist.js";
import { initAlbumPage } from "./playlists/album.js";
import { initPlaylistPage } from "./playlists/playlist.js";

import { handleRegister } from "./auth/register.js";
import { handleLogin } from "./auth/login.js";
import { handleLogout } from "./auth/logout.js";

import { navigate } from "./app/router.js";
import { initLibrary, initSidebarPlaylists } from "./components/library.js";
import { initSidebar } from "./components/sidebar.js";

import { api } from "./app/api.js";
import { initHeader, updateHeaderUI } from "./components/header.js";

// ==================== MAIN VIEW ====================

async function loadMainView() {
  try {
    const [tracksRes, artistsRes, albumsRes, playlistsRes] = await Promise.all([
      api.get("/api/tracks/trending"),
      api.get("/api/artists/trending"),
      api.get("/api/albums/popular"),
      api.get("/api/playlists?limit=50&offset=0"),
    ]);

    renderSection("trendingTracks", tracksRes.data?.tracks, "track");

    renderSection("trendingArtists", artistsRes.data?.artists, "artist");

    renderSection("popularAlbums", albumsRes.data?.albums, "album");

    const responseData = playlistsRes.data;

    const playlists = Array.isArray(responseData)
      ? responseData
      : (responseData?.playlists?.items ??
        responseData?.playlists ??
        responseData?.items ??
        responseData?.data?.playlists ??
        responseData?.data?.items ??
        []);

    renderSection("allPlaylists", playlists, "playlist");
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
      const id = item.id ?? item.artistId ?? item._id ?? item.playlistId;

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
        item.images?.[0]?.url ||
        `${import.meta.env.BASE_URL}playlist.png`;

      const sub =
        type === "artist"
          ? `${Number(
              item.monthly_listeners || 0,
            ).toLocaleString()} người nghe/tháng`
          : item.artist_name ||
            item.artist ||
            item.owner?.display_name ||
            item.owner?.name ||
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

// ==================== PERSISTENT PLAYER ====================

let playerInitialized = false;
let playerInitPromise = null;

async function initPersistentPlayer() {
  const playerContainer = document.querySelector("#player-container");

  if (!playerContainer) {
    console.error("Không tìm thấy #player-container");
    return;
  }

  if (playerInitialized && playerContainer.querySelector("audio")) {
    return;
  }

  if (playerInitPromise) {
    return playerInitPromise;
  }

  playerInitPromise = (async () => {
    try {
      if (!playerContainer.querySelector("audio")) {
        const response = await fetch(`${import.meta.env.BASE_URL}player.html`);

        if (!response.ok) {
          throw new Error(`Không tải được player.html: ${response.status}`);
        }

        playerContainer.innerHTML = await response.text();
      }

      if (!playerInitialized) {
        initPlayer();
        playerInitialized = true;
        document.dispatchEvent(new Event("playerloaded"));
      }
    } catch (error) {
      console.error("Lỗi khởi tạo player:", error);
    } finally {
      playerInitPromise = null;
    }
  })();

  return playerInitPromise;
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
  initPersistentPlayer();
  initHeader();
  updateHeaderUI();
  initForms();
  initSidebarToggle();
  initFooter();

  if (document.querySelector("#sidebarList")) {
    initSidebar();
    initLibrary();
    initSidebarPlaylists();
  }

  const currentPage = window.location.pathname
    .split("/")
    .pop()
    .replace(/\.html$/, "");

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  switch (currentPage) {
    case "home":
      loadMainView();
      break;

    case "allalbum":
      initAllAlbumPage();
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
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp, {
    once: true,
  });
} else {
  initApp();
}

document.addEventListener("pagechanged", async (event) => {
  const { page, params } = event.detail || {};

  const id =
    params?.id || new URLSearchParams(window.location.search).get("id");

  // Khởi tạo sidebar mới sau mỗi lần SPA chuyển trang
  if (document.getElementById("sidebarList")) {
    initSidebar();
    initSidebarPlaylists();
  }

  switch (page) {
    case "home":
      loadMainView();
      break;

    case "track":
      if (id) await initTrackPage(id);
      break;

    case "artist":
      if (id) await initArtistPage(id);
      break;

    case "album":
      if (id) await initAlbumPage(id);
      break;

    case "playlist":
      if (id) {
        await initPlaylistPage(id);
      } else {
        console.error("Router không truyền ID playlist:", event.detail);
      }
      break;

    case "alltrack":
      await initAllTrackPage();
      break;

    case "allartist":
      await initAllArtistPage();
      break;

    case "allalbum":
      await initAllAlbumPage();
      break;

    case "allplaylist":
      await initAllPlaylistPage();
      break;

    case "search":
      await initSearchPage();
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
const openSearchPageBtn = document.getElementById("openSearchPageBtn");

openSearchPageBtn?.addEventListener("click", (event) => {
  event.preventDefault();
  navigate("search");
});

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");

mobileMenuBtn?.addEventListener("click", () => {
  const isOpening = mobileMenu.classList.contains("hidden");

  mobileMenu.classList.toggle("hidden");
  mobileMenuBtn.setAttribute("aria-expanded", String(isOpening));

  mobileMenuBtn.innerHTML = isOpening
    ? '<i class="fa-solid fa-xmark"></i>'
    : '<i class="fa-solid fa-bars"></i>';
});

// Đóng menu khi chọn một mục
mobileMenu?.querySelectorAll("a, button").forEach((item) => {
  item.addEventListener("click", () => {
    mobileMenu.classList.add("hidden");
    mobileMenuBtn?.setAttribute("aria-expanded", "false");
    if (mobileMenuBtn) {
      mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }
  });
});
