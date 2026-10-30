// The demo of @quantum-ds/shadcn-theme: every shadcn/ui component of src/components/ui/ (fetched from
// the shadcn registry by scripts/fetch-ui.mjs, unmodified) on the generated Quantum theme
// (../dist/quantum.css). build.mjs writes the theme, then runs `vite build` with this config,
// which inlines every script and stylesheet into ../dist/demo.html.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { viteSingleFile } from "vite-plugin-singlefile"

const here = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(here, "../dist")

/** Vite writes index.html; the package publishes it as demo.html. */
function renameToDemo(): Plugin {
  return {
    name: "quantum-demo-html",
    apply: "build",
    closeBundle() {
      const from = path.join(outDir, "index.html")
      if (fs.existsSync(from)) fs.renameSync(from, path.join(outDir, "demo.html"))
    },
  }
}

export default defineConfig({
  root: here,
  base: "./",
  plugins: [react(), tailwindcss(), viteSingleFile(), renameToDemo()],
  resolve: { alias: { "@": path.resolve(here, "src") } },
  build: { outDir, emptyOutDir: false, reportCompressedSize: false, chunkSizeWarningLimit: 4096 },
})
