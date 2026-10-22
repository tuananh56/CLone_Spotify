import { initLibrary } from "./layout/library.js";
import { initSidebar } from "./layout/sidebar.js";
import { handleRegister } from "./auth/register.js";
import { handleLogin } from "./auth/login.js";
import { handleLogout } from "./auth/logout.js";
import { api } from "./app/router.js";
import { initHeader, updateHeaderUI } from "./layout/header.js";

// === Main View ===
async function loadMainView() {
  try {
    const [tracksRes, artistsRes, albumsRes, playlistsRes] = await Promise.all([
      api.get("/api/tracks/trending"),
      api.get("/api/artists/trending"),
      api.get("/api/albums/popular"),
      api.get("/api/playlists"),
    ]);

    renderSection("trendingTracks", tracksRes.data.tracks, "track");
    renderSection("trendingArtists", artistsRes.data.artists, "artist");
    renderSection("popularAlbums", albumsRes.data.albums, "album");
    renderSection("allPlaylists", playlistsRes.data.playlists, "playlist");
  } catch (err) {
    console.error("Main view fetch error:", err);
  }
}

function renderSection(containerId, items, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = items
    .map((item) => {
      // Lấy ID đúng từ dữ liệu API
      const id =
        item.id ||
        item._id ||
        item.playlistId ||
        item.artistId ||
        item.albumId ||
        item.trackId ||
        (item.uri ? item.uri.split(":").pop() : null);

      if (!id) {
        console.warn("Không tìm thấy ID cho item:", item);
        return `
          <div class="w-44 p-3 bg-neutral-800 rounded-lg">
            <p class="text-red-400 text-sm">Missing ID</p>
          </div>`;
      }

      const name =
        item.name ||
        item.title ||
        item.data?.name ||
        item.profile?.name ||
        item.album?.name ||
        "Unknown";

      const image =
        item.images?.[0]?.url ||
        item.coverArt?.sources?.[0]?.url ||
        item.image ||
        item.visuals?.avatarImage?.sources?.[0]?.url ||
        "/src/assets/placeholder.png";

      const sub =
        type === "track"
          ? item.artists?.[0]?.name
          : item.owner?.display_name ||
            item.publisher ||
            item.artist ||
            item.creator ||
            "";

      const detailUrl = `/${type}.html?id=${id}`;

      return `
        <div
          class="flex-shrink-0 w-44 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition cursor-pointer"
          onclick="window.location.href='${detailUrl}'"
        >
          <img src="${image}" class="w-full h-44 object-cover rounded mb-2" />
          <p class="text-white text-sm font-semibold truncate">${name}</p>
          <p class="text-xs text-gray-400">${sub}</p>
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
