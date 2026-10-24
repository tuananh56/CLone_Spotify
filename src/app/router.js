const routes = {
  home: "/home.html",
  track: "/track.html",
  playlist: "/playlist.html",
  artist: "/artist.html",
  album: "/album.html",
};

let currentPage = null;
let navigationId = 0;

function getPageFromPath(pathname) {
  for (const [page, path] of Object.entries(routes)) {
    if (pathname.endsWith(path)) {
      return page;
    }
  }

  return "home";
}

function getParamsFromUrl() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

function buildUrl(page, params = {}) {
  const url = new URL(routes[page], window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

export async function navigate(page, params = {}) {
  if (!routes[page]) {
    console.error(`Không tìm thấy trang: ${page}`);
    return;
  }

  const url = buildUrl(page, params);
  const success = await renderPage(page, params);

  if (success) {
    history.pushState({ page, params }, "", url);
  }
}

async function renderPage(page, params = {}) {
  const path = routes[page];

  if (!path) return false;

  const requestId = ++navigationId;

  try {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`Không tải được trang: ${path}`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    const newContent = doc.querySelector("#page-content");
    const currentContent = document.querySelector("#page-content");

    if (!newContent || !currentContent) {
      throw new Error(
        "Không tìm thấy #page-content trong trang hiện tại hoặc trang đích.",
      );
    }

    // Bỏ qua phản hồi cũ.
    if (requestId !== navigationId) return false;

    currentContent.replaceWith(newContent.cloneNode(true));

    currentPage = page;

    document.dispatchEvent(
      new CustomEvent("pagechanged", {
        detail: { page, params },
      }),
    );

    return true;
  } catch (error) {
    if (requestId === navigationId) {
      console.error("Lỗi chuyển trang:", error);
    }

    return false;
  }
}

window.addEventListener("popstate", async (event) => {
  const page = event.state?.page || getPageFromPath(location.pathname);

  const params = event.state?.params || getParamsFromUrl();

  await renderPage(page, params);
});

export function getCurrentPage() {
  return currentPage;
}
