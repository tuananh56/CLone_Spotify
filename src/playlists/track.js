import { playTrack } from "../player.js";
import { api } from "../app/api.js";

let currentRequestId = 0;

export async function initTrackPage(id) {
  if (!id) {
    console.error("Không tìm thấy ID bài hát trong URL");
    return;
  }

  const requestId = ++currentRequestId;

  try {
    const res = await api.get(`/api/tracks/${encodeURIComponent(id)}`);
    const track = res.data;

    // Bỏ qua kết quả cũ nếu người dùng đã chuyển sang bài khác.
    if (requestId !== currentRequestId) return;

    if (!track) {
      console.error("Không tìm thấy dữ liệu bài hát");
      return;
    }

    setText("trackTitleHeader", track.title);
    setText("trackArtistHeader", track.artist_name);
    setText("trackAlbum", track.album_title);
    setText("trackDuration", formatDuration(track.duration));

    const image = document.getElementById("trackImageHeader");
    if (image) {
      image.src = track.image_url || "..`${import.meta.env.BASE_URL}playlist.png`";
    }

    // Cập nhật playlist dùng chung, không tạo audio mới.
    window.playlist = [
      {
        id: track.id,
        title: track.title,
        artist: track.artist_name,
        album: track.album_title,
        duration: track.duration,
        image_url: track.image_url,
        audio_url: track.audio_url,
      },
    ];

    // Nếu player đã được tải, cập nhật giao diện ngay.
    updateTrackPlayerUI(track);

    // Nếu player được tải sau, cập nhật khi nó sẵn sàng.
    if (!document.getElementById("trackTitlePlayer")) {
      document.addEventListener(
        "playerloaded",
        () => updateTrackPlayerUI(track),
        { once: true },
      );
    }

    const playBtn = document.getElementById("btnPlayTrack");

    if (playBtn && !playBtn.dataset.initialized) {
      playBtn.dataset.initialized = "true";

      playBtn.addEventListener("click", () => {
        playTrack(0);
      });
    }
  } catch (err) {
    if (requestId === currentRequestId) {
      console.error("Lỗi load track:", err);
    }
  }
}

function updateTrackPlayerUI(track) {
  setText("trackTitlePlayer", track.title);
  setText("trackArtistPlayer", track.artist_name);

  const image = document.getElementById("trackImagePlayer");
  if (image) {
    image.src = track.image_url || "..`${import.meta.env.BASE_URL}playlist.png`";
  }
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value ?? "";
}

function formatDuration(seconds) {
  const value = Number(seconds);

  if (!Number.isFinite(value) || value < 0) return "0:00";

  const min = Math.floor(value / 60);
  const sec = Math.floor(value % 60);

  return `${min}:${String(sec).padStart(2, "0")}`;
}
