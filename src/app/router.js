const BASE_URL = import.meta.env.BASE_URL;

const routes = {
  home: `${BASE_URL}home.html`,
  track: `${BASE_URL}track.html`,
  playlist: `${BASE_URL}playlist.html`,
  artist: `${BASE_URL}artist.html`,
  album: `${BASE_URL}album.html`,
  allalbum: `${BASE_URL}allalbum.html`,
  alltrack: `${BASE_URL}alltrack.html`,
  allartist: `${BASE_URL}allartist.html`,
  allplaylist: `${BASE_URL}allplaylist.html`,
  search: `${BASE_URL}search.html`,
};
let currentPage = null;
let navigationId = 0;

function getPageFromPath(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, "");

  for (const [page, path] of Object.entries(routes)) {
    const routePath = new URL(path, window.location.origin).pathname.replace(
      /\/+$/,
      "",
    );

    if (normalizedPath === routePath) {
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
  const success = await renderPage(page, params, url);

  if (success) {
    history.pushState({ page, params }, "", url.pathname + url.search);
  }
}

async function renderPage(page, params = {}, targetUrl = null) {
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

    if (requestId !== navigationId) return false;

    currentContent.replaceWith(newContent.cloneNode(true));
    currentPage = page;

    document.dispatchEvent(
      new CustomEvent("pagechanged", {
        detail: {
          page,
          params,
          url: targetUrl?.href ?? window.location.href,
        },
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
  const page = event.state?.page || getPageFromPath(window.location.pathname);

  const params = event.state?.params || getParamsFromUrl();

  await renderPage(page, params);
});

export function getCurrentPage() {
  return currentPage;
}

window.goHome = () => {
  navigate("home");
};
