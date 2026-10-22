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
      playlist.images?.[0]?.url || "/src/assets/placeholder.png";
    document.querySelector("#detailName").textContent = playlist.name;
    document.querySelector("#detailDesc").textContent =
      playlist.description || "";

    // Nếu là playlist của mình → hiện nút Delete
    const currentUser = JSON.parse(localStorage.getItem("user"))?.email;
    if (playlist.owner?.display_name === currentUser) {
      document.querySelector("#deleteBtn").classList.remove("hidden");
    }

    // Render danh sách bài hát
    const trackList = document.querySelector("#trackList");
    const tracks = playlist.tracks?.items || []; // fallback nếu không có tracks

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
          <p class="text-white">${t.track.name}</p>
          <p class="text-gray-400 text-sm">${t.track.artists.map((a) => a.name).join(", ")}</p>
        </div>
        <span class="text-xs text-gray-400">${formatDuration(t.track.duration_ms)}</span>
      </div>`,
        )
        .join("");
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
      // TODO: tích hợp player để phát nhạc
      console.log("Play/Pause playlist");
    });
  }

  if (toggleLibraryBtn) {
    toggleLibraryBtn.addEventListener("click", async () => {
      if (toggleLibraryBtn.textContent.includes("Save")) {
        await api.put(`/api/playlists/${playlistId}/followers`);
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
