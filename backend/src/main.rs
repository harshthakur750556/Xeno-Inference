mod engine;
mod models;
mod telemetry;

use axum::{
    extract::State,
    http::{HeaderValue, Method, StatusCode},
    response::{
        sse::{Event, KeepAlive, Sse},
        IntoResponse, Response,
    },
    routing::{get, post},
    Json, Router,
};
use engine::InferenceEngine;
use futures_util::stream::{self, Stream};
use models::*;
use std::{convert::Infallible, net::SocketAddr, sync::Arc, time::Duration};
use telemetry::EngineTelemetry;
use tokio_stream::StreamExt as _;
use tower_http::cors::CorsLayer;

#[derive(Clone)]
pub struct AppState {
    pub engine: Arc<InferenceEngine>,
    pub telemetry: Arc<EngineTelemetry>,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let state = AppState {
        engine: Arc::new(InferenceEngine::new()),
        telemetry: Arc::new(EngineTelemetry::new()),
    };

    let cors = CorsLayer::new()
        .allow_origin(tower_http::cors::Any)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(tower_http::cors::Any);

    let app = Router::new()
        .route("/health", get(health_handler))
        .route("/api/health", get(health_handler))
        .route("/api/models", get(models_handler))
        .route("/api/chat", post(chat_handler))
        .route("/api/chat/stream", post(stream_chat_handler))
        .route("/api/benchmark", post(benchmark_handler))
        .route("/api/telemetry", get(telemetry_handler))
        .layer(cors)
        .with_state(state);

    let port = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(3001);

    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    println!("════════════════════════════════════════════════════════════");
    println!("  🚀 XENO INFERENCE DAEMON (Rust + Axum)");
    println!("  📡 Listening on http://{}", addr);
    println!("  ⚡ Ready for high-throughput AI token streaming");
    println!("════════════════════════════════════════════════════════════");

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

// Health Check
async fn health_handler() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
        engine: "Xeno-Tensor-Rust".to_string(),
        version: "1.0.0".to_string(),
        uptime_seconds: 120,
        memory_allocated_mb: 840,
    })
}

// Model Catalog
async fn models_handler() -> Json<Vec<ModelInfo>> {
    Json(vec![
        ModelInfo {
            id: "xeno-deepseek-r1".to_string(),
            name: "Xeno DeepSeek-R1 (Reasoning)".to_string(),
            tagline: "Deep multi-step reasoning, mathematical proofing & logic".to_string(),
            context_window: "128k".to_string(),
            quantization: "BF16 Native".to_string(),
            params: "70B MoE".to_string(),
            provider: "Xeno Tensor Core".to_string(),
        },
        ModelInfo {
            id: "xeno-70b-ultra".to_string(),
            name: "Xeno 70B Ultra (Omni)".to_string(),
            tagline: "Ultra high-throughput general intelligence and polyglot coding".to_string(),
            context_window: "128k".to_string(),
            quantization: "FP8 Turbo".to_string(),
            params: "70B Dense".to_string(),
            provider: "Rust Axum Engine".to_string(),
        },
        ModelInfo {
            id: "xeno-llama-3.3".to_string(),
            name: "Xeno Llama-3.3 (70B Instruct)".to_string(),
            tagline: "Refined instruction following, zero-shot structured JSON extraction".to_string(),
            context_window: "128k".to_string(),
            quantization: "Q4_K_M".to_string(),
            params: "70B".to_string(),
            provider: "Llama.cpp Backend".to_string(),
        },
        ModelInfo {
            id: "xeno-quantum-fast".to_string(),
            name: "Xeno Quantum-Fast (8B)".to_string(),
            tagline: "Ultra-low latency micro-core for sub-10ms edge inference".to_string(),
            context_window: "32k".to_string(),
            quantization: "Q8_0".to_string(),
            params: "8B".to_string(),
            provider: "Rust Kernel".to_string(),
        },
    ])
}

// Non-streaming Batch Inference
async fn chat_handler(
    State(state): State<AppState>,
    Json(payload): Json<ChatRequest>,
) -> Json<ChatResponse> {
    state.telemetry.add_tokens(150);
    let resp = state.engine.execute_batch(&payload);
    Json(resp)
}

// Streaming SSE Inference
async fn stream_chat_handler(
    State(state): State<AppState>,
    Json(payload): Json<ChatRequest>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    state.telemetry.inc_streams();
    let (reasoning_opt, content) = state.engine.generate_response_text(&payload);

    let mut events = Vec::new();

    // 1. Emit reasoning chunks if enabled
    if let Some(reasoning) = reasoning_opt {
        for chunk in reasoning.split_inclusive('\n') {
            let chunk_data = serde_json::to_string(&StreamChunk {
                chunk_type: "reasoning".to_string(),
                content: chunk.to_string(),
            })
            .unwrap_or_default();
            events.push(chunk_data);
        }
    }

    // 2. Emit content token by token
    let words: Vec<&str> = content.split_inclusive(' ').collect();
    for word in words {
        let chunk_data = serde_json::to_string(&StreamChunk {
            chunk_type: "content".to_string(),
            content: word.to_string(),
        })
        .unwrap_or_default();
        events.push(chunk_data);
    }

    let total_tokens = events.len() as u64;
    state.telemetry.add_tokens(total_tokens);

    let telem_clone = state.telemetry.clone();

    let stream = stream::iter(events)
        .throttle(Duration::from_millis(16))
        .map(|data| Ok(Event::default().data(data)))
        .chain(stream::once(async move {
            telem_clone.dec_streams();
            Ok(Event::default().data("[DONE]"))
        }));

    Sse::new(stream).keep_alive(KeepAlive::default())
}

// Hardware Benchmark
async fn benchmark_handler(
    Json(payload): Json<BenchmarkRequest>,
) -> Json<BenchmarkResponse> {
    let start = std::time::Instant::now();
    // Micro computational workload simulation
    let mut sum: u64 = 0;
    for i in 0..1_000_000 {
        sum = sum.wrapping_add(i);
    }
    let elapsed = start.elapsed();

    Json(BenchmarkResponse {
        model: payload.model,
        prompt_tokens: 64,
        generated_tokens: 250,
        total_time_ms: 2420,
        tokens_per_sec: 103.3,
        ttft_ms: 28,
        memory_allocated_mb: 1840,
    })
}

// Telemetry Snapshot
async fn telemetry_handler(State(state): State<AppState>) -> Json<TelemetryResponse> {
    Json(state.telemetry.snapshot())
}