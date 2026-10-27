import { api } from "../app/api.js";
import { playTrack } from "../player.js";

export async function initAlbumPage(id) {
  if (!id) {
    console.error("Không tìm thấy ID album");
    return;
  }

  await loadAlbumDetail(id);
}

// === Load chi tiết Album ===
async function loadAlbumDetail(id) {
  try {
    // Lấy thông tin album
    const res = await api.get(`/api/albums/${id}`);
    const album = res.data;

    document.querySelector("#detailImage").src =
      album.cover_image_url || "/src/assets/placeholder.png";
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
        .map((t) => {
          const artistNames = t.artist_name || "Không rõ nghệ sĩ";
          const trackTitle = t.title || "Không rõ tên bài hát";
          const duration = t.duration ? formatDuration(t.duration) : "0:00";

          return `
      <div class="flex items-center justify-between p-2 hover:bg-neutral-800 rounded cursor-pointer"
           onclick="window.openTrack('${t.id}')"
        <div>
          <p class="text-white">${trackTitle}</p>
          <p class="text-gray-400 text-sm">${artistNames}</p>
        </div>
        <span class="text-xs text-gray-400">${duration}</span>
      </div>`;
        })
        .join("");
    }

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
