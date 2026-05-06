"use client";

import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { AlertTriangle, Loader2, PawPrint, Send, Sparkles, X } from "lucide-react";
import heroMascotCat from "../src/assets/hero-mascot-cat.png";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

const REQUEST_HISTORY_LIMIT = 10;
const MAX_INPUT_LENGTH = 800;
const INITIAL_NOTICE =
  "我可以帮你做基础护理建议和风险分诊，但不能替代兽医诊断。遇到呼吸困难、抽搐、误食毒物、大量出血、无法排尿等情况，请立即联系宠物医院。";
const QUICK_PROMPTS = [
  "狗狗洗澡后皮肤发红怎么办？",
  "猫咪今天食欲差，还吐了一次",
  "狗狗误食巧克力，现在有点没精神",
];

export function AiConsultAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [isOpen, messages]);

  const updateAssistantMessage = (id: string, content: string) => {
    setMessages((current) =>
      current.map((message) => (message.id === id ? { ...message, content } : message)),
    );
  };

  const sendCurrentMessage = async () => {
    const question = input.trim();

    if (!question || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question.slice(0, MAX_INPUT_LENGTH),
    };
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };
    const requestMessages = [...messages, userMessage]
      .filter((message) => message.content.trim())
      .slice(-REQUEST_HISTORY_LIMIT)
      .map(({ role, content }) => ({ role, content }));

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/ai-consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: requestMessages }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      if (!response.body) {
        throw new Error("AI 问诊没有返回内容，请稍后再试。");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        answer += decoder.decode(value, { stream: true });
        updateAssistantMessage(assistantMessage.id, answer);
      }

      answer += decoder.decode();
      updateAssistantMessage(
        assistantMessage.id,
        answer || "我暂时没有生成有效回复，请换一种说法再试。",
      );
    } catch (error) {
      updateAssistantMessage(
        assistantMessage.id,
        error instanceof Error ? error.message : "AI 问诊暂时不可用，请稍后再试。",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendCurrentMessage();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    void sendCurrentMessage();
  };

  return (
    <div className="ai-consult" aria-live="polite">
      {isOpen ? (
        <section className="ai-consult-panel" aria-label="AI 宠物问诊助手">
          <div className="ai-consult-header">
            <div className="ai-consult-title">
              <span className="ai-title-avatar">
                <img src={heroMascotCat.src} alt="" aria-hidden="true" />
              </span>
              <div>
                <span className="ai-title-kicker">
                  <Sparkles size={15} />
                  店宠在线
                </span>
                <strong>问问饭桶</strong>
                <small>先分清风险，再决定要不要就医</small>
              </div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="关闭 AI 问诊">
              <X size={19} />
            </button>
          </div>

          <div className="ai-consult-messages">
            <div className="ai-consult-notice">
              <AlertTriangle size={17} />
              <p>{INITIAL_NOTICE}</p>
            </div>
            {messages.length === 0 ? (
              <div className="ai-consult-empty">
                <div>
                  <PawPrint size={19} />
                  <strong>可以这样问我</strong>
                </div>
                <div className="ai-prompt-chips">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button type="button" onClick={() => setInput(prompt)} key={prompt}>
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {messages.map((message) => (
              <div className={`ai-message ai-message-${message.role}`} key={message.id}>
                <p>
                  {message.content || (
                    <span className="ai-typing">
                      <Loader2 className="ai-spin-icon" size={16} />
                      正在分析...
                    </span>
                  )}
                </p>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form className="ai-consult-form" onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value.slice(0, MAX_INPUT_LENGTH))}
              onKeyDown={handleInputKeyDown}
              placeholder="描述宠物情况，例如：猫咪今天食欲差，还吐了一次"
              rows={3}
              disabled={isSending}
            />
            <div className="ai-consult-form-row">
              <small>{input.length}/{MAX_INPUT_LENGTH}</small>
              <button type="submit" disabled={isSending || !input.trim()} aria-label="发送问诊问题">
                {isSending ? <Loader2 className="ai-spin-icon" size={18} /> : <Send size={18} />}
                发送
              </button>
            </div>
          </form>
        </section>
      ) : (
        <button
          className="ai-consult-trigger"
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="打开 AI 宠物问诊助手"
        >
          <span className="ai-trigger-avatar">
            <img src={heroMascotCat.src} alt="" aria-hidden="true" />
          </span>
          <span className="ai-trigger-copy">
            <strong>问问店宠</strong>
            <small>宠物不舒服？先分诊</small>
          </span>
          <span className="ai-trigger-badge">
            <PawPrint size={15} />
          </span>
        </button>
      )}
    </div>
  );
}

async function readErrorMessage(response: Response) {
  try {
    const result = (await response.json()) as { message?: string };

    return result.message || "AI 问诊暂时不可用，请稍后再试。";
  } catch {
    return "AI 问诊暂时不可用，请稍后再试。";
  }
}
