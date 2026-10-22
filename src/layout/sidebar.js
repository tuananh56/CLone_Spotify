import { api } from "../app/router.js";

let viewMode = "default-list";

export function initSidebar() {
  const createBtn = document.querySelector(".fa-plus")?.closest("button");
  if (createBtn) {
    createBtn.addEventListener("click", async () => {
      try {
        const res = await api.post("/api/playlists", {
          name: "New Playlist",
          description: "Playlist mới tạo",
        });

        console.log("New playlist created:", res.data);

        // Nếu API trả về playlist nằm trong res.data.playlist
        const playlistData = res.data.playlist || res.data;
        const newPlaylistId =
          playlistData.id || playlistData._id || playlistData.playlistId;

        if (!newPlaylistId) {
          throw new Error("Không tìm thấy ID trong phản hồi API");
        }

        // Thêm vào sidebarList
        const sidebarList = document.querySelector("#sidebarList");
        const item = document.createElement("div");
        item.className =
          "sidebar-item cursor-pointer p-2 rounded hover:bg-neutral-700";
        item.dataset.type = "playlist";
        item.dataset.id = newPlaylistId;
        item.textContent = playlistData.name;
        sidebarList.appendChild(item);

        // Redirect sang trang chi tiết playlist
        window.location.href = `/playlist.html?id=${newPlaylistId}`;
      } catch (err) {
        console.error("Lỗi tạo playlist:", err);
      }
    });
  }
}

function normalizeItem(apiItem, type) {
  return {
    id: apiItem.id || apiItem._id || apiItem.playlistId || apiItem.uri || "",
    name:
      apiItem.name ||
      apiItem.data?.name ||
      apiItem.profile?.name ||
      apiItem.title ||
      "Unknown",
    type: type,
    ownerId: apiItem.owner?.id || "", // lưu cả owner.id để so sánh
    owner:
      apiItem.owner?.display_name ||
      apiItem.creator ||
      apiItem.publisher ||
      "Spotify",
    image:
      apiItem.images?.[0]?.url ||
      apiItem.image ||
      apiItem.coverArt?.sources?.[0]?.url ||
      apiItem.visuals?.avatarImage?.sources?.[0]?.url ||
      "/src/assets/placeholder.png",
  };
}

async function loadSidebarItems() {
  try {
    const [playlistsRes, artistsRes, albumsRes] = await Promise.all([
      api.get("https://spotify.f8team.dev/api/search/playlists?q=top&limit=20"),
      api.get("https://spotify.f8team.dev/api/search/artists?q=s&limit=20"),
      api.get("https://spotify.f8team.dev/api/search/albums?q=a&limit=20"),
    ]);

    const items = [
      ...(playlistsRes.data.playlists || []).map((p) =>
        normalizeItem(p, "playlist"),
      ),
      ...(artistsRes.data.artists || []).map((a) => normalizeItem(a, "artist")),
      ...(albumsRes.data.albums || []).map((al) => normalizeItem(al, "album")),
    ];

    renderSidebarList(items);
  } catch (err) {
    console.error("Lỗi tải Sidebar:", err);
  }
}

function renderSidebarList(items) {
  const sidebarList = document.getElementById("sidebarList");
  if (!sidebarList) return;

  sidebarList.innerHTML = items
    .map((item) => renderItem(item, viewMode))
    .join("");
  attachContextMenuEvents(items);
}

function renderItem(item, mode) {
  return `
    <div class="sidebar-item flex items-center space-x-3 p-2 hover:bg-neutral-800 rounded cursor-pointer"
         data-type="${item.type}" 
         data-id="${item.id}" 
         data-owner="${item.owner}" 
         data-owner-id="${item.ownerId}">
      <img src="${item.image}" class="w-10 h-10 rounded" />
      <div>
        <p class="text-white text-sm">${item.name}</p>
        <p class="text-xs text-gray-400">${item.type} • ${item.owner}</p>
      </div>
    </div>`;
}

// === Context Menu ===
function showContextMenu(e, dataset) {
  const { type, ownerId } = dataset;
  let options = [];

  if (type === "artist") {
    options = ["Unfollow"];
  } else if (type === "playlist") {
    const currentUserId = JSON.parse(localStorage.getItem("user"))?.id || "";
    options =
      ownerId === currentUserId ? ["Delete"] : ["Remove from Your Library"];
  } else if (type === "album") {
    options = ["Remove from Your Library"];
  }

  const menu = document.getElementById("contextMenu") || createContextMenu();
  menu.innerHTML = options
    .map(
      (opt) =>
        `<div class="px-4 py-2 hover:bg-neutral-700 cursor-pointer">${opt}</div>`,
    )
    .join("");

  menu.style.left = `${e.pageX}px`;
  menu.style.top = `${e.pageY}px`;
  menu.classList.remove("hidden");

  menu.querySelectorAll("div").forEach((optEl) => {
    optEl.addEventListener("click", () => {
      console.log(`Thực hiện: ${optEl.textContent} cho ${type}`);
      menu.classList.add("hidden");
    });
  });
}

function createContextMenu() {
  const menu = document.createElement("div");
  menu.id = "contextMenu";
  menu.className =
    "absolute hidden bg-neutral-800 text-white rounded shadow-lg z-50";
  document.body.appendChild(menu);

  document.addEventListener("click", () => menu.classList.add("hidden"));
  return menu;
}

function attachContextMenuEvents(items) {
  const sidebarList = document.getElementById("sidebarList");
  if (!sidebarList) return;

  const itemEls = sidebarList.querySelectorAll(".sidebar-item");
  itemEls.forEach((el, index) => {
    el.addEventListener("contextmenu", (e) => showContextMenu(e, items[index]));
  });
}
