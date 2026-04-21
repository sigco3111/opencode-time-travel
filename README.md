# ⏳ opencode-time-travel

<a id="english"></a>

> Session Timeline Replay — OpenCode Subagent Activity Monitoring, Model Display & Olympus Personas

**English** | [한국어](#한국어)

---

## Overview

`opencode-time-travel` is an all-in-one OpenCode plugin that combines **Olympus persona visualization** and **real-time timeline monitoring** into a single package. Install once, get everything.

When oh-my-opencode fires agents in parallel, you normally see nothing until the output drops. This plugin changes that by showing:

- **Who is working** — Greek mythology personas with dynamic dialogue (from omo-olympus)
- **What they're doing** — Tool calls, file edits, timestamps, model names (from time-travel)
- **Per-agent timeline folding** — Click any agent header to collapse/expand their activity

### Screenshot

```
▼ 🏛️ Olympus
  🪨 Sisyphus        anthropic/claude-sonnet-4  [busy]  "Pushing uphill..."
  ▼ 🔍 Explorer      anthropic/claude-sonnet-4  [busy]  "On the trail!"
      12:03:10  🔧 bash: rg "TODO" src/
      12:03:08  📄 read: package.json
  ▼ 📚 Librarian     google/gemini-2.5-pro      [done]  ✓  "The records confirm"
      12:02:55  📄 read: docs/api.md
  🧙 Oracle          google/gemini-2.5-pro      [done]  ✓  "The path is clear"
  🦉 Metis           💤
  🎭 Momus           💤
  🔥 Prometheus      💤

  ▼ ⏳ Timeline
      12:03:15  🧗 Sisyphus-Jr   ✏️ write: src/utils.ts
      12:03:14  🪨 Sisyphus      🔧 bash: npm test
      12:03:12  🪨 Sisyphus      📄 read: src/index.ts
      12:03:10  🔍 Explorer      🔧 bash: rg "TODO" src/
      12:02:55  📚 Librarian     📄 read: docs/api.md
      12:02:40  🧙 Oracle        🔧 bash: cargo test --all
───────────────────────────────────────────────
  3 active · 3 done · 0 error
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏛️ **Olympus Personas** | Greek mythology characters for all 8 agents with randomized dialogue — built-in, no separate plugin needed |
| 📜 **Session Timeline** | All agent activities recorded chronologically |
| 📂 **Per-Agent Collapse** | Click any agent header to fold/unfold their timeline — collapsed shows model + status only |
| 📦 **Section Collapse** | Click Olympus or Timeline header to fold entire sections |
| 🏷️ **Model Display** | Real-time model name per agent |
| 🌐 **i18n Support** | `locale: "en"` or `locale: "ko"` — all UI text and persona dialogue switches automatically |
| 🎨 **Theme-Aware** | Reads OpenCode theme, auto-applies colors |
| ⚡ **Real-Time Updates** | Solid.js reactive signals — instant feedback |
| 🔇 **Auto-Sleep** | Done agents return to 💤 after 3 seconds |
| ❌ **Error Detection** | Error dialogue on agent failure (5s display) |
| 🔄 **Concurrent Tracking** | Multiple instances of same agent tracked; sleeps only when all finish |
| 🔥 **Mode Switching** | Detects Prometheus (plan) vs Sisyphus (build) via system prompt |
| 🧹 **Session Cleanup** | Memory leak prevention with session.deleted handler |

---

## 🤖 Supported Agents

| Agent | Role | Emoji | Source |
|-------|------|-------|--------|
| **Sisyphus** | Main build agent | 🪨 | oh-my-opencode (Plan mode) |
| **Sisyphus-Jr** | Secondary build agent | 🧗 | oh-my-opencode (background_task) |
| **Explorer** | Codebase detective | 🔍 | oh-my-opencode |
| **Librarian** | Documentation & cross-reference | 📚 | oh-my-opencode |
| **Oracle** | Deep analysis & consulting | 🧙 | oh-my-opencode |
| **Metis** | Design & scope definition | 🦉 | oh-my-opencode |
| **Momus** | Brutal code reviewer | 🎭 | oh-my-opencode |
| **Prometheus** | Plan architect | 🔥 | oh-my-opencode (Build mode) |

### The Pantheon (Persona Dialogue)

Each agent has 4 states (start, working, done, error) with randomized lines:

| Agent | They say things like... |
|-------|------------------------|
| 🪨 Sisyphus | *"One more push"* · *"The boulder rolls again"* · *"Summit reached ✓"* |
| 🔍 Explorer | *"On the trail!"* · *"Checking every corner"* · *"Case closed"* |
| 📚 Librarian | *"To the stacks!"* · *"Page 394..."* · *"The records confirm"* |
| 🧙 Oracle | *"You seek guidance?"* · *"Patience, mortal..."* · *"The path is clear"* |
| 🦉 Metis | *"Hmm, interesting..."* · *"Weighing options..."* · *"Scope defined"* |
| 🎭 Momus | *"Alright, roast time"* · *"Not convinced yet..."* · *"The truth hurts"* |
| 🔥 Prometheus | *"Fire in the forge"* · *"Connecting the dots..."* · *"Blueprint ready"* |

> 💤 Korean dialogue is also available — just set `locale: "ko"` in config.

---

## 📦 Installation

### npm (Recommended)

**1. Server Plugin** — `~/.config/opencode/opencode.json`:
```json
{
  "plugin": ["opencode-time-travel@latest"]
}
```

**2. TUI Plugin** — `~/.config/opencode/tui.json`:
```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [["opencode-time-travel@latest", { "enabled": true }]]
}
```

**3. Restart OpenCode**

Both plugins load on startup. That's it — Olympus personas + timeline in one package.

> **💡 Let your LLM agent handle it**
> Paste this into Claude Code, OpenCode, Cursor, etc.:
> https://raw.githubusercontent.com/sigco3111/opencode-time-travel/main/docs/installation.md

### Manual Install

```bash
mkdir -p ~/.config/opencode/plugins
cp src/server.ts ~/.config/opencode/plugins/time-travel-server.ts
cp src/tui.tsx ~/.config/opencode/plugins/time-travel.tsx
```

`~/.config/opencode/opencode.json`:
```json
{
  "plugin": ["./plugins/time-travel-server.ts"]
}
```

`~/.config/opencode/tui.json`:
```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [["./plugins/time-travel.tsx", { "enabled": true }]]
}
```

---

## ⚙️ Configuration

### Options

```json
{
  "plugin": [
    ["opencode-time-travel@latest", {
      "enabled": true,
      "locale": "en",
      "maxEntries": 50,
      "showTimestamps": true,
      "showModels": true,
      "showPersonas": true,
      "compact": false,
      "collapsedAgents": false
    }]
  ]
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `enabled` | `true` | Enable/disable the plugin |
| `locale` | `"en"` | Language: `"en"` or `"ko"` — affects all UI labels, status text, and persona dialogue |
| `maxEntries` | `50` | Max timeline entries per agent |
| `showTimestamps` | `true` | Show timestamps in timeline |
| `showModels` | `true` | Show model names per agent |
| `showPersonas` | `true` | Show Olympus persona section (disable to see timeline only) |
| `compact` | `false` | Compact mode (emojis only) |
| `collapsedAgents` | `false` | Start with all agent timelines collapsed |

### Language Examples

**English (`locale: "en"`)** — default:
```
▼ 🏛️ Olympus
  🪨 Sisyphus    [busy]  "Pushing uphill..."
  📚 Librarian   [done]  ✓  "The records confirm"
  🦉 Metis       💤
```

**한국어 (`locale: "ko"`)**:
```
▼ 🏛️ 올림포스
  🪨 시시포스    [작업중]  "한 번 더 밀어봅시다..."
  📚 사서        [완료]  ✓  "기록이 확인되었습니다"
  🦉 메티스      💤
```

---

## ⚙️ How It Works

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                    OpenCode Core                     │
│                                                      │
│  session.created   tool.execute.before/after         │
│  session.status    session.error   file.edited       │
│  session.deleted   session.compacted                │
│                                                      │
│         ▼                                            │
│  ┌──────────────────────────────────────┐           │
│  │  Server Plugin (src/server.ts)       │           │
│  │                                      │           │
│  │  • Event collection                  │           │
│  │  • Agent inference                   │           │
│  │  • Model detection                   │           │
│  │  • Timeline recording                │           │
│  │  • Persona dialogue generation       │           │
│  │  • Mode detection (Prometheus/Sisy)  │           │
│  └──────────┬──────────┬────────────────┘           │
│        JSON files    JSON files                      │
│     (timeline)    (models)    (pending)    (mode)    │
│             │         │           │           │       │
│             ▼         ▼           ▼           ▼       │
│  ┌──────────────────────────────────────┐           │
│  │  TUI Plugin (src/tui.tsx)            │           │
│  │                                      │           │
│  │  • Solid.js reactive signals         │           │
│  │  • Olympus persona sidebar (order 50)│           │
│  │  • Timeline sidebar (order 51)       │           │
│  │  • Per-agent collapse/expand         │           │
│  │  • Model badges                      │           │
│  │  • i18n (en/ko)                      │           │
│  └──────────────────────────────────────┘           │
└─────────────────────────────────────────────────────┘
```

### Server Plugin Hooks

| Hook | Purpose |
|------|---------|
| `tool.execute.before` | Detect task() calls → infer agent type → record timeline + queue persona |
| `tool.execute.after` | Tool execution complete → record result in timeline |
| `session.created` | Subsession created → agent-session mapping |
| `session.status` | busy/idle state change → update timeline + persona |
| `session.error` | Error occurred → record error in timeline + persona |
| `session.deleted` | Session ended → memory cleanup |
| `file.edited` | File modified → record file change in timeline |
| `experimental.chat.system.transform` | Detect model name + main session mode from system prompt |

### Agent Inference Logic

When `task()` or `delegate_task()` is called, the agent is inferred in this order:

1. **subagent_type** field direct check (`explore`, `oracle`, `librarian`, `metis`, `momus`, `prometheus`)
2. **description/prompt** keyword matching (explore→Explorer, plan→Metis, review→Momus, etc.)
3. **category** field matching (ultrabrain→Oracle, visual-engineering→Build, etc.)
4. **Default**: `build` (Sisyphus)

### Model Detection Logic

Model names are extracted from system prompts and message metadata:

1. Scan model reference patterns in `experimental.chat.system.transform`
2. Query model info via SDK on session creation
3. Check response metadata in `tool.execute.after`
4. Detected models are cached in `/tmp/time-travel-models.json`

---

## 📁 IPC File Structure

Server and TUI plugins communicate via file-based IPC.

### `/tmp/time-travel-timeline.json`

```json
{
  "entries": [
    {
      "ts": 1714000000123,
      "agent": "explorer",
      "sessionId": "ses_abc123",
      "event": "tool_call",
      "tool": "bash",
      "detail": "rg \"TODO\" src/",
      "model": "anthropic/claude-sonnet-4"
    },
    {
      "ts": 1714000000456,
      "agent": "explorer",
      "sessionId": "ses_abc123",
      "event": "file_edit",
      "detail": "edit: src/index.ts",
      "model": "anthropic/claude-sonnet-4"
    },
    {
      "ts": 1714000000789,
      "agent": "explorer",
      "sessionId": "ses_abc123",
      "event": "done",
      "detail": null,
      "model": "anthropic/claude-sonnet-4"
    }
  ]
}
```

### `/tmp/time-travel-models.json`

```json
{
  "ses_main_001": {
    "agent": "build",
    "model": "anthropic/claude-sonnet-4",
    "startedAt": 1714000000000
  },
  "ses_abc123": {
    "agent": "explorer",
    "model": "anthropic/claude-sonnet-4",
    "startedAt": 1714000000050
  }
}
```

### `/tmp/omo-pending.json` (Persona Queue)

```json
{
  "ses_abc123": {
    "agent": "explorer",
    "state": "working",
    "ts": 1714000000300
  }
}
```

### `/tmp/omo-mode.json` (Main Session Mode)

```json
{ "mode": "build" }
```

---

## 🛠 Development

```bash
git clone https://github.com/sigco3111/opencode-time-travel.git
cd opencode-time-travel
npm install

# Symlink for live reload
ln -sf $(pwd)/src/server.ts ~/.config/opencode/plugins/time-travel-server.ts
ln -sf $(pwd)/src/tui.tsx ~/.config/opencode/plugins/time-travel.tsx

# Restart opencode — changes reflect immediately
```

### Project Structure

```
opencode-time-travel/
├── src/
│   ├── server.ts      # Server plugin (event collection, agent inference, model detection, persona generation)
│   ├── tui.tsx        # TUI plugin (Solid.js sidebar: Olympus + Timeline, per-agent collapse, i18n)
│   └── i18n/
│       ├── en.ts      # English UI labels + persona dialogue
│       └── ko.ts      # Korean UI labels + persona dialogue
├── docs/
│   └── installation.md # LLM agent installation guide
├── package.json
├── tsconfig.json
├── LICENSE
└── README.md
```

---

## 📋 Requirements

- [OpenCode](https://opencode.ai) with plugin support (`@opencode-ai/plugin` >= 1.4.3)
- Agent orchestration plugin (oh-my-opencode, oh-my-opencode-slim, etc.)

---

## 🗑️ Uninstall

1. Remove `"opencode-time-travel@latest"` from `~/.config/opencode/opencode.json`
2. Remove `["opencode-time-travel@latest", ...]` from `~/.config/opencode/tui.json`
3. Restart OpenCode
4. (Optional) Clean up IPC files:
```bash
rm -f /tmp/time-travel-timeline.json /tmp/time-travel-models.json /tmp/omo-pending.json /tmp/omo-mode.json
```

---

## ⚠️ Known Limitations

- `tool.execute.before` fires twice per tool call — handled with 200ms dedup window
- Model detection relies on `experimental.chat.system.transform` — API may change in future OpenCode versions
- System prompt keyword matching is coupled to oh-my-opencode's internal prompt format
- Server ↔ TUI communication uses `/tmp/` file-based IPC — may not work on network filesystems

---

## 📄 License

[MIT](LICENSE)

---

## 🙏 Credits

- [omo-olympus](https://github.com/akasai/omo-olympus) — Greek mythology persona system, file-based IPC pattern, and agent inference logic (now integrated)
- [oh-my-opencode](https://github.com/nicepkg/oh-my-opencode) — Agent architecture and subagent type definitions
- [OpenCode](https://opencode.ai) — Plugin API and TUI framework

---

<a id="한국어"></a>

# ⏳ opencode-time-travel

> 세션 타임라인 리플레이 — OpenCode 서브에이전트 활동 모니터링 & 모델 표시 & 올림포스 페르소나

[English](#english) | **한국어**

---

## 개요

`opencode-time-travel`은 **올림포스 페르소나 시각화**와 **실시간 타임라인 모니터링**을 하나의 패키지로 통합한 올인원 OpenCode 플러그인입니다. 설치 한 번으로 모든 기능을 사용할 수 있습니다.

oh-my-opencode가 에이전트를 병렬로 실행할 때, 백그라운드에서 무슨 일이 벌어지고 있는지 전혀 보이지 않는 문제를 해결합니다:

- **누가 일하고 있는가** — 그리스 신화 페르소나와 동적 대화 (omo-olympus 기능 내장)
- **무슨 일을 하고 있는가** — 툴 호출, 파일 수정, 타임스탬프, 모델명 실시간 표시
- **에이전트별 접기/펼치기** — 에이전트 헤더 클릭으로 개별 타임라인 접었다 폈다

### 화면 예시

```
▼ 🏛️ 올림포스
  🪨 시시포스         anthropic/claude-sonnet-4  [작업중]  "한 번 더 밀어봅시다..."
  ▼ 🔍 탐험가        anthropic/claude-sonnet-4  [작업중]  "단서를 발견했습니다!"
      12:03:10  🔧 bash: rg "TODO" src/
      12:03:08  📄 read: package.json
  ▼ 📚 사서           google/gemini-2.5-pro      [완료]  ✓  "기록이 확인되었습니다"
      12:02:55  📄 read: docs/api.md
  🧙 오라클           google/gemini-2.5-pro      [완료]  ✓  "길이 열렸습니다"
  🦉 메티스           💤
  🎭 모무스           💤
  🔥 프로메테우스      💤

  ▼ ⏳ 타임라인
      12:03:15  🧗 시시포스 주니어  ✏️ write: src/utils.ts
      12:03:14  🪨 시시포스        🔧 bash: npm test
      12:03:12  🪨 시시포스        📄 read: src/index.ts
      12:03:10  🔍 탐험가         🔧 bash: rg "TODO" src/
      12:02:55  📚 사서           📄 read: docs/api.md
      12:02:40  🧙 오라클         🔧 bash: cargo test --all
───────────────────────────────────────────────
  3 활성 · 3 완료 · 0 에러
```

---

## ✨ 기능

| 기능 | 설명 |
|------|------|
| 🏛️ **올림포스 페르소나** | 8개 에이전트의 그리스 신화 캐릭터 + 랜덤 대화 — 별도 플러그인 없이 내장 |
| 📜 **세션 타임라인** | 모든 에이전트 활동을 시간순으로 기록하고 시각화 |
| 📂 **에이전트별 접기/펼치기** | 에이전트 헤더 클릭으로 개별 타임라인 접었다 폈다 — 접힌 상태에선 모델 + 상태만 표시 |
| 📦 **섹션 접기/펼치기** | 올림포스 / 타임라인 헤더 클릭으로 전체 섹션 접고 펼치기 |
| 🏷️ **모델 표시** | 각 에이전트가 사용 중인 모델명을 실시간으로 표시 |
| 🌐 **다국어 지원** | `locale: "ko"` 또는 `locale: "en"` — UI 텍스트와 페르소나 대화가 설정에 따라 자동 전환 |
| 🎨 **테마 인식** | OpenCode 테마를 자동으로 읽어 색상 적용 |
| ⚡ **실시간 업데이트** | Solid.js 반응형 시그널 기반, 에이전트가 일하면 즉시 반영 |
| 🔇 **자동 슬립** | 완료된 에이전트는 3초 후 💤 상태로 전환 |
| ❌ **에러 감지** | 에이전트 오류 발생 시 에러 대화 표시 (5초간) |
| 🔄 **동시 실행 추적** | 동일 에이전트의 여러 인스턴스를 동시에 추적, 모두 끝나야 슬립 |
| 🔥 **모드 전환** | 시스템 프롬프트에서 프로메테우스(계획) vs 시시포스(빌드) 자동 감지 |
| 🧹 **세션 정리** | session.deleted 핸들러로 메모리 누수 방지 |

---

## 🤖 지원 에이전트

| 에이전트 | 역할 | 이모지 | 출처 |
|---------|------|--------|------|
| **Sisyphus (시시포스)** | 메인 빌드 에이전트 | 🪨 | oh-my-opencode (Plan 모드) |
| **Sisyphus-Jr (시시포스 주니어)** | 보조 빌드 에이전트 | 🧗 | oh-my-opencode (background_task) |
| **Explorer (탐험가)** | 코드베이스 탐색 | 🔍 | oh-my-opencode |
| **Librarian (사서)** | 문서 참조 및 크로스체크 | 📚 | oh-my-opencode |
| **Oracle (오라클)** | 깊은 분석 및 컨설팅 | 🧙 | oh-my-opencode |
| **Metis (메티스)** | 설계 및 스코프 정의 | 🦉 | oh-my-opencode |
| **Momus (모무스)** | 브루탈 코드 리뷰 | 🎭 | oh-my-opencode |
| **Prometheus (프로메테우스)** | 계획 수립 | 🔥 | oh-my-opencode (Build 모드) |

### 판테온 (페르소나 대화)

각 에이전트는 4가지 상태(시작, 작업중, 완료, 에러)에 따라 랜덤 대화를 출력합니다:

| 에이전트 | 대화 예시 |
|---------|-----------|
| 🪨 시시포스 | *"한 번 더 밀어봅시다"* · *"바위가 다시 굴러갑니다"* · *"정상에 도달! ✓"* |
| 🔍 탐험가 | *"단서를 발견했습니다!"* · *"모든 구석을 확인합니다"* · *"사건 종결"* |
| 📚 사서 | *"자료실로!"* · *"394페이지..."* · *"기록이 확인되었습니다"* |
| 🧙 오라클 | *"인도를 구하시나요?"* · *"인내하십시오, 필멸자여..."* · *"길이 열렸습니다"* |
| 🦉 메티스 | *"음, 흥미롭군요..."* · *"선택지를 저울질합니다..."* · *"범위가 정의되었습니다"* |
| 🎭 모무스 | *"자, 로스트 타임입니다"* · *"아직 설득되지 않았어요..."* · *"진실은 아프다"* |
| 🔥 프로메테우스 | *"대장간에 불이 붙었다"* · *"점들을 연결합니다..."* · *"청사진 완성"* |

> 💤 영어 대화도 사용 가능 — `locale: "en"`으로 설정하세요.

---

## 📦 설치

### npm으로 설치 (권장)

**1. Server 플러그인 설정** — `~/.config/opencode/opencode.json`:
```json
{
  "plugin": ["opencode-time-travel@latest"]
}
```

**2. TUI 플러그인 설정** — `~/.config/opencode/tui.json`:
```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [["opencode-time-travel@latest", { "enabled": true, "locale": "ko" }]]
}
```

**3. OpenCode 재시작**

두 플러그인 모두 시작 시 로드됩니다. 올림포스 페르소나 + 타임라인이 하나로 통합되어 표시됩니다.

> **💡 LLM 에이전트에게 맡기세요**
> Claude Code, OpenCode, Cursor 등에 아래 가이드 URL을 붙여넣으면 알아서 설정합니다:
> https://raw.githubusercontent.com/sigco3111/opencode-time-travel/main/docs/installation.md

### 수동 설치

```bash
mkdir -p ~/.config/opencode/plugins
cp src/server.ts ~/.config/opencode/plugins/time-travel-server.ts
cp src/tui.tsx ~/.config/opencode/plugins/time-travel.tsx
```

`~/.config/opencode/opencode.json`:
```json
{
  "plugin": ["./plugins/time-travel-server.ts"]
}
```

`~/.config/opencode/tui.json`:
```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [["./plugins/time-travel.tsx", { "enabled": true, "locale": "ko" }]]
}
```

---

## ⚙️ 설정

### 옵션

```json
{
  "plugin": [
    ["opencode-time-travel@latest", {
      "enabled": true,
      "locale": "ko",
      "maxEntries": 50,
      "showTimestamps": true,
      "showModels": true,
      "showPersonas": true,
      "compact": false,
      "collapsedAgents": false
    }]
  ]
}
```

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `enabled` | `true` | 플러그인 활성화 여부 |
| `locale` | `"en"` | 언어: `"en"` 또는 `"ko"` — UI 라벨, 상태 텍스트, 페르소나 대화에 모두 적용 |
| `maxEntries` | `50` | 에이전트당 최대 타임라인 항목 수 |
| `showTimestamps` | `true` | 타임스탬프 표시 여부 |
| `showModels` | `true` | 모델명 표시 여부 |
| `showPersonas` | `true` | 올림포스 페르소나 섹션 표시 (false로 설정 시 타임라인만) |
| `compact` | `false` | 컴팩트 모드 (이모지만 표시) |
| `collapsedAgents` | `false` | 시작 시 모든 에이전트 타임라인 접힌 상태로 시작 |

### 언어별 예시

**한국어 (`locale: "ko"`)**:
```
▼ 🏛️ 올림포스
  🪨 시시포스    [작업중]  "한 번 더 밀어봅시다..."
  📚 사서        [완료]  ✓  "기록이 확인되었습니다"
  🦉 메티스      💤
```

**English (`locale: "en"`)** — default:
```
▼ 🏛️ Olympus
  🪨 Sisyphus    [busy]  "Pushing uphill..."
  📚 Librarian   [done]  ✓  "The records confirm"
  🦉 Metis       💤
```

---

## ⚙️ 작동 원리

### 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                    OpenCode Core                     │
│                                                      │
│  session.created   tool.execute.before/after         │
│  session.status    session.error   file.edited       │
│  session.deleted   session.compacted                │
│                                                      │
│         ▼                                            │
│  ┌──────────────────────────────────────┐           │
│  │  Server Plugin (src/server.ts)       │           │
│  │                                      │           │
│  │  • 이벤트 수집                        │           │
│  │  • 에이전트 추론                      │           │
│  │  • 모델 탐지                          │           │
│  │  • 타임라인 기록                      │           │
│  │  • 페르소나 대화 생성                 │           │
│  │  • 모드 감지 (Prometheus/Sisyphus)    │           │
│  └──────────┬──────────┬────────────────┘           │
│        JSON 파일    JSON 파일                        │
│     (timeline)    (models)    (pending)    (mode)    │
│             │         │           │           │       │
│             ▼         ▼           ▼           ▼       │
│  ┌──────────────────────────────────────┐           │
│  │  TUI Plugin (src/tui.tsx)            │           │
│  │                                      │           │
│  │  • Solid.js 반응형 시그널             │           │
│  │  • 올림포스 페르소나 사이드바 (50)     │           │
│  │  • 타임라인 사이드바 (51)             │           │
│  │  • 에이전트별 접기/펼치기             │           │
│  │  • 모델 뱃지                          │           │
│  │  • 다국어 (en/ko)                     │           │
│  └──────────────────────────────────────┘           │
└─────────────────────────────────────────────────────┘
```

### Server 플러그인 훅

| 훅 | 용도 |
|----|------|
| `tool.execute.before` | task() 호출 감지 → 에이전트 타입 추론 → 타임라인 + 페르소나 큐에 기록 |
| `tool.execute.after` | 툴 실행 완료 → 타임라인에 결과 기록 |
| `session.created` | 서브세션 생성 → 에이전트-세션 매핑 |
| `session.status` | busy/idle 상태 변화 → 타임라인 + 페르소나 업데이트 |
| `session.error` | 에러 발생 → 타임라인 + 페르소나에 에러 기록 |
| `session.deleted` | 세션 종료 → 메모리 정리 |
| `file.edited` | 파일 수정 → 타임라인에 파일 변경 기록 |
| `experimental.chat.system.transform` | 시스템 프롬프트에서 모델명 + 메인 세션 모드 감지 |

### 에이전트 추론 로직

`task()` 또는 `delegate_task()` 호출 시 다음 순서로 에이전트를 추론합니다:

1. **subagent_type** 필드 직접 확인 (`explore`, `oracle`, `librarian`, `metis`, `momus`, `prometheus`)
2. **description/prompt** 키워드 매칭 (explore→Explorer, plan→Metis, review→Momus 등)
3. **category** 필드 매칭 (ultrabrain→Oracle, visual-engineering→Build 등)
4. **기본값**: `build` (Sisyphus)

### 모델 탐지 로직

시스템 프롬프트와 메시지 메타데이터에서 모델명을 추출합니다:

1. `experimental.chat.system.transform`에서 모델 참조 패턴 스캔
2. 세션 생성 시 SDK를 통해 모델 정보 조회
3. `tool.execute.after`에서 응답 메타데이터 확인
4. 감지된 모델은 `/tmp/time-travel-models.json`에 캐싱

---

## 📁 IPC 파일 구조

Server와 TUI 플러그인은 파일 기반 IPC로 통신합니다.

### `/tmp/time-travel-timeline.json`

```json
{
  "entries": [
    {
      "ts": 1714000000123,
      "agent": "explorer",
      "sessionId": "ses_abc123",
      "event": "tool_call",
      "tool": "bash",
      "detail": "rg \"TODO\" src/",
      "model": "anthropic/claude-sonnet-4"
    },
    {
      "ts": 1714000000789,
      "agent": "explorer",
      "sessionId": "ses_abc123",
      "event": "done",
      "detail": null,
      "model": "anthropic/claude-sonnet-4"
    }
  ]
}
```

### `/tmp/time-travel-models.json`

```json
{
  "ses_main_001": {
    "agent": "build",
    "model": "anthropic/claude-sonnet-4",
    "startedAt": 1714000000000
  },
  "ses_abc123": {
    "agent": "explorer",
    "model": "anthropic/claude-sonnet-4",
    "startedAt": 1714000000050
  }
}
```

### `/tmp/omo-pending.json` (페르소나 큐)

```json
{
  "ses_abc123": {
    "agent": "explorer",
    "state": "working",
    "ts": 1714000000300
  }
}
```

### `/tmp/omo-mode.json` (메인 세션 모드)

```json
{ "mode": "build" }
```

---

## 🛠 개발

```bash
git clone https://github.com/sigco3111/opencode-time-travel.git
cd opencode-time-travel
npm install

# 심볼릭 링크로 라이브 리로드
ln -sf $(pwd)/src/server.ts ~/.config/opencode/plugins/time-travel-server.ts
ln -sf $(pwd)/src/tui.tsx ~/.config/opencode/plugins/time-travel.tsx

# opencode 재시작 후 변경사항 즉시 반영
```

### 프로젝트 구조

```
opencode-time-travel/
├── src/
│   ├── server.ts      # Server 플러그인 (이벤트 수집, 에이전트 추론, 모델 탐지, 페르소나 생성)
│   ├── tui.tsx        # TUI 플러그인 (Solid.js 사이드바: 올림포스 + 타임라인, 에이전트별 접기/펼치기, 다국어)
│   └── i18n/
│       ├── en.ts      # 영어 UI 라벨 + 페르소나 대화
│       └── ko.ts      # 한국어 UI 라벨 + 페르소나 대화
├── docs/
│   └── installation.md # LLM 에이전트용 설치 가이드
├── package.json
├── tsconfig.json
├── LICENSE
└── README.md
```

---

## 📋 요구사항

- [OpenCode](https://opencode.ai) with plugin support (`@opencode-ai/plugin` >= 1.4.3)
- 에이전트 오케스트레이션 플러그인 (oh-my-opencode, oh-my-opencode-slim 등)

---

## 🗑️ 제거

1. `~/.config/opencode/opencode.json`에서 `"opencode-time-travel@latest"` 제거
2. `~/.config/opencode/tui.json`에서 `["opencode-time-travel@latest", ...]` 제거
3. OpenCode 재시작
4. (선택) IPC 파일 정리:
```bash
rm -f /tmp/time-travel-timeline.json /tmp/time-travel-models.json /tmp/omo-pending.json /tmp/omo-mode.json
```

---

## ⚠️ 알려진 제한

- `tool.execute.before`가 툴 호출당 2번 발동 — 200ms 데듀프 윈도우로 처리
- 모델 탐지는 `experimental.chat.system.transform`에 의존 — 향후 OpenCode 버전에서 API 변경 가능
- 시스템 프롬프트 키워드 매칭은 oh-my-opencode의 내부 프롬프트 형식과 결합되어 있음
- Server ↔ TUI 통신은 `/tmp/` 기반 파일 IPC — 네트워크 파일시스템에서는 동작하지 않을 수 있음

---

## 📄 라이선스

[MIT](LICENSE)

---

## 🙏 크레딧

- [omo-olympus](https://github.com/akasai/omo-olympus) — 그리스 신화 페르소나 시스템, 파일 기반 IPC 패턴, 에이전트 추론 로직 (본 프로젝트에 통합됨)
- [oh-my-opencode](https://github.com/nicepkg/oh-my-opencode) — 에이전트 아키텍처와 서브에이전트 타입 정의
- [OpenCode](https://opencode.ai) — 플러그인 API와 TUI 프레임워크