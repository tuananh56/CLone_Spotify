(function () {
  let e = document.createElement(`link`).relList;
  if (e && e.supports && e.supports(`modulepreload`)) return;
  for (let e of document.querySelectorAll(`link[rel="modulepreload"]`)) n(e);
  new MutationObserver((e) => {
    for (let t of e)
      if (t.type === `childList`)
        for (let e of t.addedNodes)
          e.tagName === `LINK` && e.rel === `modulepreload` && n(e);
  }).observe(document, { childList: !0, subtree: !0 });
  function t(e) {
    let t = {};
    return (
      e.integrity && (t.integrity = e.integrity),
      e.referrerPolicy && (t.referrerPolicy = e.referrerPolicy),
      (t.credentials =
        e.crossOrigin === `use-credentials`
          ? `include`
          : e.crossOrigin === `anonymous`
            ? `omit`
            : `same-origin`),
      t
    );
  }
  function n(e) {
    if (e.ep) return;
    e.ep = !0;
    let n = t(e);
    fetch(e.href, n);
  }
})();
var e = `/CLone_Spotify/`,
  t = {
    home: `${e}home.html`,
    track: `${e}track.html`,
    playlist: `${e}playlist.html`,
    artist: `${e}artist.html`,
    album: `${e}album.html`,
    allalbum: `${e}allalbum.html`,
    alltrack: `${e}alltrack.html`,
    allartist: `${e}allartist.html`,
    allplaylist: `${e}allplaylist.html`,
    search: `${e}search.html`,
  },
  n = 0;
function r(e) {
  let n = e.replace(/\/+$/, ``);
  for (let [e, r] of Object.entries(t))
    if (n === new URL(r, window.location.origin).pathname.replace(/\/+$/, ``))
      return e;
  return `home`;
}
function i() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}
function a(e, n = {}) {
  let r = new URL(t[e], window.location.origin);
  return (
    Object.entries(n).forEach(([e, t]) => {
      t != null && r.searchParams.set(e, String(t));
    }),
    r
  );
}
async function o(e, n = {}) {
  if (!t[e]) {
    console.error(`Không tìm thấy trang: ${e}`);
    return;
  }
  let r = a(e, n);
  (await s(e, n, r)) &&
    history.pushState({ page: e, params: n }, ``, r.pathname + r.search);
}
async function s(e, r = {}, i = null) {
  let a = t[e];
  if (!a) return !1;
  let o = ++n;
  try {
    let t = await fetch(a);
    if (!t.ok) throw Error(`Không tải được trang: ${a}`);
    let s = await t.text(),
      c = new DOMParser()
        .parseFromString(s, `text/html`)
        .querySelector(`#page-content`),
      l = document.querySelector(`#page-content`);
    if (!c || !l)
      throw Error(
        `Không tìm thấy #page-content trong trang hiện tại hoặc trang đích.`,
      );
    return (
      o === n &&
      (l.replaceWith(c.cloneNode(!0)),
      document.dispatchEvent(
        new CustomEvent(`pagechanged`, {
          detail: { page: e, params: r, url: i?.href ?? window.location.href },
        }),
      ),
      !0)
    );
  } catch (e) {
    return (o === n && console.error(`Lỗi chuyển trang:`, e), !1);
  }
}
(window.addEventListener(`popstate`, async (e) => {
  await s(e.state?.page || r(window.location.pathname), e.state?.params || i());
}),
  (window.goHome = () => {
    o(`home`);
  }));
export { o as t };
