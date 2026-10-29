import { navigate } from "../app/router.js";
import { api } from "../app/api.js";

let sidebarInitialized = false;
let searchRequestId = 0;

// Khởi tạo sidebar mỗi khi vào Home
export function initSidebar() {
  const sidebarList = document.getElementById("sidebarList");
  if (!sidebarList) return;

  // Nạp playlist mỗi lần sidebar được hiển thị
  loadSidebarPlaylists();

  // Chỉ đăng ký các sự kiện một lần cho mỗi document
  if (sidebarInitialized) return;
  sidebarInitialized = true;

  // Tạo playlist
  document.addEventListener("click", async (event) => {
    const createBtn = event.target.closest(".fa-plus")?.closest("button");
    if (!createBtn) return;

    // Chỉ xử lý nút thêm playlist trong sidebar
    if (!createBtn.closest("#sidebarList") && !createBtn.closest("aside")) {
      return;
    }

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

      // window.location.href = `${import.meta.env.BASE_URL}playlist.html?id=${encodeURIComponent(newPlaylistId)}`;
      navigate("playlist", {
        id: String(newPlaylistId),
      });
    } catch (err) {
      console.error("Lỗi tạo playlist:", err);
    }
  });

  // Dùng event delegation để nút và item vẫn hoạt động
  // sau khi nội dung sidebar được render lại
  document.addEventListener("click", async (event) => {
    const searchBtn = event.target.closest("#sidebarSearchBtn");

    if (searchBtn) {
      const searchBox = document.getElementById("sidebarSearchBox");
      const searchInput = document.getElementById("sidebarSearchInput");

      if (!searchBox || !searchInput) return;

      searchBox.classList.toggle("hidden");

      if (!searchBox.classList.contains("hidden")) {
        searchInput.focus();
      }

      return;
    }

    const item = event.target.closest("#sidebarList .sidebar-item");

    if (item) {
      const id = item.dataset.id;

      if (id) {
        navigate("playlist", { id: String(id) });
      }
    }
  });

  // Tìm kiếm playlist
  document.addEventListener("input", async (event) => {
    if (!event.target.matches("#sidebarSearchInput")) return;

    const query = event.target.value.trim();
    const requestId = ++searchRequestId;

    if (!query) {
      await loadSidebarPlaylists();
      return;
    }

    try {
      const res = await api.get(
        `/api/search/playlists?q=${encodeURIComponent(query)}&limit=20`,
      );

      // Bỏ qua kết quả cũ nếu người dùng đã nhập tiếp
      if (requestId !== searchRequestId) return;

      const results =
        res.data.playlists?.items || res.data.playlists || res.data.items || [];

      renderSidebarSearchResults(results);
    } catch (err) {
      if (requestId === searchRequestId) {
        console.error("Lỗi search playlist:", err);
      }
    }
  });
}

// Tải playlist của người dùng
async function loadSidebarPlaylists() {
  const sidebarList = document.getElementById("sidebarList");
  if (!sidebarList) return;

  try {
    const res = await api.get("/api/me/playlists");
    // console.log("Playlist sidebar:", JSON.stringify(res.data, null, 2));

    const playlists = res.data.playlists || [];

    // Có thể router đã thay sidebar trong lúc chờ API
    if (!document.getElementById("sidebarList")) return;

    const firstBlock = document.querySelector("#firstPlaylistBlock");
    const podcastBlock = document.querySelector("#podcastBlock");

    if (playlists.length > 0) {
      firstBlock?.classList.add("hidden");
      podcastBlock?.classList.add("hidden");

      sidebarList.innerHTML = playlists
        .map((p) => {
          const playlistId = p.id || p._id || p.playlistId || "";

          const image =
            p.image_url ||
            p.cover_image_url ||
            p.imageUrl ||
            p.images?.[0]?.url ||
            p.cover?.url ||
            `${import.meta.env.BASE_URL}playlist.png`;

          const playlistName = p.name || p.title || "Playlist không tên";
          const owner = p.owner?.display_name || p.subtitle || "Bạn";

          return `
      <div
        class="sidebar-item flex items-center gap-3 p-2
               hover:bg-neutral-800 rounded cursor-pointer"
        data-type="playlist"
        data-id="${escapeHTML(playlistId)}"
      >
        <img
          src="${escapeHTML(image)}"
          alt=""
          class="w-10 h-10 rounded object-cover shrink-0"
          onerror="this.onerror=null;this.src='${import.meta.env.BASE_URL}playlist.png'"
        />

        <div class="min-w-0 flex-1">
          <p class="truncate text-white text-sm">
            ${escapeHTML(playlistName)}
          </p>

          <p class="truncate text-xs text-gray-400">
            ${escapeHTML(owner)}
          </p>
        </div>
      </div>
    `;
        })
        .join("");
    } else {
      sidebarList.innerHTML = "";
    }
  } catch (err) {
    console.error("Lỗi tải playlist:", err);
  }
}

// Hiển thị kết quả tìm kiếm playlist
function renderSidebarSearchResults(playlists) {
  const sidebarList = document.getElementById("sidebarList");
  if (!sidebarList) return;

  if (!Array.isArray(playlists) || playlists.length === 0) {
    sidebarList.innerHTML = `
      <p class="px-3 py-4 text-sm text-neutral-400">
        Không tìm thấy playlist.
      </p>
    `;
    return;
  }

  sidebarList.innerHTML = playlists
    .map((p) => {
      const playlistId = p.id || p._id || p.playlistId || "";

      const image =
        p.image_url ||
        p.cover_image_url ||
        p.images?.[0]?.url ||
        `${import.meta.env.BASE_URL}playlist.png`;

      const trackCount =
        p.track_count ??
        p.tracks_count ??
        p.total_tracks ??
        p.tracks?.total ??
        p.tracks?.length;

      const playlistName = p.title || p.name || "Playlist không tên";
      const owner = p.subtitle || p.owner?.display_name || "Playlist";

      return `
        <div
          class="sidebar-item flex items-center gap-3 p-2
                 hover:bg-neutral-800 rounded cursor-pointer"
          data-type="playlist"
          data-id="${escapeHTML(playlistId)}"
        >
          <img
            src="${escapeHTML(image)}"
            alt=""
            class="w-10 h-10 rounded object-cover shrink-0"
            onerror="this.onerror=null;this.src='${import.meta.env.BASE_URL}playlist.png'"
          />

          <div class="min-w-0 flex-1">
            <p class="truncate text-white text-sm">
              ${escapeHTML(playlistName)}
            </p>

            <p class="truncate text-xs text-gray-400">
              ${escapeHTML(owner)}
              ${trackCount != null ? ` • ${trackCount} bài hát` : ""}
            </p>
          </div>
        </div>
      `;
    })
    .join("");
}
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => {
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
