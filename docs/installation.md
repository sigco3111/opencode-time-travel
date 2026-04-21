# Installation Guide — opencode-time-travel

> For AI agents (Claude Code, OpenCode, Cursor, etc.): Follow these steps to install the plugin.

## Prerequisites

- [OpenCode](https://opencode.ai) with plugin support (`@opencode-ai/plugin` >= 1.4.3)
- Agent orchestration plugin (oh-my-opencode, oh-my-opencode-slim, etc.)

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/sigco3111/opencode-time-travel.git
cd opencode-time-travel
```

## Step 2: Configure the Server Plugin

Add the server plugin path to `~/.config/opencode/opencode.json`:

```json
{
  "plugin": ["./path/to/opencode-time-travel/src/server.ts"]
}
```

Replace `./path/to/opencode-time-travel` with the actual absolute or relative path to the cloned repository.

Example using absolute path:

```json
{
  "plugin": ["/home/user/projects/opencode-time-travel/src/server.ts"]
}
```

## Step 3: Configure the TUI Plugin

Add the TUI plugin to `~/.config/opencode/tui.json`:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [
    ["./path/to/opencode-time-travel/src/tui.tsx", { "enabled": true }]
  ]
}
```

With options:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [
    ["./path/to/opencode-time-travel/src/tui.tsx", {
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

## Step 4: Restart OpenCode

Both plugins load on startup. After restarting OpenCode, you should see the agent persona sidebar and Timeline section.

---

## Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `enabled` | `true` | Enable/disable the TUI plugin |
| `locale` | `"en"` | Language: `"en"` or `"ko"` — affects persona dialogue only; UI labels always English |
| `maxEntries` | `50` | Max timeline entries displayed |
| `showTimestamps` | `true` | Show timestamps in timeline |
| `showModels` | `true` | Show shortened model names per agent (provider prefix removed) |
| `showPersonas` | `true` | Show agent persona section (disable to see timeline only) |
| `compact` | `false` | Compact mode (emojis only) |
| `collapsedAgents` | `false` | Start with all agent timelines collapsed |

---

## Uninstall

1. Remove the server plugin entry from `~/.config/opencode/opencode.json`
2. Remove the TUI plugin entry from `~/.config/opencode/tui.json`
3. Restart OpenCode
4. (Optional) Clean up IPC files:
```bash
rm -f /tmp/time-travel-timeline.json /tmp/time-travel-models.json /tmp/omo-pending.json /tmp/omo-mode.json
```

---

## Troubleshooting

### Plugin not showing

- Verify the file paths in your config are correct (use absolute paths if relative paths don't work)
- Ensure `@opencode-ai/plugin` >= 1.4.3 is installed
- Check that oh-my-opencode or a compatible orchestration plugin is also installed

### Personas not activating

- The server plugin must be loaded for the TUI plugin to receive events
- Check that `/tmp/omo-pending.json` is being created when agents fire

### Timeline not updating

- Check that `/tmp/time-travel-timeline.json` exists and has entries
- The `maxEntries` config may be filtering entries — try increasing it
