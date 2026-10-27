export function initFooter() {
  const footerContainer = document.querySelector("#footer-container");

  if (!footerContainer || footerContainer.dataset.initialized === "true") {
    return;
  }

  footerContainer.dataset.initialized = "true";

  footerContainer.innerHTML = `
  <footer class="mt-16 border-t border-neutral-800 px-6 py-10 text-sm text-neutral-400">
    <!-- 5 cột nội dung -->
    <div class="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">

      <!-- Cột 1: Công ty -->
      <div>
        <h4 class="mb-4 font-bold text-white">Công ty</h4>
        <ul class="space-y-3">
          <li><a href="https://www.spotify.com/vn-vi/about-us/contact/" class="hover:text-white hover:underline">Giới thiệu</a></li>
          <li><a href="https://www.lifeatspotify.com/" class="hover:text-white hover:underline">Việc làm</a></li>
          <li><a href="https://newsroom.spotify.com/" class="hover:text-white hover:underline">For the Record</a></li>
        </ul>
      </div>

      <!-- Cột 2: Cộng đồng -->
      <div>
        <h4 class="mb-4 font-bold text-white">Cộng đồng</h4>
        <ul class="space-y-3">
          <li><a href="https://artists.spotify.com/" class="hover:text-white hover:underline">Dành cho các Nghệ sĩ</a></li>
          <li><a href="https://creators.spotify.com/" class="hover:text-white hover:underline">Dành cho Nhà sáng tạo</a></li>
          <li><a href="https://authors.spotify.com/" class="hover:text-white hover:underline">Dành cho Tác giả</a></li>
          <li><a href="https://developer.spotify.com/" class="hover:text-white hover:underline">Nhà phát triển</a></li>
          <li><a href="https://ads.spotify.com/" class="hover:text-white hover:underline">Quảng cáo</a></li>
          <li><a href="https://investors.spotify.com/" class="hover:text-white hover:underline">Nhà đầu tư</a></li>
          <li><a href="https://spotifyforvendors.com/" class="hover:text-white hover:underline">Nhà cung cấp</a></li>
        </ul>
      </div>

      <!-- Cột 3: Đường liên kết hữu ích -->
      <div>
        <h4 class="mb-4 font-bold text-white">Đường liên kết hữu ích</h4>
        <ul class="space-y-3">
          <li><a href="https://support.spotify.com/" class="hover:text-white hover:underline">Hỗ trợ</a></li>
          <li><a href="https://www.spotify.com/vn-vi/download/" class="hover:text-white hover:underline">Ứng dụng Di động Miễn phí</a></li>
          <li><a href="https://www.spotify.com/vn-vi/popular-in/vn" class="hover:text-white hover:underline">Phổ biến theo quốc gia</a></li>
          <li><a href="https://open.spotify.com/playlist/37i9dQZF1CLcTo7UzL0sYK" class="hover:text-white hover:underline">Top lời bài hát</a></li>
          <li><a href="https://www.spotify.com/vn-vi/import-music/" class="hover:text-white hover:underline">Thêm nhạc</a></li>
        </ul>
      </div>

      <!-- Cột 4: Các gói -->
      <div>
        <h4 class="mb-4 font-bold text-white">Các gói của Spotify</h4>
        <ul class="space-y-3">
          <li><a href="https://www.spotify.com/vn-vi/premium/#plans" class="hover:text-white hover:underline">Premium Individual</a></li>
          <li><a href="https://www.spotify.com/vn-vi/student/" class="hover:text-white hover:underline">Premium Student</a></li>
          <li><a href="https://www.spotify.com/vn-vi/free/" class="hover:text-white hover:underline">Spotify Free</a></li>
        </ul>
      </div>

      <!-- Cột 5: Mạng xã hội -->
      <div>

        <div class="flex flex-wrap gap-3">
          <!-- Instagram -->
          <a
            href="https://instagram.com/spotify"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
          >
            <i class="fa-brands fa-instagram text-xl"></i>
          </a>

          <!-- X -->
          <a
            href="https://x.com/spotify"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
          >
            <i class="fa-brands fa-x-twitter text-lg"></i>
          </a>

          <!-- Facebook -->
          <a
            href="https://www.facebook.com/Spotify"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
          >
            <i class="fa-brands fa-facebook-f text-lg"></i>
          </a>
        </div>
      </div>

    </div>

    <!-- Đường phân cách -->
    <hr class="my-8 border-neutral-800" />

    <!-- Pháp lý và bản quyền -->
    <div class="flex flex-col justify-between gap-5 text-xs md:flex-row md:items-center">
      <div class="flex flex-wrap gap-x-5 gap-y-3">
        <a href="https://www.spotify.com/vn-vi/legal/" class="hover:text-white">Pháp lý</a>
        <a href="https://www.spotify.com/vn-vi/safetyandprivacy/" class="hover:text-white">Trung tâm an toàn và quyền riêng tư</a>
        <a href="https://www.spotify.com/vn-vi/legal/privacy-policy/" class="hover:text-white">Chính sách quyền riêng tư</a>
        <a href="https://www.spotify.com/vn-vi/legal/cookies-policy/" class="hover:text-white">Cookie</a>
        <a href="https://www.spotify.com/vn-vi/legal/privacy-policy/#s3" class="hover:text-white">Giới thiệu Quảng cáo</a>
        <a href="https://www.spotify.com/vn-vi/accessibility/" class="hover:text-white">Hỗ trợ tiếp cận</a>
      </div>

      <p class="shrink-0">© 2026 Spotify AB</p>
    </div>
  </footer>
`;
}
