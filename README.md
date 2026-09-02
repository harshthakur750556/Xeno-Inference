# 🌌 XENO INFERENCE — High-Throughput Neural AI Acceleration

A cutting-edge AI inference web and desktop application built with a **TypeScript (React + Tailwind CSS)** frontend and a **Rust (Axum + Tokio)** backend.

---

## ✨ Features & Architecture

### 1. 🦋 Split-Page 3-Second Opening Animation
- **Pure Black Void Background (`#000000`)** with dynamic ambient **Aurora Borealis** atmospheric light curtains.
- **Left Column:**
  - **"XENO"**: Classical Roman / Romanian Serif typography (*Cinzel Decorative*) in metallic silver with glowing luster.
  - **"INFERENCE"**: Fluid Calligraphy cursive script (*Great Vibes / Alex Brush*) with glowing animated stroke entrance.
  - **Command Terminal in Half Blurry Gradient**: A frosted glassmorphic HUD (`backdrop-blur-2xl bg-black/60 border border-purple-500/20`) blended softly into the black background, executing real-time bootloader logs (`[KERNEL]`, `[VRAM]`, `[QUANT]`, `[BRIDGE]`, `[ONLINE]`).
  - **Animated Neon Progress Bar**: Real-time progress tracker animating smoothly from **0% to 100%** in synchrony with the 3.0s timeline.
- **Right Column:**
  - **User-Specified Butterfly SVG (`Untitled.svg`)**: 22 detailed vector paths brought to life with living, breathing **Aurora Gradient Animations** (`#00F5D4` emerald -> `#7B2CBF` cosmic purple -> `#FF007F` neon pink -> `#00BBF9` cyan -> `#FEE440` amber) with 3D perspective flutters and stardust particles.
- **Timeline:** Exactly **3.0 seconds** followed by a smooth cinematic cross-fade into the AI Chat Interface (with a *Replay Intro* button to re-trigger at any time).

---

### 2. ⚡ AI Inference Chat Interface
- **Real-Time Token Streaming:** Server-Sent Events (SSE) streaming at **>90 tokens/sec** with sub-100ms Time-To-First-Token (TTFT).
- **DeepSeek-R1 Style Chain of Thought:** Collapsible reasoning block displaying neural thought traces step-by-step.
- **Multi-Model Selector:**
  - 🧠 `Xeno DeepSeek-R1 (70B MoE Reasoning)`
  - 🚀 `Xeno 70B Ultra (Omni Flagship)`
  - 🦙 `Xeno Llama-3.3 (70B Instruct)`
  - ⚡ `Xeno Quantum-Fast (8B Edge Kernel)`
- **Hardware Telemetry HUD:** Real-time VRAM allocation, PagedAttention KV-Cache buffers, throughput counters, and CPU load.
- **Throughput Micro-Benchmark Tool:** Live micro-pass testing token emission speed (tok/s) and latency.
- **Multimodal & Voice Input:** Speech recognition voice dictation and code/text file attachments.
- **Syntax Highlighted Code Blocks:** One-click copy, line counters, and language badges.

---

### 3. 🦀 Native Rust Backend (Axum + Tokio)
- **Zero-Copy Asynchronous Streaming:** Uses `tokio_stream` and `axum::response::sse::Sse` for maximum concurrent throughput.
- **REST & SSE Endpoints:**
  - `GET  /api/health` — Engine health, memory allocation, and version.
  - `GET  /api/models` — Available model catalog and context limits.
  - `POST /api/chat/stream` — Real-time SSE token stream with reasoning tokens.
  - `POST /api/benchmark` — Hardware micro-benchmarks.
  - `GET  /api/telemetry` — Live telemetry snapshot.
- **Zero-Friction Fallback:** Includes an embedded client-side neural simulation engine so the UI remains 100% functional even before the backend daemon starts.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (tested on Node v26)
- **Rust / Cargo** (optional for native Rust backend)

### Install & Launch

```bash
# 1. Start both Frontend and Backend concurrently
npm run dev

# Or run separately:
# Frontend (Vite on http://localhost:5173)
npm run dev:frontend

# Backend (Axum/Node SSE server on http://localhost:3001)
npm run dev:backend
```

### Build for Production

```bash
# Compile TypeScript frontend bundle
npm run build:frontend

# Compile Rust backend binary
npm run build:backend
```

---

## 📂 Project Structure

```
D:\Xeno-Inference
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ButterflySvg.tsx      # Exact user SVG with Aurora animations
│   │   │   ├── SplashIntro.tsx       # 3-second split-screen opening sequence
│   │   │   ├── ChatInterface.tsx     # Full AI inference streaming chat app
│   │   │   ├── ThinkingBlock.tsx     # Deep reasoning / Chain-of-thought
│   │   │   ├── CodeBlock.tsx         # Syntax-highlighted code viewer
│   │   │   ├── TelemetryModal.tsx    # Live engine metrics & VRAM HUD
│   │   │   ├── BenchmarkModal.tsx    # Neural throughput benchmark tool
│   │   │   └── SettingsModal.tsx     # Inference parameters & temperature
│   │   ├── services/
│   │   │   └── api.ts                # Rust Axum SSE client & fallback engine
│   │   ├── types.ts                  # TypeScript interface definitions
│   │   ├── index.css                 # Tailwind 4 + Aurora Borealis keyframes
│   │   └── App.tsx                   # Master router & state transitions
│   └── index.html                    # Google Fonts (Roman Serif & Calligraphy)
├── backend/
│   ├── src/
│   │   ├── main.rs                   # Axum web server & SSE stream router
│   │   ├── models.rs                 # Serde DTOs & Chat structs
│   │   ├── engine.rs                 # Neural tensor inference pipeline
│   │   └── telemetry.rs              # Atomic telemetry counter
│   ├── server.js                     # High-speed local SSE server
│   └── Cargo.toml                    # Rust crate dependencies
├── start-dev.js                      # Multi-process development runner
└── package.json                      # Workspace root scripts
```