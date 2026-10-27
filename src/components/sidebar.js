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

      window.location.href = `/pages/playlist.html?id=${newPlaylistId}`;
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
        window.location.href = `/pages/playlist.html?id=${id}`;
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
        `/api/search/playlists?q=${encodeURIcomponents(query)}&limit=20`,
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
    const playlists = res.data.playlists || [];

    // Có thể router đã thay sidebar trong lúc chờ API
    if (!document.getElementById("sidebarList")) return;

    const firstBlock = document.querySelector("#firstPlaylistBlock");
    const podcastBlock = document.querySelector("#podcastBlock");

    if (playlists.length > 0) {
      firstBlock?.classList.add("hidden");
      podcastBlock?.classList.add("hidden");

      sidebarList.innerHTML = playlists
        .map(
          (p) => `
            <div
              class="sidebar-item flex items-center space-x-3 p-2
                     hover:bg-neutral-800 rounded cursor-pointer"
              data-type="playlist"
              data-id="${p.id || p._id || p.playlistId || ""}"
            >
              <img
                src="${p.images?.[0]?.url || "/src/assets/playlist.png"}"
                alt=""
                class="w-10 h-10 rounded object-cover"
              />

              <div class="min-w-0">
                <p class="truncate text-white text-sm">
                  ${p.name || "Playlist không tên"}
                </p>
                <p class="text-xs text-gray-400">
                  Playlist • ${p.owner?.display_name || "Bạn"}
                </p>
              </div>
            </div>
          `,
        )
        .join("");
    } else {
      sidebarList.innerHTML = "";
    }
  } catch (err) {
    console.error("Lỗi tải playlist:", err);
  }
}

// Hiển thị kết quả tìm kiếm
function renderSidebarSearchResults(playlists) {
  const sidebarList = document.getElementById("sidebarList");
  if (!sidebarList) return;

  sidebarList.innerHTML = playlists
    .map(
      (p) => `
        <div
          class="sidebar-item flex items-center space-x-3 p-2
                 hover:bg-neutral-800 rounded cursor-pointer"
          data-type="playlist"
          data-id="${p.id || p._id || p.playlistId || ""}"
        >
          <img
            src="${
              p.image_url || p.images?.[0]?.url || "/src/assets/playlist.png"
            }"
            alt=""
            class="w-10 h-10 rounded object-cover"
          />

          <div class="min-w-0">
            <p class="truncate text-white text-sm">
              ${p.title || p.name || "Playlist không tên"}
            </p>
            <p class="truncate text-xs text-gray-400">
              ${p.subtitle || p.owner?.display_name || "Playlist"}
            </p>
          </div>
        </div>
      `,
    )
    .join("");
}
