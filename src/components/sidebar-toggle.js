let sidebarToggleInitialized = false;
let isCollapsed = false;
let stateInitialized = false;

export function initSidebarToggle() {
  // Chỉ đăng ký sự kiện một lần
  if (sidebarToggleInitialized) return;
  sidebarToggleInitialized = true;

  function setSidebarCollapsed(collapsed) {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("mainContent");
    const openBtn = document.getElementById("openSidebarBtn");
    const toggleBtn = document.getElementById("toggleSidebarBtn");

    if (!sidebar || !openBtn || !toggleBtn) return;

    isCollapsed = collapsed;
    stateInitialized = true;

    sidebar.classList.toggle("hidden", collapsed);

    openBtn.classList.toggle("opacity-0", !collapsed);
    openBtn.classList.toggle("pointer-events-none", !collapsed);

    openBtn.setAttribute("aria-expanded", String(!collapsed));
    toggleBtn.setAttribute("aria-expanded", String(!collapsed));

    if (mainContent) {
      mainContent.classList.add("flex-1");
    }
  }

  // Lấy trạng thái ban đầu nếu sidebar đã tồn tại
  function initializeState() {
    const sidebar = document.getElementById("sidebar");

    if (!sidebar || stateInitialized) return;

    isCollapsed = sidebar.classList.contains("hidden");
    stateInitialized = true;
  }

  // Bắt sự kiện click trên document
  document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) return;

    initializeState();

    if (target.closest("#toggleSidebarBtn")) {
      setSidebarCollapsed(true);
      return;
    }

    if (target.closest("#openSidebarBtn")) {
      setSidebarCollapsed(false);
    }
  });

  // Hiện nút mở sidebar khi rê chuột sát mép trái
  document.addEventListener("mousemove", (event) => {
    initializeState();

    if (!isCollapsed) return;

    const openBtn = document.getElementById("openSidebarBtn");
    if (!openBtn) return;

    if (event.clientX <= 12) {
      openBtn.classList.remove("opacity-0", "pointer-events-none");
    } else if (!openBtn.matches(":hover")) {
      openBtn.classList.add("opacity-0", "pointer-events-none");
    }
  });

  initializeState();

  if (stateInitialized) {
    setSidebarCollapsed(isCollapsed);
  }
}
