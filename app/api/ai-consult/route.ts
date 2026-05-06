import { NextResponse } from "next/server";
import { isPlaceholderSecret, readServerEnv } from "../../../lib/server/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatRole = "user" | "assistant";

type ClientMessage = {
  role: ChatRole;
  content: string;
};

const DEEPSEEK_CHAT_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-v4-flash";
const MAX_HISTORY_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 1000;
const TOPIC_REFUSAL_MESSAGE =
  "我只能回答宠物健康分诊、日常护理、洗护美容和门店服务相关问题。其他问题请使用通用 AI 工具。";
const PET_TOPIC_PATTERN =
  /宠物|猫|猫咪|狗|狗狗|犬|幼犬|幼猫|布偶|英短|柴犬|泰迪|金毛|比熊|柯基|雪纳瑞|约克夏|兽医|宠物医院|洗护|洗澡|美容|护理|疫苗|驱虫|绝育|喂|猫粮|狗粮|主粮|罐头|零食|毛发|掉毛|皮肤|皮屑|耳朵|眼睛|牙|牙龈|爪|指甲|脚垫|呕吐|吐了|拉稀|腹泻|便便|排尿|尿血|咳嗽|打喷嚏|呼吸|抽搐|发烧|体温|食欲|不吃|精神差|误食|巧克力|中毒|伤口|出血|瘙痒|抓挠|预约|门店|套餐|价格|地址|营业|到店/;
const GENERAL_AI_TOPIC_PATTERN =
  /代码|编程|股票|基金|投资|理财|房贷|论文|作业|数学题|翻译|写诗|小说|简历|面试|法律|合同|旅游|攻略|菜谱|做饭|电影|游戏|历史|政治|新闻|天气|星座|八字|营销文案|PPT|Excel|Python|JavaScript|React|Next\.?js/i;
const BOUNDARY_PROMPT = [
  "话题边界：你只能回答宠物健康分诊、宠物日常护理、宠物洗护美容、宠物门店服务相关问题。",
  `如果用户询问其他主题，必须只回复：${TOPIC_REFUSAL_MESSAGE}`,
  "不要顺手回答代码、投资、写作、翻译、法律、旅游、闲聊等非宠物问题。",
].join("\n");

const SYSTEM_PROMPT = [
  "你是爪爪焕新 Pet Spa 的宠物健康分诊助手。",
  "你只能提供基础护理建议和风险分诊，不能替代兽医诊断。",
  "不要给最终诊断，不要开处方，不要给药物剂量。",
  "如果用户描述呼吸困难、持续抽搐、大量出血、误食毒物、无法排尿、严重外伤、持续呕吐腹泻、精神极差、昏迷、体温异常或幼宠/老年宠快速恶化，要直接建议立即联系兽医或宠物急诊。",
  "普通问题按这四块回答：可能原因、现在先做什么、观察多久、什么时候必须就医。",
  "回答中文，短句，明确，可执行。不要恐吓，也不要把风险说轻。",
].join("\n");

export async function POST(request: Request) {
  let body: { messages?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "请求内容格式不正确。" },
      { status: 400 },
    );
  }

  const messages = normalizeMessages(body.messages);

  if (messages.length === 0) {
    return NextResponse.json(
      { message: "请先输入要咨询的问题。" },
      { status: 400 },
    );
  }

  if (isOffTopicRequest(messages)) {
    return new Response(TOPIC_REFUSAL_MESSAGE, {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const apiKey = readServerEnv("DEEPSEEK_API_KEY");

  if (isPlaceholderSecret(apiKey)) {
    return NextResponse.json(
      { message: "AI 问诊暂未配置：缺少服务端环境变量 DEEPSEEK_API_KEY。" },
      { status: 500 },
    );
  }

  try {
    const upstream = await fetch(DEEPSEEK_CHAT_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: readServerEnv("DEEPSEEK_MODEL") || DEFAULT_MODEL,
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}\n${BOUNDARY_PROMPT}` },
          ...messages,
        ],
        max_tokens: 700,
        stream: true,
        temperature: 0.4,
        thinking: { type: "disabled" },
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error("DeepSeek request failed", upstream.status, detail);

      return NextResponse.json(
        { message: "AI 问诊暂时不可用，请稍后再试。" },
        { status: 502 },
      );
    }

    if (!upstream.body) {
      return NextResponse.json(
        { message: "AI 问诊没有返回可读取的内容。" },
        { status: 502 },
      );
    }

    return new Response(createTextStream(upstream.body), {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("AI consultation failed", error);

    return NextResponse.json(
      { message: "AI 问诊暂时不可用，请稍后再试。" },
      { status: 500 },
    );
  }
}

function normalizeMessages(value: unknown): ClientMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isMessageLike(item)) {
        return null;
      }

      const content = item.content.trim().slice(0, MAX_MESSAGE_LENGTH);

      if (!content) {
        return null;
      }

      return {
        role: item.role,
        content,
      };
    })
    .filter((item): item is ClientMessage => item !== null)
    .slice(-MAX_HISTORY_MESSAGES);
}

function isOffTopicRequest(messages: ClientMessage[]): boolean {
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user")?.content ?? "";
  const earlierConversation = messages
    .slice(0, -1)
    .map((message) => message.content)
    .join("\n");

  if (!latestUserMessage) {
    return true;
  }

  if (PET_TOPIC_PATTERN.test(latestUserMessage)) {
    return false;
  }

  if (PET_TOPIC_PATTERN.test(earlierConversation) && !GENERAL_AI_TOPIC_PATTERN.test(latestUserMessage)) {
    return false;
  }

  return true;
}

function isMessageLike(value: unknown): value is ClientMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ClientMessage>;

  return (
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string"
  );
}

function createTextStream(upstreamBody: ReadableStream<Uint8Array>) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstreamBody.getReader();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          buffer = flushSseLines(buffer, controller, encoder);
        }

        buffer += decoder.decode();
        flushSseLines(`${buffer}\n`, controller, encoder);
      } catch (error) {
        console.error("Failed to stream DeepSeek response", error);
        controller.error(error);
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });
}

function flushSseLines(
  text: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
) {
  const lines = text.split(/\r?\n/);
  const remaining = lines.pop() ?? "";

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed.startsWith("data:")) {
      continue;
    }

    const payload = trimmed.slice(5).trim();

    if (!payload || payload === "[DONE]") {
      continue;
    }

    try {
      const chunk = JSON.parse(payload) as {
        choices?: Array<{
          delta?: {
            content?: string;
          };
        }>;
      };
      const content = chunk.choices?.[0]?.delta?.content;

      if (content) {
        controller.enqueue(encoder.encode(content));
      }
    } catch {
      continue;
    }
  }

  return remaining;
}
