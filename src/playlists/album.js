import { playTrack } from "../player.js";
import { api } from "../app/api.js";

export async function initAlbumPage(id) {
  if (!id) {
    console.error("Không tìm thấy ID album");
    return;
  }

  await loadAlbumDetail(id);
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
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
// === Load chi tiết Album ===
async function loadAlbumDetail(id) {
  try {
    // Lấy thông tin album
    const res = await api.get(`/api/albums/${id}`);
    const album = res.data;

    document.querySelector("#detailImage").src =
      album.cover_image_url || "./src/assets/placeholder.png";
    document.querySelector("#detailName").textContent = album.title;
    document.querySelector("#detailDesc").textContent =
      `${album.artist_name || album.artist || ""} • ${album.release_date?.slice(0, 4) || ""}`;

    // Lấy danh sách bài hát trong album
    const resTracks = await api.get(`/api/albums/${id}/tracks`);
    // console.log("Tracks response:", resTracks.data);

    // API trả về { tracks: [...] }
    const tracks = Array.isArray(resTracks.data.tracks)
      ? resTracks.data.tracks
      : [];

    const trackList = document.querySelector("#trackList");
    if (tracks.length === 0) {
      trackList.innerHTML = `
        <p class="text-gray-400 text-sm italic">
          Album này chưa có bài hát nào.
        </p>`;
    } else {
      trackList.innerHTML = tracks
        .map((t, index) => {
          const artistNames = t.artist_name || "Không rõ nghệ sĩ";
          const trackTitle = t.title || "Không rõ tên bài hát";
          const duration = t.duration ? formatDuration(t.duration) : "0:00";

          const trackImage =
            t.image_url ||
            t.cover_image_url ||
            album.cover_image_url ||
            "./src/assets/placeholder.png";

          return `
        <div
          class="track-row group grid grid-cols-[40px_minmax(0,1fr)_60px] items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800 transition"
        >
          <div class="flex items-center justify-center">
            <span class="track-number group-hover:hidden">
              ${index + 1}
            </span>

            <button
              type="button"
              class="play-track-btn hidden text-white group-hover:block"
              data-index="${index}"
              aria-label="Phát ${escapeHTML(trackTitle)}"
              title="Phát bài hát"
            >
              <i class="fa-solid fa-play"></i>
            </button>
          </div>

          <button
            type="button"
            class="open-track-btn flex min-w-0 items-center gap-3 text-left"
            data-id="${escapeHTML(t.id || "")}"
            title="Xem chi tiết bài hát"
          >
            <img
              src="${escapeHTML(trackImage)}"
              alt=""
              class="h-12 w-12 shrink-0 rounded object-cover"
              onerror="this.onerror=null;this.src='./src/assets/placeholder.png'"
            />

            <span class="min-w-0">
              <span class="block truncate font-medium text-white hover:underline">
                ${escapeHTML(trackTitle)}
              </span>
              <span class="block truncate text-xs text-neutral-400">
                ${escapeHTML(artistNames)}
              </span>
            </span>
          </button>

          <span class="text-right text-xs tabular-nums text-neutral-400">
            ${duration}
          </span>
        </div>
      `;
        })
        .join("");
    }

    // Gắn sự kiện cho các bài hát trong album
    trackList.onclick = (event) => {
      // Nút phát bài hát khi rê chuột
      const playButton = event.target.closest(".play-track-btn");

      if (playButton) {
        event.stopPropagation();

        const index = Number(playButton.dataset.index);

        if (index >= 0 && index < tracks.length) {
          window.playlist = tracks;
          playTrack(index);
        }

        return;
      }

      // Bấm tên bài hát hoặc ảnh để mở chi tiết
      const openButton = event.target.closest(".open-track-btn");

      if (openButton) {
        const trackId = openButton.dataset.id;

        if (trackId && typeof window.openTrack === "function") {
          window.openTrack(trackId);
        } else if (trackId) {
          console.error("Không tìm thấy hàm window.openTrack()");
        }
      }
    };

    initButtons(id);
  } catch (err) {
    console.error("Lỗi load album:", err);
  }
}

// === Format thời lượng bài hát ===
function formatDuration(seconds) {
  if (!seconds) return "0:00";
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

// === Gắn sự kiện cho nút Play, Save ===
function initButtons(albumId) {
  const playBtn = document.querySelector("#playBtn");
  const toggleLibraryBtn = document.querySelector("#toggleLibraryBtn");

  if (playBtn) {
    playBtn.addEventListener("click", async () => {
      try {
        const resTracks = await api.get(`/api/albums/${albumId}/tracks`);

        const tracks = Array.isArray(resTracks.data.tracks)
          ? resTracks.data.tracks
          : [];

        if (tracks.length === 0) {
          console.warn("Album không có bài hát nào để phát");
          return;
        }

        // Dùng danh sách bài hát của album cho player chung
        window.playlist = tracks;

        // Phát bài đầu tiên bằng player.js
        playTrack(0);
      } catch (err) {
        console.error("Lỗi phát bài hát:", err);
        alert("Không thể phát bài hát này.");
      }
    });
  }

  if (toggleLibraryBtn) {
    toggleLibraryBtn.addEventListener("click", async () => {
      try {
        if (toggleLibraryBtn.textContent.includes("Lưu")) {
          await api.put(`/api/albums/${albumId}/followers`);
          toggleLibraryBtn.textContent = "Xóa khỏi thư viện";
        } else {
          await api.delete(`/api/albums/${albumId}/followers`);
          toggleLibraryBtn.textContent = "Lưu vào thư viện";
        }
      } catch (err) {
        console.error("Lỗi cập nhật thư viện:", err);
      }
    });
  }
}
