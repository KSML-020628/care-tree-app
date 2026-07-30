import "server-only";
import OpenAI from "openai";
import { ARTWORK_ANALYSIS_JSON_SCHEMA, ARTWORK_ANALYSIS_SYSTEM_PROMPT, buildArtworkAnalysisUserPrompt } from "./artwork-analysis.prompt";
import { artworkAnalysisSchema } from "./artwork-analysis.schema";
import type { ArtworkAnalysis, ArtworkAnalysisInput } from "./artwork-analysis.types";

const REQUEST_TIMEOUT_MS = 12_000;

export class ArtworkAnalysisUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ArtworkAnalysisUnavailableError";
  }
}

function isAiEnabled(): boolean {
  if (!process.env.OPENAI_API_KEY) return false;
  // 기본값은 켜짐: 명시적으로 "false"를 준 경우에만 끈다.
  return process.env.ENABLE_AI_ANALYSIS !== "false";
}

/**
 * OpenAI에 실제로 요청을 보낸다. 서버(Route Handler)에서만 호출해야 하며,
 * 클라이언트 컴포넌트에서 이 파일을 import하면 "server-only" 표시 때문에 빌드가 실패한다.
 * 개인정보(등록번호·실명·병실 등)는 ArtworkAnalysisInput 타입 자체에 존재하지 않아 보낼 수 없다.
 */
export async function requestArtworkAnalysisFromOpenAI(input: ArtworkAnalysisInput): Promise<ArtworkAnalysis> {
  if (!isAiEnabled()) {
    throw new ArtworkAnalysisUnavailableError("AI_DISABLED");
  }

  const apiKey = process.env.OPENAI_API_KEY as string;
  const model = process.env.OPENAI_ARTWORK_MODEL || "gpt-5-mini";
  const client = new OpenAI({ apiKey });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const completion = await client.chat.completions.create(
      {
        model,
        max_tokens: 400,
        messages: [
          { role: "system", content: ARTWORK_ANALYSIS_SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: buildArtworkAnalysisUserPrompt(input) },
              { type: "image_url", image_url: { url: input.imageDataUrl } },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "artwork_analysis",
            strict: true,
            schema: ARTWORK_ANALYSIS_JSON_SCHEMA,
          },
        },
      },
      { signal: controller.signal },
    );

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new ArtworkAnalysisUnavailableError("EMPTY_AI_RESPONSE");

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch {
      throw new ArtworkAnalysisUnavailableError("INVALID_AI_JSON");
    }

    const validation = artworkAnalysisSchema.safeParse(parsedJson);
    if (!validation.success) {
      throw new ArtworkAnalysisUnavailableError("AI_SCHEMA_MISMATCH");
    }

    return validation.data;
  } finally {
    clearTimeout(timeoutId);
  }
}
