import { api } from "../app/router.js";

const params = new URLSearchParams(window.location.search);
const playlistId = params.get("id");

if (playlistId) {
  loadPlaylistDetail(playlistId);
}

// === Load chi tiết Playlist ===
async function loadPlaylistDetail(id) {
  try {
    const res = await api.get(`/api/playlists/${id}`);
    const playlist = res.data;

    // Render thông tin chính
    document.querySelector("#detailImage").src =
      playlist.image_url || "/src/assets/playlist.png";
    document.querySelector("#detailName").textContent = playlist.title;
    document.querySelector("#detailDesc").textContent =
      playlist.additional_info?.description || "";

    // Nếu là playlist của mình → hiện nút Delete
    const currentUser = JSON.parse(localStorage.getItem("user"))?.name;
    if (playlist.additional_info?.creator_name === currentUser) {
      document.querySelector("#deleteBtn").classList.remove("hidden");
    }

    // Render danh sách bài hát
    const trackList = document.querySelector("#trackList");
    const tracks = Array.isArray(playlist.tracks) ? playlist.tracks : [];

    if (tracks.length === 0) {
      trackList.innerHTML = `
    <p class="text-gray-400 text-sm italic">
      Playlist này chưa có bài hát nào.
    </p>`;
    } else {
      trackList.innerHTML = tracks
        .map(
          (t) => `
      <div class="flex items-center justify-between p-2 hover:bg-neutral-800 rounded">
        <div>
          <p class="text-white">${t.name}</p>
          <p class="text-gray-400 text-sm">${t.artists.map((a) => a.name).join(", ")}</p>
        </div>
        <span class="text-xs text-gray-400">${formatDuration(t.duration_ms)}</span>
      </div>`,
        )
        .join("");
    }

    // Khởi tạo nút Save/Remove theo trạng thái thực tế
    const toggleLibraryBtn = document.querySelector("#toggleLibraryBtn");
    if (playlist.is_following) {
      toggleLibraryBtn.textContent = "Remove from Your Library";
    } else {
      toggleLibraryBtn.textContent = "Save to Your Library";
    }

    // Gắn sự kiện cho nút
    initButtons(playlistId, playlist.owner?.display_name === currentUser);
  } catch (err) {
    console.error("Lỗi load playlist:", err);
  }
}

// === Format thời lượng bài hát ===
function formatDuration(ms) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

// === Gắn sự kiện cho nút Play, Save, Delete ===
function initButtons(playlistId, isOwner) {
  const playBtn = document.querySelector("#playBtn");
  const toggleLibraryBtn = document.querySelector("#toggleLibraryBtn");
  const deleteBtn = document.querySelector("#deleteBtn");

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      console.log("Play/Pause playlist");
    });
  }

  if (toggleLibraryBtn) {
    toggleLibraryBtn.addEventListener("click", async () => {
      if (toggleLibraryBtn.textContent.includes("Save")) {
        await api.post(`/api/playlists/${playlistId}/followers`);
        toggleLibraryBtn.textContent = "Remove from Your Library";
      } else {
        await api.delete(`/api/playlists/${playlistId}/followers`);
        toggleLibraryBtn.textContent = "Save to Your Library";
      }
    });
  }

  if (isOwner && deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      await api.delete(`/api/playlists/${playlistId}`);
      window.location.href = "/home.html";
    });
  }
}

// === Tìm kiếm và thêm bài hát ===
const searchInput = document.querySelector("input[type='text']");
searchInput.addEventListener("input", async (e) => {
  const query = e.target.value.trim();
  if (!query) return;

  const res = await api.get(
    `/api/search?q=${encodeURIComponent(query)}&type=track`,
  );
  const results = res.data.tracks.items;
  renderSearchResults(results);
});

function renderSearchResults(tracks) {
  const searchSection = document.querySelector(".pt-6");
  const resultContainer = document.createElement("div");
  resultContainer.className = "mt-4 space-y-2";

  resultContainer.innerHTML = tracks
    .map(
      (t) => `
      <div class="flex items-center justify-between p-2 hover:bg-neutral-800 rounded">
        <div>
          <p class="text-white">${t.name}</p>
          <p class="text-gray-400 text-sm">${t.artists.map((a) => a.name).join(", ")}</p>
        </div>
        <button class="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm font-semibold"
                data-track-id="${t.id}">
          Thêm
        </button>
      </div>`,
    )
    .join("");

  const oldResults = searchSection.querySelector("div.mt-4");
  if (oldResults) oldResults.remove();
  searchSection.appendChild(resultContainer);

  resultContainer.querySelectorAll("button[data-track-id]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const trackId = btn.dataset.trackId;
      await api.post(`/api/playlists/${playlistId}/tracks`, { trackId });
      btn.textContent = "Đã thêm";
      btn.disabled = true;
    });
  });
}
