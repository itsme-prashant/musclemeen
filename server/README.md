# MuscularMen server (optional)

Serves the website and adds two features that need a backend:

- **AI coach**: chat with Claude (`claude-opus-5-5`), which sees the athlete's program, recent workouts and targets. The Anthropic API key stays on the server and is never sent to the browser. Replies stream as they are written. If a message is declined by the model's safety checks, the server's fallback setting retries it on a suitable fallback model.
- **Accounts & cloud sync**:
  - email + password; passwords are salted and hashed with scrypt, and session tokens are stored hashed
  - one cloud copy per user in `data/`

## Run

```bash
npm install
# macOS / Linux
ANTHROPIC_API_KEY=sk-ant-... npm start
# Windows PowerShell
$env:ANTHROPIC_API_KEY="sk-ant-..."; npm start
```

Open http://localhost:8080. Without a key everything works except the coach, which shows setup instructions.

| Variable | Default | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | – | Key for the AI coach (or sign in with `ant auth login`) |
| `PORT` | 8080 | Port to listen on |
| `COACH_MODEL` | `claude-opus-5-5` | Claude model used by the coach |

## Hosting notes

- Put it behind HTTPS (e.g. a reverse proxy) before using it over the internet. Install-as-app and notifications need HTTPS outside `localhost`.
- `data/` holds user accounts and synced data. Back it up, and never serve it publicly (the server already refuses to).
- The rate limiting is basic and in-memory. For a public deployment, add a proper limiter and a real database.
