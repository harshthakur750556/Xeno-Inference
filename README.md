<div align="center">

# X E N O &nbsp; I N F E R E N C E

```
  ██████╗  ██╗  ███████╗ ███╗   ██╗  ██████╗ 
  ╚════██╗ ██║  ██╔════╝ ████╗  ██║ ██╔═══██╗
   █████╔╝ ██║  █████╗   ██╔██╗ ██║ ██║   ██║
  ██╔═══╝  ██║  ██╔══╝   ██║╚██╗██║ ██║   ██║
  ███████╗ ██║  ███████╗ ██║ ╚████║ ╚██████╔╝
  ╚══════╝ ╚═╝  ╚══════╝ ╚═╝  ╚═══╝  ╚═════╝ 
        HIGH-THROUGHPUT NEURAL ACCELERATION ENGINE
```

<p align="center">
  <b>Architectural Monolith for Real-Time LLM Token Streaming & Tensor Telemetry</b><br>
  Engineered with TypeScript, React 19, and Native Rust Axum Runtimes.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/REACT-19.0-000000?style=flat-square&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TYPESCRIPT-5.7-000000?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/RUST-1.85-000000?style=flat-square&logo=rust&logoColor=white" alt="Rust" />
  <img src="https://img.shields.io/badge/AXUM-0.8-000000?style=flat-square&logo=rust&logoColor=white" alt="Axum" />
  <img src="https://img.shields.io/badge/TOKIO-ASYNC-000000?style=flat-square&logo=rust&logoColor=white" alt="Tokio" />
  <img src="https://img.shields.io/badge/TAILWIND-V4-000000?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/VERCEL-DEPLOYED-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

</div>

## OVERVIEW

Xeno Inference is an AI inference workstation engineered for high-density neural computation, low-latency token streaming, and real-time hardware telemetry. 

The system couples a **TypeScript React** frontend with an asynchronous **Rust Axum/Tokio** backend daemon, delivering deterministic token emission pipelines with sub-100ms Time-To-First-Token (TTFT).

```
+-------------------------------------------------------------------------------+
|                             CLIENT WORKSPACE (TS)                             |
|  +-------------------------------------------------------------------------+  |
|  | [10s Split Welcome]  [Streaming Chat]  [Reasoning HUD]  [Telemetry HUD] |  |
|  +-------------------------------------------------------------------------+  |
|                                     |                                         |
|                         HTTP / SSE EventStream                                |
|                                     v                                         |
|                             RUST DAEMON (AXUM)                                |
|  +-------------------------------------------------------------------------+  |
|  |  Axum Router <---> Tokio Async Engine <---> SIMD Tensor Quantization    |  |
|  |  Atomic Telemetry Collector           <---> PagedAttention KV-Buffer    |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

---

## ARCHITECTURAL CAPABILITIES

### 1. 10-Second Split Startup Sequence

- **Pure Black Void Aesthetic (`#000000`)**: Deep-contrast monochromatic visual architecture.
- **Two-Line Monolithic Typography**:
  - `XENO` in Roman Serif (*Cinzel*) with wide letter tracking.
  - `Inference` in Calligraphy cursive script (*Alex Brush*) appearing with smooth stroke opacity transitions.
- **Unboxed 3-Line Rolling Command Stream**:
  - Live kernel execution logs displayed in a borderless 3-line rolling viewport.
  - Realistic execution cadence with inline ASCII allocation meters:
    - `> [VRAM] KV-Cache Allocation: [████████░░░░░░░░] 50% (16.0 GB)`
    - `> [VRAM] PagedAttention Buffer: [████████████████] 100% (32.0 GB Ready)`
    - `> [QUANT] Calibrating BF16 / FP8: [████████████░░░░] 75% (SIMD Active)`
    - `> [SPARSE] Attention Density:  ▂▃▅▆▇█▇▆▅▃  (128k context verified)`
    - `> [BRIDGE] IPC Channel with Rust Daemon: [████████████████] 100% (<0.4ms)`
  - Older lines slide upward and fade into the background.
- **Precision Hairline Progress Track**: 2px linear progression indicator calibrated to the 10.0s sequence.
- **Static Vector Artwork**: 22-path vector filigree rendered with `geometricPrecision` in high-contrast monochrome silver.

---

### 2. High-Throughput Inference Console

- **Zero-Latency SSE Streaming**: High-speed token generation with real-time word rendering.
- **DeepSeek-R1 Chain of Thought**: Collapsible neural reasoning drawer displaying step-by-step logic traces.
- **Multi-Model Selector**:
  - `xeno-deepseek-r1` // 70B MoE Deep Reasoning Architecture
  - `xeno-70b-ultra` // 70B Flagship Generalist Tensor Pipeline
  - `xeno-llama-3.3` // 70B Instruct Dense Transformer
  - `xeno-quantum-8b` // 8B Ultra-Fast Edge Kernel
- **Hardware Telemetry HUD**: Live metrics monitoring VRAM allocation, active SSE connections, and memory bandwidth (GB/s).
- **Throughput Micro-Benchmark Tool**: Automated evaluation harness measuring token emission velocity (tok/s) and TTFT latency.

---

## SYSTEM REPOSITORY STRUCTURE

```
Xeno-Inference/
├── frontend/                         # TypeScript / React 19 Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ButterflySvg.tsx      # Sharp monochrome vector artwork
│   │   │   ├── XenoLogo.tsx          # Minimalist geometric XENO nexus emblem
│   │   │   ├── SplashIntro.tsx       # 10s split-screen startup sequence
│   │   │   ├── ChatInterface.tsx     # Monochromatic AI streaming workspace
│   │   │   ├── ThinkingBlock.tsx     # Chain-of-thought accordion
│   │   │   ├── CodeBlock.tsx         # Syntax-highlighted code container
│   │   │   ├── TelemetryModal.tsx    # Rust engine metrics HUD
│   │   │   ├── BenchmarkModal.tsx    # Throughput benchmark runner
│   │   │   └── SettingsModal.tsx     # Inference hyperparameters modal
│   │   ├── services/
│   │   │   └── api.ts                # Axum SSE client & fallback simulation
│   │   ├── types.ts                  # TypeScript schemas & DTOs
│   │   ├── index.css                 # Monochrome base styling & typography
│   │   └── App.tsx                   # Master router & state transitions
│   ├── public/
│   │   └── favicon.svg               # Application emblem
│   ├── vercel.json                   # Subdirectory deployment configuration
│   ├── package.json
│   └── vite.config.ts
├── backend/                          # Native Rust Engine (Axum + Tokio)
│   ├── src/
│   │   ├── main.rs                   # Axum HTTP/SSE server & router
│   │   ├── models.rs                 # Serde DTOs & token stream structures
│   │   ├── engine.rs                 # Neural tensor synthesis pipeline
│   │   └── telemetry.rs              # Atomic telemetry counter
│   ├── server.js                     # High-speed local SSE fallback daemon
│   └── Cargo.toml                    # Rust dependencies
├── vercel.json                       # Root repository deployment configuration
├── package.json                      # Workspace scripts
└── start-dev.js                      # Concurrent process runner
```

---

## API SPECIFICATION

The backend daemon exposes REST and Server-Sent Events (SSE) endpoints on port `3001`:

| Method | Endpoint | Description | Response Type |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Daemon status, memory allocation, and version | `application/json` |
| `GET` | `/api/models` | Supported model catalog and context windows | `application/json` |
| `POST` | `/api/chat/stream` | Real-time Server-Sent Events token stream | `text/event-stream` |
| `POST` | `/api/benchmark` | Forward-pass latency micro-benchmark | `application/json` |
| `GET` | `/api/telemetry` | Atomic engine metrics, VRAM usage, bandwidth | `application/json` |

---

## QUICKSTART

### Requirements
- Node.js `v18+` (Tested on Node `v26.x`)
- Rust & Cargo (Optional for compiling native Rust binary)

### Installation & Execution

```bash
# Clone repository
git clone https://github.com/harshthakur750556/Xeno-Inference.git
cd Xeno-Inference

# Install frontend dependencies
cd frontend && npm install && cd ..

# Launch development environment (Frontend + Backend concurrently)
npm run dev
```

### Direct Subsystem Commands

```bash
# Frontend only (Vite on http://localhost:5173)
npm run dev:frontend

# Backend only (SSE Daemon on http://localhost:3001)
npm run dev:backend

# Production build
npm run build:frontend
```

---

## VERCEL DEPLOYMENT CONFIGURATION

When deploying to Vercel:

| Parameter | Recommended Value |
| :--- | :--- |
| **Root Directory** | `frontend` |
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

> Root and frontend `vercel.json` configurations are pre-configured in the repository for zero-configuration deployments.

---

<div align="center">

```
[+] XENO INFERENCE // DETERMINISTIC COMPUTE // VERSION 4.2
```

**Designed and Built for Next-Generation Neural Acceleration.**

</div>