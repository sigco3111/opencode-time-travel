import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "../..")
const PLUGIN_FILES = ["src/server.ts", "src/tui.tsx"]
const RELATIVE_IMPORT_RE = /^\s*import\s+.*\s+from\s+["']\.\.?\/(?!node_modules)/

describe("plugin constraints", () => {
  for (const file of PLUGIN_FILES) {
    describe(file, () => {
      it("must exist", () => {
        expect(fs.existsSync(path.join(ROOT, file))).toBe(true)
      })

      it("must not contain relative imports", () => {
        const content = fs.readFileSync(path.join(ROOT, file), "utf-8")
        const violations = content
          .split("\n")
          .filter(
            (line) =>
              RELATIVE_IMPORT_RE.test(line) &&
              !line.trimStart().startsWith("///")
          )

        expect(violations).toHaveLength(0)
      })

      it("must have a default export", () => {
        const content = fs.readFileSync(path.join(ROOT, file), "utf-8")
        expect(content).toContain("export default")
      })

      it("server.ts must export a Plugin function", () => {
        if (!file.includes("server")) return
        const content = fs.readFileSync(path.join(ROOT, file), "utf-8")
        expect(content).toMatch(/:\s*Plugin\s*=/)
      })

      it("tui.tsx must have JSX pragma", () => {
        if (!file.includes("tui")) return
        const content = fs.readFileSync(path.join(ROOT, file), "utf-8")
        expect(content).toContain("@jsxImportSource @opentui/solid")
      })

      it("tui.tsx must export plugin with id", () => {
        if (!file.includes("tui")) return
        const content = fs.readFileSync(path.join(ROOT, file), "utf-8")
        expect(content).toMatch(/id:\s*["']opencode-time-travel["']/)
      })

      it("must use require('fs') not import fs", () => {
        const content = fs.readFileSync(path.join(ROOT, file), "utf-8")
        const esmFsImport = content.match(/import\s+.*\s+from\s+["']fs["']/)
        expect(esmFsImport).toBeNull()
      })
    })
  }
})

describe("i18n coverage", () => {
  it("tui.tsx has both en and ko locales", () => {
    const content = fs.readFileSync(
      path.join(ROOT, "src/tui.tsx"),
      "utf-8"
    )
    expect(content).toMatch(/\ben\b/)
    expect(content).toMatch(/\bko\b/)
    expect(content).toContain("personasByLocale")
  })

  it("all 8 agent personas exist in both locales", () => {
    const content = fs.readFileSync(
      path.join(ROOT, "src/tui.tsx"),
      "utf-8"
    )
    const agents = [
      "build",
      "build-jr",
      "explore",
      "librarian",
      "oracle",
      "metis",
      "momus",
      "prometheus",
    ]
    for (const agent of agents) {
      expect(content).toContain(agent)
    }
  })
})

describe("package.json", () => {
  it("has correct exports", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(ROOT, "package.json"), "utf-8")
    )
    expect(pkg.exports["./server"]).toBe("./src/server.ts")
    expect(pkg.exports["./tui"]).toBe("./src/tui.tsx")
  })

  it("has peerDependencies for opencode plugin", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(ROOT, "package.json"), "utf-8")
    )
    expect(pkg.peerDependencies["@opencode-ai/plugin"]).toBeDefined()
  })
})
