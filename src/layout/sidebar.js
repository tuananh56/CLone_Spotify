import { api } from "../app/router.js";

let viewMode = "default-list";

export function initSidebar() {
  const toggleBtn = document.getElementById("toggleViewBtn");

  loadSidebarItems();

  toggleBtn.addEventListener("click", () => {
    const modes = [
      "compact-list",
      "default-list",
      "compact-grid",
      "default-grid",
    ];
    const currentIndex = modes.indexOf(viewMode);
    viewMode = modes[(currentIndex + 1) % modes.length];
    loadSidebarItems();
  });
}

function normalizeItem(apiItem) {
  return {
    id: apiItem.id,
    name: apiItem.name,
    type: apiItem.type || "Playlist",
    owner: apiItem.owner?.display_name || "",
    image: apiItem.images?.[0]?.url || "/src/assets/placeholder.png",
  };
}

async function loadSidebarItems() {
  try {
    const res = await api.get("/api/playlists");
    console.log("Dữ liệu trả về:", res.data);
    const items = res.data.playlists.map(normalizeItem);
    renderSidebarList(items);
  } catch (err) {
    console.error("Lỗi tải danh sách sidebar:", err);
  }
}

function renderSidebarList(items) {
  const sidebarList = document.getElementById("sidebarList");
  sidebarList.classList.add("opacity-0", "transition-opacity", "duration-300");

  setTimeout(() => {
    sidebarList.innerHTML = items
      .map((item) => renderItem(item, viewMode))
      .join("");
    sidebarList.classList.remove("opacity-0");
    sidebarList.classList.add("opacity-100");
  }, 150);
}

function renderItem(item, mode) {
  switch (mode) {
    case "compact-list":
      return `
        <div class="text-sm text-gray-300 hover:text-white cursor-pointer p-2">
          ${item.name} <span class="text-xs text-gray-500">• ${item.type}</span>
        </div>`;
    case "default-list":
      return `
    <div class="flex items-center space-x-3 p-2 hover:bg-neutral-800 rounded cursor-pointer transition-all duration-200 ease-in-out">
      <img src="${item.image}" class="w-10 h-10 rounded transition-transform duration-200 group-hover:scale-105" />
      <div>
        <p class="text-white text-sm">${item.name}</p>
        <p class="text-xs text-gray-400">${item.type} • ${item.owner}</p>
      </div>
    </div>`;
    case "compact-grid":
      return `
        <div class="relative group w-20 h-20 inline-block m-2">
          <img src="${item.image}" class="w-full h-full rounded" />
          <div class="absolute inset-0 bg-black bg-opacity-70 hidden group-hover:flex flex-col justify-center items-center text-xs text-white">
            <p>${item.name}</p>
            <p>${item.type} • ${item.owner}</p>
          </div>
        </div>`;
    case "default-grid":
      return `
        <div class="flex flex-col items-center p-2 hover:bg-neutral-800 rounded cursor-pointer inline-block m-2">
          <img src="${item.image}" class="w-24 h-24 rounded mb-2" />
          <p class="text-white text-sm">${item.name}</p>
          <p class="text-xs text-gray-400">${item.type} • ${item.owner}</p>
        </div>`;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const sortBtns = document.querySelectorAll(".sort-btn");
  const resultsBox = document.getElementById("filterResults");

  // Demo dữ liệu
  const data = {
    playlists: [
      { name: "Top Hits", createdAt: "2026-10-20", creator: "Spotify" },
      { name: "Workout Mix", createdAt: "2026-10-18", creator: "Anh" },
      { name: "Chill Vibes", createdAt: "2026-10-15", creator: "Spotify" },
    ],
    artists: [
      { name: "Sơn Tùng MTP", createdAt: "2026-10-10", creator: "Spotify" },
      { name: "Taylor Swift", createdAt: "2026-09-25", creator: "Anh" },
    ],
    albums: [
      { name: "1989", createdAt: "2026-09-20", creator: "Spotify" },
      { name: "Thriller", createdAt: "2026-09-15", creator: "Anh" },
    ],
  };

  let currentFilter = "playlists";
  let currentSort = "recent";

  function renderList() {
    let items = [...data[currentFilter]];

    // Sắp xếp theo trạng thái
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
        <div class="p-2 rounded hover:bg-neutral-700 cursor-pointer">
          <span class="font-semibold">${item.name}</span>
          <span class="block text-xs text-gray-400">by ${item.creator}</span>
        </div>`,
      )
      .join("");
  }

  // Lọc
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) =>
        b.classList.remove("bg-green-500", "text-black", "font-bold"),
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
        b.classList.remove("bg-green-500", "text-black", "font-bold"),
      );
      btn.classList.add("bg-green-500", "text-black", "font-bold");
      currentSort = btn.id.replace("sort", "").toLowerCase();
      renderList();
    });
  });

  // Mặc định hiển thị Playlists + Recently Added
  document.getElementById("filterPlaylists").click();
  document.getElementById("sortRecent").click();
});
