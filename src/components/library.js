import { api } from "../app/api.js";

export async function initLibrary() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const sortBtns = document.querySelectorAll(".sort-btn");
  const resultsBox = document.getElementById("filterResults");

  // Trang hiện tại không có khu vực Library thì bỏ qua
  if (!resultsBox || filterBtns.length === 0 || sortBtns.length === 0) {
    return;
  }

  let currentFilter = "playlists";
  let currentSort = "recent";
  let data = {};

  // Lấy dữ liệu cho trang Library
  async function fetchData() {
    try {
      const [playlistsRes, artistsRes, albumsRes] = await Promise.all([
        api.get(
          "https://spotify.f8team.dev/api/search/playlists?q=top&limit=20",
        ),
        api.get("https://spotify.f8team.dev/api/search/artists?q=s&limit=20"),
        api.get("https://spotify.f8team.dev/api/search/albums?q=a&limit=20"),
      ]);

      return {
        playlists: playlistsRes.data.playlists?.items || [],
        artists: artistsRes.data.artists?.items || [],
        albums: albumsRes.data.albums?.items || [],
      };
    } catch (err) {
      console.error("Lỗi tải dữ liệu Library:", err);
      return {
        playlists: [],
        artists: [],
        albums: [],
      };
    }
  }

  data = await fetchData();

  // Hiển thị danh sách theo bộ lọc và cách sắp xếp
  function renderList() {
    const items = Array.isArray(data[currentFilter])
      ? [...data[currentFilter]]
      : [];

    if (currentSort === "recent") {
      items.sort(
        (a, b) => new Date(b.added_at || 0) - new Date(a.added_at || 0),
      );
    } else if (currentSort === "alphabetical") {
      items.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (currentSort === "creator") {
      items.sort((a, b) => {
        const creatorA = a.owner?.display_name || a.artists?.[0]?.name || "";
        const creatorB = b.owner?.display_name || b.artists?.[0]?.name || "";

        return creatorA.localeCompare(creatorB);
      });
    }

    resultsBox.innerHTML = items
      .map(
        (item) => `
          <div
            class="flex flex-col items-center rounded-lg p-3
                   transition-all duration-200 hover:scale-105
                   hover:bg-neutral-800 cursor-pointer"
          >
            <img
              src="${item.images?.[0]?.url || "../src/assets/placeholder.png"}"
              alt="${item.name || ""}"
              class="mb-2 h-32 w-32 rounded-lg object-cover"
            />

            <p class="font-semibold">
              ${item.name || "Không có tên"}
            </p>

            <p class="text-sm text-gray-400">
              by ${
                item.owner?.display_name || item.artists?.[0]?.name || "Unknown"
              }
            </p>
          </div>
        `,
      )
      .join("");
  }

  // Xử lý bộ lọc Playlists / Artists / Albums
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((item) => {
        item.classList.remove("bg-green-500", "text-black", "font-bold");
      });

      btn.classList.add("bg-green-500", "text-black", "font-bold");

      currentFilter = btn.id.replace("filter", "").toLowerCase();

      renderList();
    });
  });

  // Xử lý sắp xếp
  sortBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sortBtns.forEach((item) => {
        item.classList.remove("bg-green-500", "text-black", "font-bold");
      });

      btn.classList.add("bg-green-500", "text-black", "font-bold");

      currentSort = btn.id.replace("sort", "").toLowerCase();

      renderList();
    });
  });

  // Mặc định: Playlists + Recently Added
  const filterPlaylists = document.getElementById("filterPlaylists");
  const sortRecent = document.getElementById("sortRecent");

  if (filterPlaylists) {
    filterPlaylists.click();
  } else {
    renderList();
  }

  if (sortRecent) {
    sortRecent.click();
  }
}

// Hiển thị playlist trong sidebar của trang Home
export async function initSidebarPlaylists() {
  const sidebarList = document.getElementById("sidebarList");

  if (!sidebarList) {
    return;
  }

  try {
    // Lấy thông tin user đã đăng nhập
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user?.id) {
      sidebarList.innerHTML = `
        <p class="px-2 py-2 text-sm text-gray-400">
          Đăng nhập để xem playlist
        </p>
      `;
      return;
    }

    // Lấy playlist của user
    const res = await api.get(`/api/users/${user.id}/playlists`);

    const playlists = res.data?.playlists ?? res.data ?? [];

    if (!Array.isArray(playlists) || playlists.length === 0) {
      sidebarList.innerHTML = `
        <p class="px-2 py-2 text-sm text-gray-400">
          Chưa có playlist
        </p>
      `;
      return;
    }

    // Render playlist vào sidebar
    sidebarList.innerHTML = playlists
      .map(
        (playlist) => `
          <div
            class="flex items-center gap-3 rounded-md p-2
                   transition-colors hover:bg-neutral-800
                   cursor-pointer"
            data-playlist-id="${playlist.id}"
          >
            <img
              src="${
                playlist.images?.[0]?.url || "../src/assets/placeholder.png"
              }"
              alt=""
              class="h-10 w-10 shrink-0 rounded object-cover"
            />

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">
                ${playlist.name || "Playlist không tên"}
              </p>

              <p class="text-xs text-gray-400">
                Playlist
              </p>
            </div>
          </div>
        `,
      )
      .join("");
  } catch (err) {
    console.error("Lỗi tải playlist sidebar:", err);

    sidebarList.innerHTML = `
      <p class="px-2 py-2 text-sm text-red-400">
        Không thể tải playlist
      </p>
    `;
  }
}
