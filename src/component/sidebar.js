import { api } from "../app/router.js";

export function initSidebar() {
  const createBtn = document.querySelector(".fa-plus")?.closest("button");
  if (createBtn) {
    createBtn.addEventListener("click", async () => {
      try {
        const res = await api.post("/api/playlists", {
          name: "New Playlist",
          description: "Playlist mới tạo",
        });

        const playlistData = res.data.playlist || res.data;
        const newPlaylistId =
          playlistData.id || playlistData._id || playlistData.playlistId;

        if (!newPlaylistId) {
          throw new Error("Không tìm thấy ID trong phản hồi API");
        }

        window.location.href = `/playlist.html?id=${newPlaylistId}`;
      } catch (err) {
        console.error("Lỗi tạo playlist:", err);
      }
    });
  }
}

async function loadSidebarPlaylists() {
  try {
    const res = await api.get("/api/me/playlists");
    const playlists = res.data.playlists || [];

    const sidebarList = document.getElementById("sidebarList");
    const firstBlock = document.querySelector("#firstPlaylistBlock");
    const podcastBlock = document.querySelector("#podcastBlock");

    if (playlists.length > 0) {
      firstBlock?.classList.add("hidden");
      podcastBlock?.classList.add("hidden");

      sidebarList.innerHTML = playlists
        .map(
          (p) => `
        <div class="sidebar-item flex items-center space-x-3 p-2 hover:bg-neutral-800 rounded cursor-pointer"
             data-type="playlist" data-id="${p.id}">
          <img src="${p.images?.[0]?.url || "/src/assets/playlist.png"}" class="w-10 h-10 rounded" />
          <div>
            <p class="text-white text-sm">${p.name}</p>
            <p class="text-xs text-gray-400">Playlist • ${p.owner?.display_name || "Bạn"}</p>
          </div>
        </div>
      `,
        )
        .join("");

      sidebarList.querySelectorAll(".sidebar-item").forEach((el) => {
        el.addEventListener("click", () => {
          const id = el.dataset.id;
          window.location.href = `/playlist.html?id=${id}`;
        });
      });
    }
  } catch (err) {
    console.error("Lỗi tải playlist:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initSidebar();
  loadSidebarPlaylists();

  // === Search ở sidebar ===
  const searchBtn = document.querySelector("#sidebarSearchBtn");
  const searchBox = document.querySelector("#sidebarSearchBox");
  const searchInput = document.querySelector("#sidebarSearchInput");

  searchBtn.addEventListener("click", () => {
    searchBox.classList.toggle("hidden");
    if (!searchBox.classList.contains("hidden")) {
      searchInput.focus();
    }
  });

  searchInput.addEventListener("input", async (e) => {
    const query = e.target.value.trim();
    if (!query) {
      loadSidebarPlaylists();
      return;
    }

    try {
      const res = await api.get(
        `/api/search/playlists?q=${encodeURIComponent(query)}&limit=20`,
      );

      // kiểm tra nhiều khả năng trả về
      const results =
        res.data.playlists?.items || // dạng chuẩn Spotify
        res.data.playlists || // nếu backend trả về mảng trực tiếp
        res.data.items || // fallback nếu chỉ có items
        [];
      renderSidebarSearchResults(results);
    } catch (err) {
      console.error("Lỗi search playlist:", err);
    }
  });
});

// === Render kết quả search ===
function renderSidebarSearchResults(playlists) {
  const sidebarList = document.getElementById("sidebarList");
  sidebarList.innerHTML = playlists
    .map(
      (p) => `
    <div class="sidebar-item flex items-center space-x-3 p-2 hover:bg-neutral-800 rounded cursor-pointer"
         data-type="playlist" data-id="${p.id}">
      <img src="${p.image_url || "/src/assets/playlist.png"}" class="w-10 h-10 rounded" />
      <div>
        <p class="text-white text-sm">${p.title}</p>
        <p class="text-xs text-gray-400">${p.subtitle}</p>
      </div>
    </div>
  `,
    )
    .join("");

  sidebarList.querySelectorAll(".sidebar-item").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      window.location.href = `/playlist.html?id=${id}`;
    });
  });
}
