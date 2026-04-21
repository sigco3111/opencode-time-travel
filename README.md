# ⏳ opencode-time-travel

> 세션 타임라인 리플레이 — OpenCode 서브에이전트 활동 모니터링 & 모델 표시

**English** | [한국어](#) (현재 문서)

---

## 개요

`opencode-time-travel`은 OpenCode에서 실행되는 모든 서브에이전트의 활동을 실시간 타임라인으로 기록하고 시각화하는 플러그인입니다.

oh-my-opencode가 에이전트를 병렬로 실행할 때, 백그라운드에서 무슨 일이 벌어지고 있는지 전혀 보이지 않는 문제를 해결합니다. **Sisyphus-Jr, Explorer, Librarian, Oracle, Metis, Momus, Prometheus** — 각 에이전트가 언제 시작되고, 어떤 툴을 호출하고, 어떤 모델을 사용하는지 시간순으로 한눈에 파악할 수 있습니다.

omo-olympus의 그리스 신화 페르소나 시각화와 완벽히 호환됩니다. omo-olympus가 **"누가 일하고 있는가"**를 보여준다면, time-travel은 **"무슨 일을 하고 있는가"**를 보여줍니다.

```
▼ ⏳ Time Travel ──────────────────────────────
  🪨 Sisyphus        anthropic/claude-sonnet-4  [busy]
    12:03:14  🔧 bash: npm test
    12:03:12  📄 read: src/index.ts
  🔍 Explorer       anthropic/claude-sonnet-4  [busy]
    12:03:10  🔧 bash: rg "TODO" src/
    12:03:08  📄 read: package.json
  📚 Librarian      google/gemini-2.5-pro      [done] ✓
    12:02:55  📄 read: docs/api.md
  🧙 Oracle         google/gemini-2.5-pro      [done] ✓
    12:02:40  🔧 bash: cargo test --all
  🧗 Sisyphus-Jr    anthropic/claude-haiku-3.5  [busy]
    12:03:15  ✏️ write: src/utils.ts
───────────────────────────────────────────────
  3 active · 2 done · 0 error
```

---

## ✨ 기능

| 기능 | 설명 |
|------|------|
| 📜 **세션 타임라인** | 모든 에이전트 활동을 시간순으로 기록하고 시각화 |
| 🤖 **서브에이전트 모니터링** | Sisyphus, Sisyphus-Jr, Explorer, Librarian, Oracle, Metis, Momus, Prometheus 전체 추적 |
| 🏷️ **모델 표시** | 각 에이전트가 사용 중인 모델명을 실시간으로 표시 |
| 🎨 **테마 인식** | OpenCode 테마를 자동으로 읽어 색상 적용 |
| ⚡ **실시간 업데이트** | Solid.js 반응형 시그널 기반, 에이전트가 일하면 즉시 반영 |
| 📂 **접기/펼치기** | 사이드바 헤더 클릭으로 접고 펼치기, 접힌 상태에선 활성 에이전트 수만 표시 |
| 🔇 **자동 슬립** | 완료된 에이전트는 3초 후 💤 상태로 전환 |
| ❌ **에러 감지** | 에이전트 오류 발생 시 에러 대화 표시 (5초간) |
| 🔄 **동시 실행 추적** | 동일 에이전트의 여러 인스턴스를 동시에 추적, 모두 끝나야 슬립 |
| 🧩 **omo-olympus 호환** | 충돌 없이 함께 사용 가능 — 페르소나 + 타임라인 동시 시각화 |

---

## 🤖 지원 에이전트

| 에이전트 | 역할 | 이모지 | 출처 |
|---------|------|--------|------|
| **Sisyphus** | 메인 빌드 에이전트 | 🪨 | oh-my-opencode (Plan 모드) |
| **Sisyphus-Jr** | 보조 빌드 에이전트 | 🧗 | oh-my-opencode (background_task) |
| **Explorer** | 코드베이스 탐색 | 🔍 | oh-my-opencode |
| **Librarian** | 문서 참조 및 크로스체크 | 📚 | oh-my-opencode |
| **Oracle** | 깊은 분석 및 컨설팅 | 🧙 | oh-my-opencode |
| **Metis** | 설계 및 스코프 정의 | 🦉 | oh-my-opencode |
| **Momus** | 브루탈 코드 리뷰 | 🎭 | oh-my-opencode |
| **Prometheus** | 계획 수립 | 🔥 | oh-my-opencode (Build 모드) |

---

## 📦 설치

### npm으로 설치 (권장)

**1. Server 플러그인 설정**

`~/.config/opencode/opencode.json`:
```json
{
  "plugin": ["opencode-time-travel@latest"]
}
```

**2. TUI 플러그인 설정**

`~/.config/opencode/tui.json`:
```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [["opencode-time-travel@latest", { "enabled": true }]]
}
```

**3. OpenCode 재시작**

두 플러그인 모두 시작 시 로드됩니다. 재시작하세요.

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
  "plugin": [["./plugins/time-travel.tsx", { "enabled": true }]]
}
```

---

## ⚙️ 작동 원리

### 아키텍처

```
┌─────────────────────────────────────────────────┐
│                  OpenCode Core                   │
│                                                   │
│  session.created  tool.execute.before/after      │
│  session.status   session.error  file.edited     │
│  session.deleted  session.compacted              │
│         │                                         │
│         ▼                                         │
│  ┌──────────────────────┐                        │
│  │   Server Plugin      │                        │
│  │  (src/server.ts)     │                        │
│  │                      │                        │
│  │  • 이벤트 수집        │                        │
│  │  • 에이전트 추론      │                        │
│  │  • 모델 탐지          │                        │
│  │  • 타임라인 기록      │                        │
│  └──────┬──────┬────────┘                        │
│         │      │                                  │
│    JSON 파일  JSON 파일                           │
│   (timeline) (models)                            │
│         │      │                                  │
│         ▼      ▼                                  │
│  ┌──────────────────────┐                        │
│  │   TUI Plugin         │                        │
│  │  (src/tui.tsx)       │                        │
│  │                      │                        │
│  │  • Solid.js 시그널    │                        │
│  │  • 사이드바 렌더링    │                        │
│  │  • 타임라인 표시      │                        │
│  │  • 모델 뱃지 표시     │                        │
│  └──────────────────────┘                        │
│                                                   │
│  ┌──────────────────────┐                        │
│  │  omo-olympus (선택)   │                        │
│  │  페르소나 + 대화 표시  │                        │
│  └──────────────────────┘                        │
└─────────────────────────────────────────────────┘
```

### Server 플러그인 훅

| 훅 | 용도 |
|----|------|
| `tool.execute.before` | task() 호출 감지 → 에이전트 타입 추론 → 타임라인에 기록 |
| `tool.execute.after` | 툴 실행 완료 → 타임라인에 결과 기록 |
| `session.created` | 서브세션 생성 → 에이전트-세션 매핑 |
| `session.status` | busy/idle 상태 변화 → 타임라인 업데이트 |
| `session.error` | 에러 발생 → 타임라인에 에러 기록 |
| `session.deleted` | 세션 종료 → 메모리 정리 |
| `file.edited` | 파일 수정 → 타임라인에 파일 변경 기록 |
| `experimental.chat.system.transform` | 시스템 프롬프트에서 모델명 탐지 |

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

Server와 TUI 플러그인은 파일 기반 IPC로 통신합니다 (omo-olympus와 동일 패턴).

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
  },
  "ses_def456": {
    "agent": "librarian",
    "model": "google/gemini-2.5-pro",
    "startedAt": 1714000000100
  }
}
```

---

## 🧩 omo-olympus와 함께 사용

omo-olympus와 충돌 없이 함께 사용할 수 있습니다. 두 플러그인은 각각 다른 슬롯과 IPC 파일을 사용합니다:

| | omo-olympus | opencode-time-travel |
|--|-------------|---------------------|
| **역할** | 페르소나 + 대화 | 타임라인 + 모델 |
| **IPC 파일** | `/tmp/omo-pending.json` | `/tmp/time-travel-timeline.json` |
| **TUI 슬롯** | `sidebar_content` (order 50) | `sidebar_content` (order 51) |
| **표시 내용** | "I smell a clue" | "12:03:10 🔧 bash: rg TODO" |

결합하면 사이드바에 페르소나 대화와 타임라인이 나란히 표시됩니다:

```
▼ Olympus
  🪨 Sisyphus     Pushing uphill...
  🔍 Explorer     On the trail!
  📚 Librarian    Cross-referencing...

▼ ⏳ Time Travel
  🪨 Sisyphus     claude-sonnet-4    [busy]
    12:03:14  🔧 bash: npm test
  🔍 Explorer     claude-sonnet-4    [busy]
    12:03:10  🔧 bash: rg "TODO" src/
  📚 Librarian    gemini-2.5-pro     [done] ✓
    12:02:55  📄 read: docs/api.md
```

---

## 🔧 설정

### 커스텀 설정 (선택)

`tui.json`에서 옵션을 지정할 수 있습니다:

```json
{
  "plugin": [
    ["opencode-time-travel@latest", {
      "enabled": true,
      "maxEntries": 50,
      "showTimestamps": true,
      "showModels": true,
      "compact": false
    }]
  ]
}
```

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `enabled` | `true` | 플러그인 활성화 여부 |
| `maxEntries` | `50` | 에이전트당 최대 타임라인 항목 수 |
| `showTimestamps` | `true` | 타임스탬프 표시 여부 |
| `showModels` | `true` | 모델명 표시 여부 |
| `compact` | `false` | 컴팩트 모드 (이모지만 표시) |

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
│   ├── server.ts      # Server 플러그인 (이벤트 수집, 에이전트 추론, 모델 탐지)
│   └── tui.tsx        # TUI 플러그인 (Solid.js 사이드바 렌더링)
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
4. (선택) IPC 파일 정리: `rm -f /tmp/time-travel-timeline.json /tmp/time-travel-models.json`

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

- [omo-olympus](https://github.com/akasai/omo-olympus) — 파일 기반 IPC 패턴과 에이전트 추론 로직을 참고했습니다
- [oh-my-opencode](https://github.com/nicepkg/oh-my-opencode) — 에이전트 아키텍처와 서브에이전트 타입 정의를 참고했습니다
- [OpenCode](https://opencode.ai) — 플러그인 API와 TUI 프레임워크
