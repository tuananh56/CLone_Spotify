import { api } from "../app/api.js";

const params = new URLSearchParams(window.location.search);
const albumId = params.get("id");

if (albumId) {
  loadAlbumDetail(albumId);
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
    console.log("Tracks response:", resTracks.data);

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
           onclick="window.location.href='/track.html?id=${t.id}'">
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

        // Lấy URL nhạc thật từ track đầu tiên
        const firstTrack = tracks[0];
        const audioUrl = firstTrack.audio_url; // backend cần trả về trường này

        if (!audioUrl) {
          console.error("Track không có audio_url");
          return;
        }

        let player = document.querySelector("#player");
        if (!player) {
          player = document.createElement("audio");
          player.id = "player";
          document.body.appendChild(player);
        }

        player.src = audioUrl;
        await player.play();
        console.log("Đang phát bài đầu tiên:", firstTrack.title);
      } catch (err) {
        console.error("Lỗi phát bài hát:", err);
        alert("Không thể phát bài hát này.");
      }
    });
  }

  if (toggleLibraryBtn) {
    toggleLibraryBtn.addEventListener("click", async () => {
      if (toggleLibraryBtn.textContent.includes("Lưu")) {
        await api.put(`/api/albums/${albumId}/followers`);
        toggleLibraryBtn.textContent = "Xóa khỏi thư viện";
      } else {
        await api.delete(`/api/albums/${albumId}/followers`);
        toggleLibraryBtn.textContent = "Lưu vào thư viện";
      }
    });
  }
}
