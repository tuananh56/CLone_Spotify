import { api } from "../app/router.js"; // hoặc đường dẫn tới file api.js

export async function initLibrary() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const sortBtns = document.querySelectorAll(".sort-btn");
  const resultsBox = document.getElementById("filterResults");

  let currentFilter = "playlists";
  let currentSort = "recent";

  // Lấy dữ liệu thật từ API
  async function fetchData() {
    const [playlistsRes, artistsRes, albumsRes] = await Promise.all([
      api.get("/api/playlists"),
      api.get("/api/artists"),
      api.get("/api/albums"),
    ]);

    return {
      playlists: playlistsRes.data,
      artists: artistsRes.data,
      albums: albumsRes.data,
    };
  }

  const data = await fetchData();

  function renderList() {
    let items = [...data[currentFilter]];

    // Sắp xếp
    if (currentSort === "recent") {
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (currentSort === "alphabetical") {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === "creator") {
      items.sort((a, b) => a.creator.localeCompare(b.creator));
    }

    resultsBox.innerHTML = items
      .map(
        (item) => `
        <div class="flex flex-col items-center hover:bg-neutral-800 p-3 rounded-lg transition-all duration-200 cursor-pointer hover:scale-105">
          <img src="${item.image || "/src/assets/placeholder.png"}" class="mb-2 rounded-lg w-32 h-32" />
          <p class="font-semibold">${item.name}</p>
          <p class="text-gray-400 text-sm">by ${item.creator}</p>
        </div>`
      )
      .join("");
  }

  // Lọc
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) =>
        b.classList.remove("bg-green-500", "text-black", "font-bold")
      );
      btn.classList.add("bg-green-500", "text-black", "font-bold");
      currentFilter = btn.id.replace("filter", "").toLowerCase();
      renderList();
    });
  });

  // Sắp xếp
  sortBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sortBtns.forEach((b) =>
        b.classList.remove("bg-green-500", "text-black", "font-bold")
      );
      btn.classList.add("bg-green-500", "text-black", "font-bold");
      currentSort = btn.id.replace("sort", "").toLowerCase();
      renderList();
    });
  });

  // Mặc định hiển thị Playlists + Recently Added
  document.getElementById("filterPlaylists").click();
  document.getElementById("sortRecent").click();
}
