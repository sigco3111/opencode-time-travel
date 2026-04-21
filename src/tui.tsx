/** @jsxImportSource @opentui/solid */
import { createSignal } from "solid-js"
import type {
  TuiPlugin,
  TuiPluginModule,
  TuiSlotContext,
} from "@opencode-ai/plugin/tui"

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

const _fs = require("fs")

const PENDING_FILE = "/tmp/omo-pending.json"
const MODE_FILE = "/tmp/omo-mode.json"
const TIMELINE_FILE = "/tmp/time-travel-timeline.json"
const MODELS_FILE = "/tmp/time-travel-models.json"

const NAME_WIDTH = 11

interface PendingEntry { agent: string; ts: number }

function readJson<T>(path: string, fallback: T): T {
  try { return JSON.parse(_fs.readFileSync(path, "utf-8")) as T } catch { return fallback }
}

function readMode(): "prometheus" | "build" {
  const data = readJson<{ mode: string }>(MODE_FILE, { mode: "build" })
  return data.mode === "prometheus" ? "prometheus" : "build"
}

function readPending(): PendingEntry[] {
  return readJson<PendingEntry[]>(PENDING_FILE, [])
}

function writePending(list: PendingEntry[]) {
  try { _fs.writeFileSync(PENDING_FILE, JSON.stringify(list)) } catch {}
}

function popPending(): string | null {
  const list = readPending()
  while (list.length > 0) {
    const entry = list.shift()!
    if (entry.agent === "__done__") continue
    writePending(list)
    return entry.agent
  }
  writePending(list)
  return null
}

interface TimelineEntry {
  ts: number
  agent: string
  sessionId: string
  event: string
  tool?: string
  detail?: string | null
  model?: string
}

function readTimeline(): TimelineEntry[] {
  const data = readJson<{ entries: TimelineEntry[] }>(TIMELINE_FILE, { entries: [] })
  return data.entries ?? []
}

function readModels(): Record<string, { agent: string; model: string; startedAt: number }> {
  return readJson(MODELS_FILE, {})
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`
}

function shortenModel(model: string): string {
  return model.replace(/^[^/]+\//, "").replace(/-\d{8}$/, "")
}

// ── i18n (inlined — single-file plugin constraint) ──

const i18n: Record<string, Record<string, string>> = {
  en: {
    olympus: "opencode-time-travel",
    timeline: "Timeline",
    active: "active",
    done: "done",
    error: "error",
    agents: "agents",
    busy: "[busy]",
    doneLabel: "[done]",
    errorLabel: "[error]",
    sleeping: "💤",
    check: "✓",
    toolIcons: "🔧",
    fileIcon: "📄",
    editIcon: "✏️",
    separator: "───────────────────────",
  },
  ko: {
    olympus: "opencode-time-travel",
    timeline: "Timeline",
    active: "active",
    done: "done",
    error: "error",
    agents: "agents",
    busy: "[busy]",
    doneLabel: "[done]",
    errorLabel: "[error]",
    sleeping: "💤",
    check: "✓",
    toolIcons: "🔧",
    fileIcon: "📄",
    editIcon: "✏️",
    separator: "───────────────────────",
  },
}

// ── Personas (inlined — both en/ko) ──

interface Persona {
  name: string
  emoji: string
  speech: Record<string, string[]>
}

const personasByLocale: Record<string, Record<AgentKey, Persona>> = {
  en: {
    build: {
      name: "Sisyphus", emoji: "🪨",
      speech: {
        start: ["The boulder rolls again", "One more push", "Back at it", "Let's go", "Another day, another rock"],
        working: ["Pushing uphill...", "Almost there...", "Won't stop now", "Grinding away...", "Step by step..."],
        done: ["Summit reached ✓", "Done. Again.", "The rock holds", "Delivered", "One more behind me"],
        error: ["It rolled back...", "Not this time", "The hill wins today"],
      },
    },
    "build-jr": {
      name: "Sisyphus-Jr", emoji: "🧗",
      speech: {
        start: ["On it, boss!", "Small boulder, big dreams", "Climbing time", "Ready to push!"],
        working: ["Scaling the wall...", "Almost there...", "Halfway up...", "Pushing my pebble..."],
        done: ["Pebble delivered ✓", "Done!", "Top reached!", "That was lighter"],
        error: ["Slipped...", "My pebble rolled back", "Need a bigger push"],
      },
    },
    explore: {
      name: "Explorer", emoji: "🔍",
      speech: {
        start: ["On the trail!", "Scouting ahead", "I smell a clue", "Off I go!", "Let me dig around"],
        working: ["Following a lead...", "Checking every corner", "Almost got it...", "Digging deeper...", "Traces everywhere..."],
        done: ["Found it!", "Case closed", "Right here!", "Mystery solved", "Spotted!"],
        error: ["Trail went cold", "Dead end", "Lost the scent", "Nothing here..."],
      },
    },
    librarian: {
      name: "Librarian", emoji: "📚",
      speech: {
        start: ["Let me check the archives", "I recall something...", "To the stacks!", "One moment please"],
        working: ["Cross-referencing...", "Page 394...", "Checking the index...", "I've seen this before...", "Flipping through..."],
        done: ["Here, this passage", "Documented right here", "The records confirm", "Found the reference"],
        error: ["No entry found", "The archives are silent", "Uncharted territory", "Not in any catalog"],
      },
    },
    oracle: {
      name: "Oracle", emoji: "🧙",
      speech: {
        start: ["You seek guidance?", "The mists part...", "I have foreseen this", "Speak, and I shall see"],
        working: ["Peering beyond...", "The vision forms...", "Consulting the deep...", "Patience, mortal...", "The threads converge..."],
        done: ["The path is clear", "So it shall be", "Wisdom granted", "Heed this well"],
        error: ["The mists are thick", "Even I cannot see", "Fate is unclear", "Beyond my sight"],
      },
    },
    metis: {
      name: "Metis", emoji: "🦉",
      speech: {
        start: ["Analyzing the angles", "Let me think on this", "Hmm, interesting...", "Breaking it down"],
        working: ["Weighing options...", "Mapping the scope...", "Considering tradeoffs...", "Structuring...", "Untangling this..."],
        done: ["Here's the breakdown", "Scope defined", "Clear picture now", "All accounted for"],
        error: ["Too many unknowns", "Ambiguity remains", "Needs more clarity", "Can't scope this yet"],
      },
    },
    momus: {
      name: "Momus", emoji: "🎭",
      speech: {
        start: ["Oh, let me see this", "Time for honesty", "Don't shoot the messenger", "Alright, roast time"],
        working: ["Poking holes...", "Is this really right?", "Hmm, suspicious...", "Not convinced yet...", "Checking the seams..."],
        done: ["Here's what's wrong", "Fixed. You're welcome", "Brutal but fair", "The truth hurts"],
        error: ["Even I'm stumped", "Too broken to critique", "Where do I even start"],
      },
    },
    prometheus: {
      name: "Prometheus", emoji: "🔥",
      speech: {
        start: ["Forging the plan", "Fire in the forge", "Laying the blueprint", "Charting the course"],
        working: ["Shaping the steps...", "Ordering the phases...", "Building the roadmap...", "Connecting the dots...", "Sequencing..."],
        done: ["The plan is set", "Follow this path", "Blueprint ready", "All phases mapped"],
        error: ["Plan needs rework", "Back to the forge", "Sequence broken", "Must restructure"],
      },
    },
  },
  ko: {
    build: {
      name: "Sisyphus", emoji: "🪨",
      speech: {
        start: ["한 번 더 밀어봅시다", "바위가 다시 굴러갑니다", "다시 시작입니다", "가보겠습니다", "또 하루, 또 바위"],
        working: ["언덕을 오르는 중...", "거의 다 왔습니다...", "멈추지 않겠습니다", "분투 중...", "한 걸음씩..."],
        done: ["정상 도달! ✓", "끝났습니다. 또.", "바위가 버텼습니다", "배달 완료", "뒤에 하나 더"],
        error: ["다시 굴러내렸습니다...", "이번엔 안 되겠군요", "오늘은 언덕이 이겼습니다"],
      },
    },
    "build-jr": {
      name: "Sisyphus-Jr", emoji: "🧗",
      speech: {
        start: ["출발합니다!", "작은 바위, 큰 꿈", "오를 시간입니다", "준비 완료!"],
        working: ["벽을 오르는 중...", "거의 다 왔어요...", "중간쯤 왔습니다...", "조약돌을 미는 중..."],
        done: ["조약돌 배달 완료! ✓", "끝!", "정상 도달!", "가벼웠네요"],
        error: ["미끄러졌습니다...", "조약돌이 굴러갔어요", "더 큰 밀침이 필요합니다"],
      },
    },
    explore: {
      name: "Explorer", emoji: "🔍",
      speech: {
        start: ["단서를 발견했습니다!", "정찰 나갑니다", "냄새가 나네요!", "출발!", "뒤져보겠습니다"],
        working: ["단서를 따라가는 중...", "모든 구석을 확인합니다", "거의 다 잡았습니다...", "더 깊이 파고듭니다...", "흔적이 여기저기..."],
        done: ["찾았습니다!", "사건 종결", "바로 여기!", "미스터리 해결", "발견!"],
        error: ["단서가 끊겼습니다", "막다른 길", "흔적을 잃었습니다", "아무것도 없네요..."],
      },
    },
    librarian: {
      name: "Librarian", emoji: "📚",
      speech: {
        start: ["자료실로 가겠습니다", "기억나는 게 있는데...", "서가로!", "잠시만요"],
        working: ["교차 참조 중...", "394페이지...", "인덱스를 확인합니다...", "본 적이 있습니다...", "넘기는 중..."],
        done: ["여기, 이 구절입니다", "여기 기록되어 있습니다", "기록이 확인되었습니다", "참조를 찾았습니다"],
        error: ["항목을 찾을 수 없습니다", "기록보관소가 조용합니다", "미지의 영역입니다", "카탈로그에 없습니다"],
      },
    },
    oracle: {
      name: "Oracle", emoji: "🧙",
      speech: {
        start: ["인도를 구하시나요?", "안개가 걷힙니다...", "예견한 일입니다", "말씀하세요, 보이겠습니다"],
        working: ["너머를 내다보는 중...", "비전이 형성됩니다...", "깊이 탐구합니다...", "인내하십시오, 필멸자여...", "실이 모입니다..."],
        done: ["길이 열렸습니다", "그렇게 되리라", "지혜가 내려졌습니다", "명심하십시오"],
        error: ["안개가 짙습니다", "저도 볼 수 없습니다", "운명이 불분명합니다", "제 시야를 넘어선 일입니다"],
      },
    },
    metis: {
      name: "Metis", emoji: "🦉",
      speech: {
        start: ["각도를 분석합니다", "생각해보겠습니다", "음, 흥미롭군요...", "분해해봅시다"],
        working: ["선택지를 저울질합니다...", "범위를 매핑합니다...", "트레이드오프를 고려합니다...", "구조화 중...", "풀어내는 중..."],
        done: ["분석 결과입니다", "범위가 정의되었습니다", "명확해졌습니다", "모두 고려했습니다"],
        error: ["알 수 없는 게 너무 많습니다", "모호함이 남아있습니다", "명확성이 더 필요합니다", "아직 스코프을 정할 수 없습니다"],
      },
    },
    momus: {
      name: "Momus", emoji: "🎭",
      speech: {
        start: ["자, 로스트 타임입니다", "솔직하게 말해보죠", "전달자를 탓하지 마세요", "자, 불태울 시간입니다"],
        working: ["구멍을 뚫는 중...", "이게 맞나요?", "음, 의심스럽습니다...", "아직 설득되지 않았어요...", "솔직히 평가합니다..."],
        done: ["문제점은 여기 있습니다", "고쳤습니다. 천만에요", "브루탈하지만 공정합니다", "진실은 아프다"],
        error: ["저도 막막합니다", "비평할 수 없을 정도로 망가졌습니다", "어디서부터 시작해야 할지"],
      },
    },
    prometheus: {
      name: "Prometheus", emoji: "🔥",
      speech: {
        start: ["계획을 세웁니다", "대장간에 불이 붙었다", "청사진을 그립니다", "항로를 정합니다"],
        working: ["단계를 구성합니다...", "단계를 정렬합니다...", "로드맵을 만듭니다...", "점들을 연결합니다...", "순서를 정합니다..."],
        done: ["계획이 완성되었습니다", "이 길을 따르세요", "청사진 준비 완료", "모든 단계가 매핑되었습니다"],
        error: ["계획을 수정해야 합니다", "대장간으로 돌아갑니다", "순서가 깨졌습니다", "재구성해야 합니다"],
      },
    },
  },
}

function padName(name: string): string {
  return name.padEnd(NAME_WIDTH)
}

function randomLine(persona: Persona, state: string): string {
  const lines = persona.speech[state]
  if (!lines || lines.length === 0) return ""
  return lines[Math.floor(Math.random() * lines.length)]
}

function eventIcon(event: string): string {
  if (event === "tool_call" || event === "tool_result") return "🔧"
  if (event === "file_edit") return "✏️"
  if (event === "session_start") return "▶"
  if (event === "session_done") return "✓"
  if (event === "session_error") return "✗"
  return "·"
}

interface AgentState {
  active: boolean
  speech: string
}

const sessionAgentMap = new Map<string, AgentKey>()
const activeSessions = new Map<AgentKey, Set<string>>()
const sleepTimers = new Map<AgentKey, ReturnType<typeof setTimeout>>()

const tui: TuiPlugin = async (api, options: any, _meta) => {
  const locale: string = options?.locale ?? "en"
  const maxEntries: number = options?.maxEntries ?? 50
  const showTimestamps: boolean = options?.showTimestamps ?? true
  const showModels: boolean = options?.showModels ?? true
  const showPersonas: boolean = options?.showPersonas ?? true
  const compact: boolean = options?.compact ?? false
  const startCollapsed: boolean = options?.collapsedAgents ?? false

  const t = i18n[locale] ?? i18n["en"]
  const personas = personasByLocale[locale] ?? personasByLocale["en"]

  const signals: Record<AgentKey, [() => AgentState, (s: AgentState) => void]> = {} as any
  for (const key of AGENT_KEYS) {
    signals[key] = createSignal<AgentState>({ active: false, speech: "" })
  }

  const getAgent = (key: AgentKey): AgentState => signals[key][0]()
  const setAgent = (key: AgentKey, state: AgentState) => signals[key][1](state)

  const [timelineEntries, setTimelineEntries] = createSignal<TimelineEntry[]>([])
  const [olympusOpen, setOlympusOpen] = createSignal(true)
  const [timelineOpen, setTimelineOpen] = createSignal(true)
  const [collapsedAgents, setCollapsedAgents] = createSignal(new Set<AgentKey>(startCollapsed ? AGENT_KEYS : []))

  const toggleAgentCollapse = (key: AgentKey) => {
    const current = new Set(collapsedAgents())
    if (current.has(key)) current.delete(key)
    else current.add(key)
    setCollapsedAgents(current)
  }

  function activateAgent(key: AgentKey, state: string) {
    const existing = sleepTimers.get(key)
    if (existing) { clearTimeout(existing); sleepTimers.delete(key) }
    setAgent(key, { active: true, speech: randomLine(personas[key], state) })
  }

  function sleepAgent(key: AgentKey) {
    setAgent(key, { active: false, speech: "" })
  }

  function finishAgent(key: AgentKey) {
    setAgent(key, { active: true, speech: randomLine(personas[key], "done") })
    const timer = setTimeout(() => {
      sleepTimers.delete(key)
      sleepAgent(key)
    }, 3000)
    sleepTimers.set(key, timer)
  }

  function errorAgent(key: AgentKey) {
    const existing = sleepTimers.get(key)
    if (existing) { clearTimeout(existing); sleepTimers.delete(key) }
    setAgent(key, { active: true, speech: randomLine(personas[key], "error") })
    const timer = setTimeout(() => {
      sleepTimers.delete(key)
      sleepAgent(key)
    }, 5000)
    sleepTimers.set(key, timer)
  }

  function addTimelineEntry(entry: TimelineEntry) {
    const current = timelineEntries()
    const updated = [...current, entry].slice(-maxEntries)
    setTimelineEntries(updated)
  }

  function refreshTimeline() {
    setTimelineEntries(readTimeline().slice(-maxEntries))
  }

  const initialMode = readMode()
  if (showPersonas) activateAgent(initialMode, "start")

  // ── Event Handlers ──

  api.event.on("session.created", (event: any) => {
    const info = event.properties?.info
    if (info?.parentID) {
      const agentName = popPending()
      const key: AgentKey =
        agentName && (AGENT_KEYS as readonly string[]).includes(agentName)
          ? (agentName as AgentKey)
          : "build"

      sessionAgentMap.set(info.id, key)
      if (!activeSessions.has(key)) activeSessions.set(key, new Set())
      activeSessions.get(key)!.add(info.id)

      if (showPersonas) activateAgent(key, "start")

      addTimelineEntry({
        ts: Date.now(),
        agent: key,
        sessionId: info.id,
        event: "session_start",
      })
    }
  })

  api.event.on("session.status" as any, (event: any) => {
    const sessionId = event.properties?.sessionID
    const status = event.properties?.status?.type
    const key = sessionAgentMap.get(sessionId ?? "")

    if (key && key !== "build") {
      if (status === "busy" && showPersonas) activateAgent(key, "working")
      if (status === "idle") {
        const sessions = activeSessions.get(key)
        if (sessions) {
          sessions.delete(sessionId)
          if (sessions.size === 0) {
            activeSessions.delete(key)
            if (showPersonas) finishAgent(key)
          }
        } else {
          if (showPersonas) finishAgent(key)
        }

        addTimelineEntry({
          ts: Date.now(),
          agent: key,
          sessionId: sessionId ?? "",
          event: "session_done",
          model: readModels()[sessionId ?? ""]?.model,
        })
      }
    } else if (!key) {
      const mainAgent = readMode()
      if (status === "busy" && showPersonas) {
        activateAgent(mainAgent, "working")
        if (mainAgent === "prometheus") sleepAgent("build")
        if (mainAgent === "build") sleepAgent("prometheus")
      } else if (status === "idle" && showPersonas) {
        setAgent(mainAgent, { active: true, speech: randomLine(personas[mainAgent], "done") })
      }
    }

    refreshTimeline()
  })

  api.event.on("session.error" as any, (event: any) => {
    const sessionId = event.properties?.sessionID
    const key = sessionAgentMap.get(sessionId ?? "")
    if (key) {
      sessionAgentMap.delete(sessionId ?? "")
      const sessions = activeSessions.get(key)
      if (sessions) {
        sessions.delete(sessionId)
        if (sessions.size === 0) activeSessions.delete(key)
      }
      if (showPersonas) errorAgent(key)

      addTimelineEntry({
        ts: Date.now(),
        agent: key,
        sessionId: sessionId ?? "",
        event: "session_error",
        model: readModels()[sessionId ?? ""]?.model,
      })
    }
  })

  api.event.on("session.deleted" as any, (event: any) => {
    const sessionId = event.properties?.sessionID ?? event.properties?.id
    if (sessionId) {
      const key = sessionAgentMap.get(sessionId)
      sessionAgentMap.delete(sessionId)
      if (key) {
        const sessions = activeSessions.get(key)
        if (sessions) {
          sessions.delete(sessionId)
          if (sessions.size === 0) activeSessions.delete(key)
        }
        if (!activeSessions.get(key)?.size && !sleepTimers.has(key) && showPersonas) {
          sleepAgent(key)
        }
      }
    }
  })

  // ── Sidebar: Olympus Personas (order 50) ──

  if (showPersonas) {
    api.slots.register({
      order: 50,
      slots: {
        sidebar_content(ctx: TuiSlotContext, _props: any) {
          const theme = ctx.theme.current
          const fg = theme.text ?? "#EEFFFF"
          const dim = theme.textMuted ?? "#546E7A"
          const accent = theme.accent ?? "#82AAFF"
          const isOpen = olympusOpen()
          const activeCount = AGENT_KEYS.filter((k) => getAgent(k).active).length
          const models = readModels()

          const agentRows = AGENT_KEYS.map((key) => {
            const persona = personas[key]
            const state = getAgent(key)
            const isCollapsed = collapsedAgents().has(key)

            const agentModel = (() => {
              if (!showModels) return ""
              for (const sid of activeSessions.get(key) ?? []) {
                const m = models[sid]?.model
                if (m) return shortenModel(m)
              }
              if (!isCollapsed) {
                for (const [, entry] of Object.entries(models)) {
                  if (entry.agent === key) return shortenModel(entry.model)
                }
              }
              return ""
            })()

            const statusText = state.active
              ? state.speech
              : t.sleeping

            const agentTimeline = (() => {
              if (isCollapsed) return null
              const entries = timelineEntries()
              const filtered = entries
                .filter((e) => e.agent === key)
                .slice(-5)
              if (filtered.length === 0) return null
              return filtered.map((entry) => {
                const icon = eventIcon(entry.event)
                const detail = entry.event === "tool_call" && entry.tool
                  ? `${entry.tool}${entry.detail ? `: ${entry.detail.slice(0, 35)}` : ""}`
                  : entry.event === "file_edit" && entry.detail
                    ? `edit: ${entry.detail.split("/").pop()}`
                    : ""
                return (
                  <box height={1} flexDirection="row">
                    {showTimestamps ? (
                      <text fg={dim}>{`    ${formatTime(entry.ts)}  `}</text>
                    ) : (
                      <text fg={dim}>{"      "}</text>
                    )}
                    <text fg={accent}>{`${icon} `}</text>
                    <text fg={dim}>{detail}</text>
                  </box>
                )
              })
            })()

            if (compact) {
              return (
                <box height={1} flexDirection="row"
                  onMouseDown={() => toggleAgentCollapse(key)}>
                  <text fg={state.active ? fg : dim}>
                    {state.active
                      ? `${persona.emoji} `
                      : `${persona.emoji} `}
                  </text>
                </box>
              )
            }

            const collapseIcon = isCollapsed ? "▶" : "▼"

            return (
              <box flexDirection="column">
                <box height={1} flexDirection="row"
                  onMouseDown={() => toggleAgentCollapse(key)}>
                  <text fg={state.active ? fg : dim}>
                    {` ${collapseIcon} ${persona.emoji} ${padName(persona.name).slice(0, NAME_WIDTH)} `}
                  </text>
                  <text fg={state.active ? accent : dim}>
                    {state.active
                      ? `${t.busy}  "${statusText}"`
                      : t.sleeping}
                  </text>
                </box>
                {!isCollapsed && agentModel ? (
                  <box height={1} flexDirection="row">
                    <text fg={dim}>{`    ${agentModel}`}</text>
                  </box>
                ) : null}
                {agentTimeline}
              </box>
            )
          })

          return (
            <box flexDirection="column" marginBottom={1}>
              <box height={1} flexDirection="row" onMouseDown={() => setOlympusOpen(!olympusOpen())}>
                <text bold fg={fg}>
                  {isOpen ? "▼" : "▶"}{` ${t.olympus}`}
                </text>
                {!isOpen ? <text fg={dim}>{` (${activeCount} ${t.agents})`}</text> : null}
              </box>
              {isOpen ? agentRows : null}
            </box>
          ) as any
        },
      },
    })
  }

  // ── Sidebar: Timeline (order 51) ──

  api.slots.register({
    order: 51,
    slots: {
      sidebar_content(ctx: TuiSlotContext, _props: any) {
        const theme = ctx.theme.current
        const fg = theme.text ?? "#EEFFFF"
        const dim = theme.textMuted ?? "#546E7A"
        const accent = theme.accent ?? "#82AAFF"
        const isOpen = timelineOpen()
        const entries = timelineEntries()

        const activeCount = AGENT_KEYS.filter((k) => getAgent(k).active).length
        const doneCount = entries.filter((e) => e.event === "session_done").length
        const errorCount = entries.filter((e) => e.event === "session_error").length

        const timelineRows = entries.slice(-20).reverse().map((entry) => {
          const agentKey: AgentKey =
            (AGENT_KEYS as readonly string[]).includes(entry.agent)
              ? (entry.agent as AgentKey)
              : "build"
          const persona = personas[agentKey]
          const agentLabel = persona ? `${persona.emoji} ${padName(persona.name).slice(0, NAME_WIDTH)}` : entry.agent
          const icon = eventIcon(entry.event)

          const detail = entry.event === "tool_call" && entry.tool
            ? `${entry.tool}${entry.detail ? `: ${entry.detail.slice(0, 40)}` : ""}`
            : entry.event === "file_edit" && entry.detail
              ? `edit: ${entry.detail.split("/").pop()}`
              : entry.event === "session_done"
                ? t.doneLabel
                : entry.event === "session_error"
                  ? t.errorLabel
                  : ""

          return (
            <box height={1} flexDirection="row">
              {showTimestamps ? (
                <text fg={dim}>{`${formatTime(entry.ts)}  `}</text>
              ) : null}
              <text fg={fg}>{`${agentLabel} `}</text>
              <text fg={accent}>{`${icon} `}</text>
              <text fg={dim}>{detail}</text>
            </box>
          )
        })

        return (
          <box flexDirection="column">
            <box height={1} flexDirection="row" onMouseDown={() => setTimelineOpen(!timelineOpen())}>
              <text bold fg={fg}>
                {isOpen ? "▼" : "▶"}{` ${t.timeline}`}
              </text>
              {!isOpen ? (
                <text fg={dim}>{` (${entries.length})`}</text>
              ) : null}
            </box>
            {isOpen ? timelineRows : null}
            <text fg={dim}>{`\n${t.separator}`}</text>
            <text fg={dim}>
              {`  ${activeCount} ${t.active} · ${doneCount} ${t.done} · ${errorCount} ${t.error}`}
            </text>
          </box>
        ) as any
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = {
  id: "opencode-time-travel",
  tui,
}

export default plugin
