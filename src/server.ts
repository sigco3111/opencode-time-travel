// ── opencode-time-travel: Server Plugin ──
// Self-contained — opencode loads single-file plugins only
// No relative imports allowed
//
// Combines:
//   - Agent event collection (from omo-olympus pattern)
//   - Timeline recording (NEW)
//   - Model detection (NEW)
//   - Persona queue (from omo-olympus pattern)
//   - Mode detection (from omo-olympus pattern)

import type { Plugin } from "@opencode-ai/plugin"

// ── Constants ──

const PENDING_FILE = "/tmp/omo-pending.json"
const MODE_FILE = "/tmp/omo-mode.json"
const TIMELINE_FILE = "/tmp/time-travel-timeline.json"
const MODELS_FILE = "/tmp/time-travel-models.json"

const DEDUP_MS = 200
const MAX_TIMELINE_ENTRIES = 200

const fs = require("fs")

// ── Types ──

const AGENT_KEYS = [
  "build",
  "build-jr",
  "explore",
  "librarian",
  "oracle",
  "metis",
  "momus",
  "prometheus",
] as const

type AgentKey = (typeof AGENT_KEYS)[number]

interface PendingEntry {
  agent: string
  ts: number
  done?: boolean
}

interface TimelineEntry {
  ts: number
  agent: string
  sessionId: string
  event: "tool_call" | "tool_result" | "file_edit" | "session_start" | "session_done" | "session_error"
  tool?: string
  detail?: string | null
  model?: string
}

interface ModelEntry {
  agent: string
  model: string
  startedAt: number
}

// ── File IPC Helpers ──

function readJson<T>(path: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(path, "utf-8")) as T
  } catch {
    return fallback
  }
}

function writeJson(path: string, data: any): void {
  try {
    fs.writeFileSync(path, JSON.stringify(data))
  } catch {
    // ignore write errors
  }
}

// ── Pending Queue (Persona Activation) ──

function readPending(): PendingEntry[] {
  return readJson<PendingEntry[]>(PENDING_FILE, [])
}

function writePending(list: PendingEntry[]): void {
  writeJson(PENDING_FILE, list)
}

// ── Timeline Recording ──

function readTimeline(): TimelineEntry[] {
  const data = readJson<{ entries: TimelineEntry[] }>(TIMELINE_FILE, { entries: [] })
  return data.entries ?? []
}

function writeTimeline(entries: TimelineEntry[]): void {
  // Keep only the last MAX_TIMELINE_ENTRIES
  const trimmed = entries.slice(-MAX_TIMELINE_ENTRIES)
  writeJson(TIMELINE_FILE, { entries: trimmed })
}

function recordTimeline(entry: TimelineEntry): void {
  const entries = readTimeline()
  entries.push(entry)
  writeTimeline(entries)
}

// ── Model Cache ──

function readModels(): Record<string, ModelEntry> {
  return readJson<Record<string, ModelEntry>>(MODELS_FILE, {})
}

function writeModels(data: Record<string, ModelEntry>): void {
  writeJson(MODELS_FILE, data)
}

function cacheModel(sessionId: string, agent: string, model: string): void {
  const models = readModels()
  models[sessionId] = { agent, model, startedAt: Date.now() }
  writeModels(models)
}

function getModelForSession(sessionId: string): string | undefined {
  const models = readModels()
  return models[sessionId]?.model
}

// ── Cleanup on Session Delete ──

function cleanupSession(sessionId: string): void {
  const models = readModels()
  if (models[sessionId]) {
    delete models[sessionId]
    writeModels(models)
  }
}

// ── Agent Inference ──
// Order: subagent_type → description/prompt keywords → category → default

function inferAgent(tool: string, args: any): AgentKey | null {
  if (tool !== "task" && tool !== "delegate_task") return null

  // 1. Direct subagent_type check
  const sub = String(args?.subagent_type ?? "").toLowerCase()
  if (sub === "explore") return "explore"
  if (sub === "oracle") return "oracle"
  if (sub === "librarian") return "librarian"
  if (sub === "metis" || sub.includes("metis")) return "metis"
  if (sub === "momus" || sub.includes("momus")) return "momus"
  if (sub === "prometheus" || sub.includes("prometheus")) return "prometheus"

  // 2. Description/prompt keyword matching
  const desc = String(args?.description ?? args?.prompt ?? "").toLowerCase()
  if (desc.includes("explore") || desc.includes("find") || desc.includes("search")) return "explore"
  if (desc.includes("oracle") || desc.includes("consult") || desc.includes("architect")) return "oracle"
  if (desc.includes("librarian") || desc.includes("docs") || desc.includes("reference")) return "librarian"
  if (desc.includes("metis") || desc.includes("plan") || desc.includes("analyze")) return "metis"
  if (desc.includes("momus") || desc.includes("review") || desc.includes("critic")) return "momus"
  if (desc.includes("prometheus")) return "prometheus"

  // 3. Category matching
  const cat = String(args?.category ?? "").toLowerCase()
  if (cat === "ultrabrain") return "oracle"
  if (cat === "visual-engineering") return "build"
  if (cat === "deep") return "oracle"
  if (cat === "quick") return "build"
  if (cat === "artistry") return "build"
  if (cat === "writing") return "build"
  if (cat.startsWith("unspecified")) return "build"

  // 4. Default: build (Sisyphus)
  return "build"
}

// ── Model Detection ──
// Extracts model name from system prompt patterns and metadata

function detectModelFromSystem(system: string): string | null {
  const providerMatch = system.match(
    /(?:anthropic|openai|google|meta|mistral|zai[a-z0-9\-]*)\/([a-z0-9\-]+)/i
  )
  if (providerMatch) return providerMatch[0].trim()

  const namedMatch = system.match(
    /You are powered by the model named ([a-z0-9\/\-]+)/i
  )
  if (namedMatch) return namedMatch[1].trim()

  const modelPatterns = [
    /claude[\- ]?(sonnet|opus|haiku)[\- ]?(\d+\.?\d*)?/i,
    /gemini[\- ]?(\d+\.?\d*)?[\- ]?(pro|flash)?/i,
    /gpt[\- ]?(\d+\.?\d*)?[\- ]?(turbo|mini)?/i,
  ]
  for (const pattern of modelPatterns) {
    const match = system.match(pattern)
    if (match) return match[0].trim()
  }
  return null
}

// ── Mode Detection ──

let lastMode = ""

function detectAndWriteMode(system: string): void {
  let mode = "build"
  if (
    system.includes('You are "Prometheus"') ||
    system.includes("You are Prometheus")
  ) {
    mode = "prometheus"
  } else if (
    system.includes('role="Prometheus"') ||
    system.includes("Prometheus (Plan Builder)")
  ) {
    if (
      !system.includes('You are "Sisyphus"') &&
      !system.includes("You are Sisyphus")
    ) {
      mode = "prometheus"
    }
  }

  if (mode !== lastMode) {
    lastMode = mode
    writeJson(MODE_FILE, { mode, ts: Date.now() })
  }
}

// ── Session → Agent Mapping (in-memory) ──

const sessionAgentMap = new Map<string, AgentKey>()

// ── Plugin ──

const TimeTravelServer: Plugin = async () => {
  return {
    // ── Tool execution hooks ──

    "tool.execute.before": async (_input: any, output: any) => {
      const tool = _input?.tool ?? ""
      const args = output?.args ?? {}
      const agent = inferAgent(tool, args)
      if (!agent) return

      const now = Date.now()
      const pending = readPending()

      // Dedup: skip if same agent within DEDUP_MS
      const last = pending[pending.length - 1]
      if (last && last.agent === agent && now - last.ts < DEDUP_MS) return

      pending.push({ agent, ts: now })
      writePending(pending)

      // Detect Sisyphus-Jr from category + run_in_background pattern
      const isBackground = args?.run_in_background === true
      const effectiveAgent: AgentKey =
        isBackground && agent === "build" ? "build-jr" : agent

      // Record timeline: tool_call
      const toolName = args?.tool_name ?? args?.command ?? ""
      const detail = args?.description ?? args?.prompt ?? ""
      const shortDetail =
        typeof detail === "string"
          ? detail.slice(0, 120)
          : ""

      recordTimeline({
        ts: now,
        agent: effectiveAgent,
        sessionId: "",
        event: "tool_call",
        tool: toolName || tool,
        detail: shortDetail || null,
        model: undefined,
      })
    },

    "tool.execute.after": async (input: any, _output: any) => {
      if (input.tool !== "task" && input.tool !== "delegate_task") return

      const now = Date.now()
      const pending = readPending()
      pending.push({ agent: "__done__", ts: now, done: true })
      writePending(pending)

      // Try to extract model from response metadata
      const modelFromMeta = _output?.response?.model ?? _output?.model ?? null
      if (modelFromMeta) {
        const agent = inferAgent(input.tool, input)
        if (agent) {
          const sessionId = input?.sessionID ?? ""
          if (sessionId) {
            cacheModel(sessionId, agent, String(modelFromMeta))
          }
        }
      }

      // Record timeline: tool_result
      recordTimeline({
        ts: now,
        agent: "__done__",
        sessionId: "",
        event: "tool_result",
        detail: null,
        model: modelFromMeta ? String(modelFromMeta) : undefined,
      })
    },

    // ── Command hooks ──

    "command.execute.before": async (input: any, _output: any) => {
      const cmd = String(input.command ?? "").toLowerCase()
      const now = Date.now()

      if (
        cmd.includes("plan") ||
        cmd.includes("omc-plan") ||
        cmd.includes("prometheus")
      ) {
        const pending = readPending()
        const last = pending[pending.length - 1]
        if (last && last.agent === "prometheus" && now - last.ts < DEDUP_MS)
          return
        pending.push({ agent: "prometheus", ts: now })
        writePending(pending)

        recordTimeline({
          ts: now,
          agent: "prometheus",
          sessionId: "",
          event: "tool_call",
          tool: "command",
          detail: cmd.slice(0, 80),
        })
      } else if (cmd.includes("start-work")) {
        const pending = readPending()
        pending.push({ agent: "build", ts: now })
        writePending(pending)

        recordTimeline({
          ts: now,
          agent: "build",
          sessionId: "",
          event: "tool_call",
          tool: "command",
          detail: cmd.slice(0, 80),
        })
      }
    },

    // ── System prompt → model + mode detection ──

    "experimental.chat.system.transform": async (
      _input: any,
      output: any
    ) => {
      const system = Array.isArray(output.system)
        ? output.system.join(" ")
        : String(output.system ?? "")

      // Mode detection
      detectAndWriteMode(system)

      // Model detection
      const model = detectModelFromSystem(system)
      if (model) {
        const sessionId = output?.sessionID ?? "main"
        const mappedAgent = sessionAgentMap.get(sessionId)
        const currentMode = readJson<{ mode: string }>(MODE_FILE, { mode: "build" })
        cacheModel(sessionId, mappedAgent ?? currentMode.mode, model)
      }
    },

    // ── Session lifecycle ──

    "session.created": async (event: any) => {
      const info = event.properties?.info
      if (info?.parentID) {
        const agentName = (() => {
          const pending = readPending()
          while (pending.length > 0) {
            const entry = pending.shift()!
            if (entry.agent === "__done__") continue
            writePending(pending)
            return entry.agent
          }
          writePending(pending)
          return null
        })()

        const key: AgentKey =
          agentName && (AGENT_KEYS as readonly string[]).includes(agentName)
            ? (agentName as AgentKey)
            : "build"

        sessionAgentMap.set(info.id, key)

        const parentModel = getModelForSession(info.parentID)
        if (parentModel) {
          cacheModel(info.id, key, parentModel)
        }

        recordTimeline({
          ts: Date.now(),
          agent: key,
          sessionId: info.id,
          event: "session_start",
          detail: null,
        })
      }
    },

    "session.status": async (event: any) => {
      const sessionId = event.properties?.sessionID
      const status = event.properties?.status?.type

      if (status === "idle") {
        const key = sessionAgentMap.get(sessionId ?? "")
        if (key) {
          recordTimeline({
            ts: Date.now(),
            agent: key,
            sessionId: sessionId ?? "",
            event: "session_done",
            detail: null,
            model: getModelForSession(sessionId ?? ""),
          })
        }
      }
    },

    "session.error": async (event: any) => {
      const sessionId = event.properties?.sessionID
      const key = sessionAgentMap.get(sessionId ?? "")

      if (key) {
        recordTimeline({
          ts: Date.now(),
          agent: key,
          sessionId: sessionId ?? "",
          event: "session_error",
          detail: null,
          model: getModelForSession(sessionId ?? ""),
        })
      }
    },

    "session.deleted": async (event: any) => {
      const sessionId =
        event.properties?.sessionID ?? event.properties?.id ?? ""
      if (sessionId) {
        const key = sessionAgentMap.get(sessionId)
        sessionAgentMap.delete(sessionId)
        cleanupSession(sessionId)
      }
    },

    // ── File edit tracking ──

    "file.edited": async (event: any) => {
      const filePath =
        event.properties?.path ?? event.properties?.filePath ?? ""
      if (!filePath) return

      // Find the most recent active session to attribute the edit
      let agent: AgentKey = "build"
      const mode = readJson<{ mode: string }>(MODE_FILE, { mode: "build" })
      if (mode.mode === "prometheus") agent = "prometheus"

      recordTimeline({
        ts: Date.now(),
        agent,
        sessionId: "",
        event: "file_edit",
        detail: filePath,
      })
    },
  }
}

export default TimeTravelServer
