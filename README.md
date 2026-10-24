# SDET Skills — Test Automation Made Simple

> **No coding expertise required.** This toolkit lets anyone create, run, and manage automated tests using plain English commands.

---

## What Is This?

**SDET Skills** is a collection of **51 ready-to-use commands** that automate the entire testing process — from reading your requirements to running tests in your CI/CD pipeline.

Think of it as a **testing assistant that lives inside your terminal**. You type simple commands like `/sdet-analyze` and it does the heavy lifting: reading requirements, writing test cases, generating code, running tests, and reporting results.

### Who Is This For?

| If you are... | This helps you... |
|---------------|-------------------|
| **Product Manager / BA** | Turn requirements into test cases instantly — no coding needed |
| **QA Engineer / Tester** | Automate repetitive test creation and execution |
| **Developer** | Get tests written for you while you focus on features |
| **Engineering Manager** | See quality metrics, coverage, and release readiness at a glance |
| **Compliance Officer** | Generate audit-ready evidence packages automatically |

---

## What Can It Do? (In Plain English)

### The Core 8-Step Pipeline

```
📋 READ REQUIREMENTS
      ↓
📝 WRITE TEST CASES (Excel)
      ↓
✅ CHECK TEST QUALITY
      ↓
🤖 GENERATE AUTOMATION CODE
      ↓
▶️  RUN TESTS
      ↓
📊 ANALYZE RESULTS
      ↓
🚀 CREATE CI/CD PIPELINE
```

| Step | Command | What It Does | Output |
|------|---------|--------------|--------|
| 1 | `/sdet-analyze` | Reads your requirements (Jira, Confluence, PDF, OpenAPI, GitHub, or plain text) and converts them to structured data | `structured-requirements.json` |
| 2 | `/sdet-generate` | Creates professional Excel test cases with positive, negative, and edge cases | `test-cases.xlsx` |
| 3 | `/sdet-validate` | Checks your test cases for completeness, duplicates, missing traceability | Validation report + annotated Excel |
| 4 | `/sdet-automate` | Writes actual test code (Playwright, Cypress, k6, etc.) from your Excel | Ready-to-run test scripts |
| 5 | `/sdet-execute` | Runs your tests in parallel, retries flaky ones, captures screenshots/videos | Test results + reports |
| 6 | `/sdet-analyze-results` | Updates Excel with pass/fail, links failures to requirements, creates defect tickets | Updated Excel + traceability matrix |
| 7 | `/sdet-deploy` | Generates CI/CD pipeline files for GitHub Actions, GitLab, Jenkins, Azure, etc. | `.github/workflows/...` |
| 8 | `/sdet-orchestrate` | **Runs the entire pipeline above automatically** with checkpoints and approval gates | Complete test run summary |

---

## Quick Start — 5 Minutes to Your First Test Run

### Prerequisites (One-Time Setup)

1. **Install Node.js 18+** → [nodejs.org](https://nodejs.org/)
2. **Install Claude Code CLI** → [claude.ai/code](https://claude.ai/code)
3. **Install VS Code** with **Claude Code extension**

---

### Option A: Team Setup (Recommended — Zero Config Per User)

**Best for teams:** Add SDET skills as a git submodule. Every team member just runs `git clone --recursive` and it works.

```bash
# 1. In YOUR PROJECT repo (do this once):
cd your-project
git submodule add https://github.com/yourorg/sdet-skills.git .sdet-skills
cd .claude && ln -s ../.sdet-skills/.claude/commands commands
git add .gitmodules .sdet-skills .claude/commands .claude/settings.json
git commit -m "Add SDET skills via submodule"

# 2. Team members clone with skills:
git clone --recursive <your-project-repo>
# Open in VS Code → restart → ready to use!
```

**Project `.claude/settings.json` (committed to repo):**
```json
{
  "skills": {
    "autoLoad": true,
    "paths": [
      ".claude/commands",
      ".sdet-skills/.claude/commands"
    ]
  }
}
```

> ✅ **No global install, no per-user path config, fully version-controlled.**

---

### Option B: Global Install (If You Prefer)

```bash
# 1. Clone skill pack
git clone https://github.com/yourorg/sdet-skills.git ~/sdet-skills
cd ~/sdet-skills && npm install && node scripts/install.js

# 2. In EACH project's .claude/settings.json (use ABSOLUTE path):
{
  "skills": {
    "autoLoad": true,
    "paths": [
      ".claude/commands",
      "C:/Users/<YOUR_USERNAME>/.claude/skills/sdet/.claude/commands"
    ]
  }
}
# 3. Restart VS Code completely
```

> ⚠️ **Note:** `skills.paths` with absolute paths may not work in current VS Code extension. Use **Option A (submodule + symlink)** for reliable skill loading.

---

### Verify It Works

After setup, **fully restart VS Code** (close all windows → reopen project), then in **Claude Code chat panel**:

```bash
/skill-doctor
# Should show 50+ SDET skills loaded

/sdet-analyze --help
# Should show help output
```

> **Type slash commands in the Claude Code chat panel (sidebar), NOT in the terminal.**

### Your First Test Run (After Option A Setup)

```bash
# 1. In your project (already has .sdet-skills submodule + symlink)
# 2. Add your requirements
mkdir -p requirements
cat > ./requirements/login.md << 'EOF'
# User Login

## REQ-001: Valid Login
As a registered user
I want to log in with valid credentials
So that I can access my dashboard

Acceptance Criteria:
- User enters valid email and password
- System redirects to dashboard
- Session token is created

## REQ-002: Invalid Password
As a registered user
I want to see an error when password is wrong
So that I know my credentials are incorrect

Acceptance Criteria:
- User enters valid email but wrong password
- System shows "Invalid credentials" error
- User stays on login page
EOF

# 3. Run the FULL pipeline (this does everything!)
/sdet-orchestrate --workflow quick --autoApprove
```

**That's it.** In ~2-3 minutes you'll have:
- ✅ Structured requirements parsed from your markdown → `artifacts/requirements/structured-requirements.json`
- ✅ ~10-15 test cases in Excel → `artifacts/test-cases/test-cases-*.xlsx`
- ✅ Validation report → `artifacts/validation/validation-report.json`
- ✅ Playwright test code for UI + API → `tests/ui/`, `tests/api/`
- ✅ Test execution results with screenshots → `artifacts/results/`
- ✅ Updated Excel with pass/fail status → `artifacts/test-cases/test-cases-results-*.xlsx`
- ✅ Traceability matrix linking tests → requirements → `artifacts/traceability/traceability-matrix.xlsx`

---

## Common Workflows (Pick One)

### 🎯 "I want to test my web app daily" — **Quick Workflow**
```bash
/sdet-orchestrate --workflow quick --autoApprove
```
*Generates UI + API tests, runs them, gives you results. Perfect for PR validation.*

### 🔒 "I need security/compliance testing" — **Security Workflow**
```bash
/sdet-orchestrate --workflow security
```
*Runs SAST, DAST, dependency scanning, secrets detection, and compliance checks.*

### ⚡ "I need load/performance testing" — **Performance Workflow**
```bash
/sdet-orchestrate --workflow performance
```
*Runs load, stress, soak, and spike tests with k6. Finds bottlenecks automatically.*

### 🏭 "I want full release validation" — **Full Workflow**
```bash
/sdet-orchestrate --workflow full
```
*Complete pipeline with human approval gates. Use for production releases.*

### 🔄 "My run failed halfway — resume it"
```bash
/sdet-orchestrate --resume run-20240115-abc123
```
*Continues from the last checkpoint — no re-running from scratch.*

---

## All 51 Commands — Grouped by Purpose

### 📋 Test Design & Planning (6)
| Command | Purpose |
|---------|---------|
| `/sdet-plan` | Creates test plan/strategy documents (IEEE 829, ISO 29119) |
| `/sdet-estimate` | Estimates how long testing will take (multiple methods) |
| `/sdet-prioritize` | Ranks tests by risk/value — run the most important ones first |
| `/sdet-coverage` | Shows what's tested vs. what's not (code, requirements, risk) |
| `/sdet-trace` | Maps every test to its requirement (bidirectional) |
| `/sdet-review` | Manages peer review of test cases with checklists |

### 🗃️ Test Data & Environments (5)
| Command | Purpose |
|---------|---------|
| `/sdet-data` | Generates realistic test data (synthetic, cloned, masked) |
| `/sdet-mask` | Hides PII/sensitive data for GDPR, HIPAA, PCI compliance |
| `/sdet-mock` | Creates fake APIs/services so you can test without real backends |
| `/sdet-env` | Spins up test environments (Kubernetes, Docker, VMs, cloud) |
| `/sdet-seed` | Sets up database state before tests, cleans up after |

### 🔬 Specialized Testing (12)
| Command | Purpose |
|---------|---------|
| `/sdet-ui` | Visual regression — catches UI changes pixel-by-pixel |
| `/sdet-mobile` | Tests iOS/Android apps (Appium, Detox, Maestro, XCUITest) |
| `/sdet-api-fuzz` | Bombards APIs with random/invalid data to find crashes |
| `/sdet-contract` | Ensures API consumers/providers stay compatible (Pact) |
| `/sdet-chaos` | Breaks things on purpose (kills pods, adds latency) to test resilience |
| `/sdet-load` | Load, stress, soak, spike, breakpoint testing (k6, Gatling, JMeter) |
| `/sdet-perf-profile` | Deep profiling — finds CPU, memory, GC, lock bottlenecks |
| `/sdet-security` | SAST, DAST, SCA, secrets, container, IaC scanning |
| `/sdet-accessibility` | WCAG 2.1/2.2 AA/AAA compliance testing |
| `/sdet-compliance` | GDPR, HIPAA, PCI-DSS, SOX, FDA, ISO 27001, SOC2 testing |
| `/sdet-explore` | Guided exploratory testing sessions with charters |
| `/sdet-usability` | Coordinates real-user usability studies |

### 🧠 Quality Intelligence (6)
| Command | Purpose |
|---------|---------|
| `/sdet-flake` | Finds and quarantines flaky tests automatically |
| `/sdet-mutate` | Mutation testing — are your tests actually catching bugs? |
| `/sdet-predict` | ML-powered: predicts which tests will fail next run |
| `/sdet-autoheal` | Self-healing: fixes broken selectors/assertions automatically |
| `/sdet-rootcause` | Analyzes failures and tells you the root cause |
| `/sdet-insights` | Dashboards for executives, managers, teams, developers |

### 🐛 Defect & Release (4)
| Command | Purpose |
|---------|---------|
| `/sdet-defect` | Creates, updates, links, verifies, closes defects (Jira, GitHub, GitLab) |
| `/sdet-triage` | Auto-routes defects to the right team/person |
| `/sdet-release` | Go/No-Go gate — checks all criteria before release |
| `/sdet-rollback` | Auto-rolls back deployments on SLO breach |

### 🔗 Platform & Integration (4)
| Command | Purpose |
|---------|---------|
| `/sdet-service-map` | Discovers your microservices topology and test impact |
| `/sdet-migrate` | Converts tests between frameworks (Cypress → Playwright, JUnit → TestNG) |
| `/sdet-backport` | Copies tests to older maintenance branches |
| `/sdet-monitor` | Turns tests into 24/7 synthetic monitors (Datadog, New Relic, Grafana) |

### 👥 Team & Process (6)
| Command | Purpose |
|---------|---------|
| `/sdet-dashboard` | Living docs from tests (HTML, Confluence, Notion, Allure) |
| `/sdet-retro` | Data-driven sprint retrospectives with action items |
| `/sdet-onboard` | Generates onboarding guides for new team members |
| `/sdet-governance` | Enforces testing standards (advisory/warning/blocking) |
| `/sdet-audit` | Packages evidence for SOC2, ISO27001, SOX, HIPAA audits |
| `/sdet-report` | Executive/technical reports (PDF, PPTX, HTML, Confluence) |

---

## Understanding the Outputs

### What You'll See in Your Project Folder

```
my-project/
├── artifacts/                    # All generated outputs
│   ├── requirements/             # Parsed requirements
│   │   └── structured-requirements.json
│   ├── test-cases/               # Excel test cases
│   │   ├── test-cases-20240115.xlsx
│   │   └── test-cases-results-20240115.xlsx  ← Updated with pass/fail
│   ├── validation/               # Quality checks
│   │   └── validation-report.json
│   ├── results/                  # Test execution results
│   │   ├── ui/
│   │   ├── api/
│   │   └── execution-summary.json
│   ├── traceability/             # Test ↔ Requirement links
│   │   └── traceability-matrix.xlsx
│   ├── orchestration/            # Pipeline run summaries
│   └── checkpoints/              # Resume points for failed runs
├── tests/                        # Generated automation code
│   ├── ui/                       # Playwright/Cypress tests
│   ├── api/                      # Pactum/k6 tests
│   ├── security/
│   ├── performance/
│   └── accessibility/
└── sdet.config.yaml              # Your project configuration
```

### Example: What a Test Case Excel Looks Like

| ID | Requirement | Test Case | Type | Priority | Steps | Expected Result |
|----|-------------|-----------|------|----------|-------|-----------------|
| TC-001 | REQ-001 | Valid login | Positive | Critical | 1. Go to /login<br>2. Enter valid email<br>3. Enter valid password<br>4. Click Login | Redirected to dashboard |
| TC-002 | REQ-001 | Empty email | Negative | High | 1. Go to /login<br>2. Leave email empty<br>3. Enter valid password<br>4. Click Login | "Email required" error |
| TC-003 | REQ-002 | Wrong password | Negative | Critical | 1. Go to /login<br>2. Enter valid email<br>3. Enter wrong password<br>4. Click Login | "Invalid credentials" error |

---

## Configuration — Make It Yours

Create `sdet.config.yaml` in your project root:

```yaml
# Basic project info
project:
  id: "my-app"
  name: "My Application"

# Pick which skills to enable
skills:
  analyze:
    enabled: true
    config:
      llmProvider: "anthropic"    # or "openai"
      model: "claude-3-5-sonnet"
  
  generate:
    enabled: true
    config:
      templatePath: "./templates/excel/standard.xlsx"
      includeNegativeTests: true
      includeBoundaryTests: true
  
  automate:
    enabled: true
    config:
      ui:
        framework: "playwright"   # or "cypress", "appium"
        pattern: "pom"            # Page Object Model
      api:
        framework: "pactum"       # or "k6", "rest-assured"
  
  execute:
    enabled: true
    config:
      parallel: 4                 # Run 4 tests at once
      retry: 2                    # Retry failed tests twice
      shardStrategy: "duration"   # Smart test distribution

# Pipeline settings
orchestration:
  defaultWorkflow: "quick"
  workflows:
    - id: "quick"
      stages:
        - id: "generate"
          skills: ["generate"]
        - id: "validate"
          skills: ["validate"]
          dependsOn: ["generate"]
        - id: "automate"
          skills: ["automate"]
          dependsOn: ["validate"]
        - id: "execute"
          skills: ["execute"]
          dependsOn: ["automate"]
        - id: "analyze-results"
          skills: ["analyze-results"]
          dependsOn: ["execute"]

# Where to store things
runtime:
  stateStore:
    type: "file"
    path: ".sdet/state.json"
  artifactStore:
    type: "local"
    path: "artifacts"
```

---

## Glossary — Terms Made Simple

| Term | Plain English |
|------|---------------|
| **SDET** | Software Development Engineer in Test — a tester who writes code |
| **Traceability** | A map linking each test to the requirement it verifies |
| **CI/CD** | Continuous Integration / Continuous Deployment — automated build/test/deploy |
| **Pipeline** | A series of automated steps that run in order |
| **Orchestration** | Running multiple steps automatically with coordination |
| **Checkpoint** | A save point — if something fails, you resume from here |
| **Flaky Test** | A test that sometimes passes, sometimes fails (unreliable) |
| **Sharding** | Splitting tests across multiple machines to run faster |
| **Quality Gate** | A checkpoint that stops the pipeline if quality is too low |
| **SAST/DAST/SCA** | Static/Dynamic/Software Composition Analysis — security scan types |
| **Synthetic Monitoring** | Running tests 24/7 in production to detect issues |
| **Mutation Testing** | Deliberately breaking code to see if tests catch it |
| **Page Object Model** | Organizing UI test code by page (login page, dashboard page, etc.) |

---

## Troubleshooting — Common Issues

### "Command not found: /sdet-xxx" or Skills Not Loading

**Most likely cause:** VS Code extension doesn't load skills from `skills.paths` (known limitation in current version).

**✅ Fix — Use Submodule + Symlink (Recommended):**
```bash
# In your project:
git submodule add https://github.com/yourorg/sdet-skills.git .sdet-skills
cd .claude && ln -s ../.sdet-skills/.claude/commands commands
git add .gitmodules .sdet-skills .claude/commands .claude/settings.json
git commit -m "Add SDET skills"

# Then: Close ALL VS Code windows → Reopen project → Test
/skill-doctor  # Should show 50+ SDET skills
```

**✅ Fix — If Using Global Install:**
```bash
# Ensure settings.json has the absolute path, then FULLY restart VS Code
# (Close ALL windows, wait 3s, reopen project only)
```

**❌ Don't type slash commands in terminal** — Type them in **Claude Code chat panel** (sidebar).

---

### "npm install fails"
**Fix:** 
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### "Tests fail with 'element not found'"
**Fix:** Run with headed mode to see what's happening:
```bash
/sdet-execute --headed true
```
Or use auto-heal:
```bash
/sdet-autoheal --mode auto-apply
```

### "Pipeline runs but produces no output"
**Fix:** Check the context file:
```bash
cat .claude/context/sdet-context.json
```
Look for `"status": "failed"` in any skill.

### "Out of memory / slow execution"
**Fix:** Reduce parallelism:
```bash
/sdet-execute --parallel 2
```

### "Pipeline creates sample requirements instead of using mine"
**Fix:** Ensure requirements exist in `requirements/` folder at project root:
```bash
ls requirements/
# Should show your .md files (e.g., login.md)
```
The pipeline auto-discovers `requirements/` in the project root where VS Code is opened.

---

## FAQ

**Q: Do I need to know coding?**
A: No. The commands generate code for you. You only need to provide requirements (in plain text, markdown, Jira, etc.).

**Q: Can I use this with my existing tests?**
A: Yes. `/sdet-migrate` converts from Cypress, JUnit, TestNG, etc. `/sdet-validate` checks your existing Excel test cases.

**Q: What if I only want UI testing?**
A: Run individual skills: `/sdet-automate --type ui --framework playwright`

**Q: Does it work with my CI/CD?**
A: `/sdet-deploy` supports GitHub Actions, GitLab CI, Jenkins, Azure DevOps, CircleCI, Bitbucket, Tekton.

**Q: How does the ML stuff work?**
A: Pre-trained ONNX models run locally (no data leaves your machine). They predict flaky tests, prioritize test runs, and find root causes.

**Q: Can I customize the Excel template?**
A: Yes — copy `templates/excel/standard.xlsx`, modify it, and point `templatePath` in config to your version.

**Q: Is my data sent anywhere?**
A: Only if you configure an LLM provider (Anthropic/OpenAI) for requirement analysis. All test execution, ML models, and reporting run locally.

---

## Getting Help

| Resource | Link |
|----------|------|
| 📚 Full Skill Reference | `docs/skill-reference.md` |
| 🏗️ Architecture Deep Dive | `docs/architecture.md` |
| 🛠️ Extending with Custom Skills | `docs/extending.md` |
| 🔄 Workflow Examples | `docs/workflow-examples.md` |
| ❓ Troubleshooting Guide | `docs/troubleshooting.md` |
| 📦 Migration Guide | `docs/migration-guide.md` |

---

## License

MIT License — free for personal and commercial use.

---

## A Note from the Authors

> **We built this because testing shouldn't be the bottleneck.**
> 
> Whether you're a solo developer, a QA team of 50, or a compliance officer needing audit trails — these skills handle the repetitive work so you can focus on what matters: **shipping quality software with confidence.**
> 
> — The SDET Skills Team

---

*Last updated: 2026-10-23 | Version 2.0 | [Changelog](CHANGELOG.md)*