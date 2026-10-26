
export function initSidebarToggle() {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const openBtn = document.getElementById("openSidebarBtn");

  if (!sidebar || !mainContent || !openBtn) return;

  let isCollapsed = false;

  function setSidebarCollapsed(collapsed) {
    isCollapsed = collapsed;

    sidebar.classList.toggle("hidden", collapsed);
    openBtn.classList.toggle("opacity-0", !collapsed);
    openBtn.classList.toggle("pointer-events-none", !collapsed);

    openBtn.setAttribute("aria-expanded", String(!collapsed));

    // Main tự mở rộng khi sidebar biến mất
    mainContent.classList.toggle("flex-1", true);
  }

  openBtn.addEventListener("click", () => {
    setSidebarCollapsed(false);
  });

  // Nút mũi tên thu gọn trong sidebar
  const toggleBtn = document.getElementById("toggleSidebarBtn");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      setSidebarCollapsed(true);
    });
  }

  // Chỉ hiện nút khi rê chuột vào mép trái
  document.addEventListener("mousemove", (event) => {
    if (!isCollapsed) return;

    if (event.clientX <= 12) {
      openBtn.classList.remove("opacity-0", "pointer-events-none");
    } else if (!openBtn.matches(":hover")) {
      openBtn.classList.add("opacity-0", "pointer-events-none");
    }
  });
}
