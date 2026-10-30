import { defineConfig } from "vite";
import { resolve } from "node:path";

const pages = [
  "index",
  "home",
  "track",
  "artist",
  "album",
  "playlist",
  "alltrack",
  "allalbum",
  "allartist",
  "allplaylist",
  "search",
  "login",
  "register",
  "player",
  "admin-dashboard",
];

export default defineConfig({
  base: "/CLone_Spotify/",

  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((page) => [page, resolve(process.cwd(), `${page}.html`)]),
      ),
    },
  },
});
