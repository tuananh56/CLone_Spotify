export function initSidebarToggle() {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const openBtn = document.getElementById("openSidebarBtn");
  const toggleBtn = document.getElementById("toggleSidebarBtn");

  if (!sidebar || !openBtn || !toggleBtn) {
    console.warn("Không tìm thấy phần tử sidebar:", {
      sidebar: !!sidebar,
      mainContent: !!mainContent,
      openBtn: !!openBtn,
      toggleBtn: !!toggleBtn,
    });
    return;
  }

  // Tránh đăng ký sự kiện nhiều lần
  if (sidebar.dataset.toggleInitialized === "true") return;
  sidebar.dataset.toggleInitialized = "true";

  let isCollapsed = sidebar.classList.contains("hidden");

  function setSidebarCollapsed(collapsed) {
    isCollapsed = collapsed;

    sidebar.classList.toggle("hidden", collapsed);

    openBtn.classList.toggle("opacity-0", !collapsed);
    openBtn.classList.toggle("pointer-events-none", !collapsed);

    openBtn.setAttribute("aria-expanded", String(!collapsed));
    toggleBtn.setAttribute("aria-expanded", String(!collapsed));

    if (mainContent) {
      mainContent.classList.add("flex-1");
    }
  }

  toggleBtn.addEventListener("click", () => {
    setSidebarCollapsed(true);
  });

  openBtn.addEventListener("click", () => {
    setSidebarCollapsed(false);
  });

  document.addEventListener("mousemove", (event) => {
    if (!isCollapsed) return;

    if (event.clientX <= 12) {
      openBtn.classList.remove("opacity-0", "pointer-events-none");
    } else if (!openBtn.matches(":hover")) {
      openBtn.classList.add("opacity-0", "pointer-events-none");
    }
  });

  setSidebarCollapsed(isCollapsed);
}
