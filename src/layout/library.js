import { api } from "../app/router.js";

export async function initLibrary() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const sortBtns = document.querySelectorAll(".sort-btn");
  const resultsBox = document.getElementById("filterResults");

  // Nếu trang không có các phần tử này → bỏ qua
  if (!resultsBox || filterBtns.length === 0 || sortBtns.length === 0) return;

  let currentFilter = "playlists";
  let currentSort = "recent";
  let data = {};

  // === Lấy dữ liệu thật từ API ===
  async function fetchData() {
    try {
      const [playlistsRes, artistsRes, albumsRes] = await Promise.all([
        api.get("https://spotify.f8team.dev/api/search/playlists?q=top&limit=20"),
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
      return { playlists: [], artists: [], albums: [] };
    }
  }

  data = await fetchData();

  // === Render danh sách ===
  function renderList() {
    const items = Array.isArray(data[currentFilter]) ? [...data[currentFilter]] : [];

    // Sắp xếp
    if (currentSort === "recent") {
      items.sort((a, b) => new Date(b.added_at || 0) - new Date(a.added_at || 0));
    } else if (currentSort === "alphabetical") {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === "creator") {
      items.sort((a, b) =>
        (a.owner?.display_name || a.artists?.[0]?.name || "").localeCompare(
          b.owner?.display_name || b.artists?.[0]?.name || ""
        )
      );
    }

    resultsBox.innerHTML = items
      .map(
        (item) => `
        <div class="flex flex-col items-center hover:bg-neutral-800 p-3 rounded-lg transition-all duration-200 cursor-pointer hover:scale-105">
          <img src="${item.images?.[0]?.url || "/src/assets/placeholder.png"}" class="mb-2 rounded-lg w-32 h-32" />
          <p class="font-semibold">${item.name}</p>
          <p class="text-gray-400 text-sm">by ${item.owner?.display_name || item.artists?.[0]?.name || "Unknown"}</p>
        </div>`
      )
      .join("");
  }

  // === Lọc ===
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("bg-green-500", "text-black", "font-bold"));
      btn.classList.add("bg-green-500", "text-black", "font-bold");
      currentFilter = btn.id.replace("filter", "").toLowerCase();
      renderList();
    });
  });

  // === Sắp xếp ===
  sortBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sortBtns.forEach((b) => b.classList.remove("bg-green-500", "text-black", "font-bold"));
      btn.classList.add("bg-green-500", "text-black", "font-bold");
      currentSort = btn.id.replace("sort", "").toLowerCase();
      renderList();
    });
  });

  // === Mặc định hiển thị Playlists + Recently Added ===
  const filterPlaylists = document.getElementById("filterPlaylists");
  const sortRecent = document.getElementById("sortRecent");

  if (filterPlaylists) filterPlaylists.click();
  if (sortRecent) sortRecent.click();
}
