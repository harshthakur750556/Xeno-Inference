use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatRequest {
    pub model: String,
    pub messages: Vec<ChatMessage>,
    #[serde(default = "default_temperature")]
    pub temperature: f32,
    #[serde(default = "default_top_p")]
    pub top_p: f32,
    #[serde(default = "default_max_tokens")]
    pub max_tokens: usize,
    #[serde(default)]
    pub system_prompt: Option<String>,
    #[serde(default)]
    pub enable_reasoning: bool,
}

fn default_temperature() -> f32 {
    0.7
}
fn default_top_p() -> f32 {
    0.9
}
fn default_max_tokens() -> usize {
    2048
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatResponse {
    pub id: String,
    pub model: String,
    pub content: String,
    pub reasoning: Option<String>,
    pub tokens: usize,
    pub duration_ms: u64,
    pub tokens_per_sec: f32,
    pub ttft_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamChunk {
    #[serde(rename = "type")]
    pub chunk_type: String, // "reasoning" | "content" | "meta"
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthResponse {
    pub status: String,
    pub engine: String,
    pub version: String,
    pub uptime_seconds: u64,
    pub memory_allocated_mb: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelInfo {
    pub id: String,
    pub name: String,
    pub tagline: String,
    pub context_window: String,
    pub quantization: String,
    pub params: String,
    pub provider: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TelemetryResponse {
    #[serde(rename = "engineStatus")]
    pub engine_status: String,
    #[serde(rename = "activeStreams")]
    pub active_streams: usize,
    #[serde(rename = "vramUsedGb")]
    pub vram_used_gb: f32,
    #[serde(rename = "vramTotalGb")]
    pub vram_total_gb: f32,
    #[serde(rename = "totalTokensProcessed")]
    pub total_tokens_processed: u64,
    #[serde(rename = "avgThroughput")]
    pub avg_throughput: f32,
    #[serde(rename = "cpuLoadPercent")]
    pub cpu_load_percent: u32,
    #[serde(rename = "rustVersion")]
    pub rust_version: String,
    #[serde(rename = "uptimeSeconds")]
    pub uptime_seconds: u64,
    #[serde(rename = "memoryBandwidthGbps")]
    pub memory_bandwidth_gbps: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BenchmarkRequest {
    pub model: String,
    #[serde(default = "default_benchmark_iterations")]
    pub iterations: usize,
}

fn default_benchmark_iterations() -> usize {
    100
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BenchmarkResponse {
    pub model: String,
    #[serde(rename = "promptTokens")]
    pub prompt_tokens: usize,
    #[serde(rename = "generatedTokens")]
    pub generated_tokens: usize,
    #[serde(rename = "totalTimeMs")]
    pub total_time_ms: u64,
    #[serde(rename = "tokensPerSec")]
    pub tokens_per_sec: f32,
    #[serde(rename = "ttftMs")]
    pub ttft_ms: u64,
    #[serde(rename = "memoryAllocatedMb")]
    pub memory_allocated_mb: u64,
}