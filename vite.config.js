
import { defineConfig } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Deploy ở domain gốc: "/"
  // Deploy ở repository GitHub Pages: "/TEN_REPOSITORY/"
  base: "/",

  build: {
    rolldownOptions: {
      input: {
        index: resolve(rootDir, "pages/index.html"),
        home: resolve(rootDir, "pages/home.html"),
        login: resolve(rootDir, "pages/login.html"),
        register: resolve(rootDir, "pages/register.html"),
        album: resolve(rootDir, "pages/album.html"),
        allalbum: resolve(rootDir, "pages/allalbum.html"),
        allartist: resolve(rootDir, "pages/allartist.html"),
        allplaylist: resolve(rootDir, "pages/allplaylist.html"),
        alltrack: resolve(rootDir, "pages/alltrack.html"),
        artist: resolve(rootDir, "pages/artist.html"),
        playlist: resolve(rootDir, "pages/playlist.html"),
        search: resolve(rootDir, "pages/search.html"),
        track: resolve(rootDir, "pages/track.html"),
      },
    },
  },
});
