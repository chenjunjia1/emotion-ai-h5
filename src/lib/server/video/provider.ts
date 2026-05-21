import { getVideoProvider } from "@/lib/server/config";

export interface VideoCreateInput {
  taskType: "avatar" | "auto";
  script: string;
  duration: 30 | 60;
}

export interface VideoCreateResult {
  providerTaskId: string;
  status: "processing";
}

/** 提交到视频厂商；mock 时由 API 路由用 setTimeout 模拟 */
export async function submitVideoJob(
  input: VideoCreateInput
): Promise<VideoCreateResult | null> {
  const provider = getVideoProvider();
  if (provider === "mock") return null;

  if (provider === "kling") {
    const key = process.env.KLING_API_KEY;
    if (!key) return null;
    // TODO: POST KLING_API_BASE 创建任务
    console.warn("[video] implement Kling API", input.taskType);
    return { providerTaskId: `kling-mock-${Date.now()}`, status: "processing" };
  }

  return null;
}
