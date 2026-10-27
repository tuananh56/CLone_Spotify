
import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "/",

  build: {
    rolldownOptions: {
      input: {
        index: resolve(import.meta.dirname, "pages/index.html"),
        home: resolve(import.meta.dirname, "pages/home.html"),
        login: resolve(import.meta.dirname, "pages/login.html"),
        register: resolve(import.meta.dirname, "pages/register.html"),
        album: resolve(import.meta.dirname, "pages/album.html"),
        allalbum: resolve(import.meta.dirname, "pages/allalbum.html"),
        allartist: resolve(import.meta.dirname, "pages/allartist.html"),
        allplaylist: resolve(import.meta.dirname, "pages/allplaylist.html"),
        alltrack: resolve(import.meta.dirname, "pages/alltrack.html"),
        artist: resolve(import.meta.dirname, "pages/artist.html"),
        playlist: resolve(import.meta.dirname, "pages/playlist.html"),
        search: resolve(import.meta.dirname, "pages/search.html"),
        track: resolve(import.meta.dirname, "pages/track.html"),
      },
    },
  },
});
