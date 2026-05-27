"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { TreeholeSocialPanel } from "@/components/expression/treehole-social-panel";
import { AppShell } from "@/components/layout/app-shell";
import { ChatModeSwitcher } from "@/components/expression/chat-mode-switcher";
import {
  TreeholeChatBubbles,
  type TreeholeChatMsg,
} from "@/components/expression/treehole-chat-bubbles";
import { dismissTreeholeNightHint, TreeholeNightHint } from "@/components/expression/treehole-night-hint";
import { TreeholeNightToggle } from "@/components/expression/treehole-night-toggle";
import { TreeholeNightLantern } from "@/components/layout/treehole-night-lantern";
import { useApp } from "@/contexts/app-context";
import { isClientServerMode } from "@/lib/client/server-api";
import { apiExpressionGenerate, ExpressionApiError } from "@/lib/api/expression/client";
import {
  applyTreeholeNightViewport,
  useTreeholeNight,
} from "@/lib/hooks/use-treehole-night";
import {
  normalizeTreeholePersonaId,
  pickTreeholeStatusTags,
  randomTreeholeOpening,
  TREEHOLE_DEFAULT_ENERGY,
  TREEHOLE_EMOTION_SIGNS,
  TREEHOLE_HOME_COPY,
  TREEHOLE_HOT_SCENARIOS,
  TREEHOLE_MOCK_CHAT_REPLIES,
  TREEHOLE_MOCK_SOCIAL_COPY,
  TREEHOLE_MOODS,
  TREEHOLE_MOMENTS_VARIANTS,
  TREEHOLE_PERSONAS,
  TREEHOLE_PROMPT_CHIPS,
  TREEHOLE_QUICK_ACTIONS,
  TREEHOLE_QUOTA_COPY,
  TREEHOLE_VIP_PERKS,
  type TreeholeMomentsVariant,
  type TreeholePersonaId,
  type TreeholeQuickActionId,
} from "@/lib/mock/emotion-treehole";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import {
  buildEmotionSignShareText,
  downloadEmotionSignPoster,
} from "@/lib/media/emotion-sign-poster";
import { cn } from "@/lib/utils";

function TreeholeParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="th-particle treehole-particle absolute rounded-full"
          style={{
            left: `${(i * 17 + 8) % 100}%`,
            top: `${(i * 23 + 5) % 100}%`,
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${4 + (i % 5)}s`,
          }}
        />
      ))}
    </div>
  );
}

function ThCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("th-card", className)}>{children}</div>;
}

function EnergyBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px]">
        <span className="th-energy-label">{label}</span>
        <span className="th-energy-value font-bold">{value}%</span>
      </div>
      <div className="th-energy-track h-1.5 overflow-hidden rounded-full">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function nextMsgId() {
  return `th-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function EmotionTreeholePage() {
  const { user, setLoginOpen, showToast, openQuotaModal, addHistory, scheduleBackgroundSync, setUser } =
    useApp();
  const { night, toggle, ready } = useTreeholeNight();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const signRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const [persona, setPersona] = useState<TreeholePersonaId>("comfort");
  const [energy, setEnergy] = useState(TREEHOLE_DEFAULT_ENERGY);
  const [emotionSign, setEmotionSign] = useState(TREEHOLE_EMOTION_SIGNS[0]);
  const [messages, setMessages] = useState<TreeholeChatMsg[]>([]);
  const [momentsVariants, setMomentsVariants] = useState<TreeholeMomentsVariant[]>(
    TREEHOLE_MOMENTS_VARIANTS
  );
  const [chatting, setChatting] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);
  const [replyIdx, setReplyIdx] = useState(0);
  const [savingPoster, setSavingPoster] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);

  const personaMeta = useMemo(
    () => TREEHOLE_PERSONAS.find((p) => p.id === persona) ?? TREEHOLE_PERSONAS[0],
    [persona]
  );

  const hasUserMessage = messages.some((m) => m.role === "user");

  useEffect(() => {
    if (!ready) return;
    applyTreeholeNightViewport(night);
    return () => applyTreeholeNightViewport(false);
  }, [night, ready]);

  useEffect(() => {
    if (!ready || messages.length > 0) return;
    const meta = TREEHOLE_PERSONAS.find((p) => p.id === (night ? "lateNight" : "comfort"))!;
    setMessages([
      {
        id: "opening",
        role: "assistant",
        text: randomTreeholeOpening(),
        sticker: meta.sticker,
      },
    ]);
    if (night) setPersona("lateNight");
  }, [ready, night, messages.length]);

  const refreshSign = useCallback(() => {
    setEmotionSign(TREEHOLE_EMOTION_SIGNS[Math.floor(Math.random() * TREEHOLE_EMOTION_SIGNS.length)]);
  }, []);

  const appendAssistant = useCallback(
    (text: string, tags?: string[]) => {
      setMessages((prev) => [
        ...prev,
        {
          id: nextMsgId(),
          role: "assistant",
          text,
          sticker: personaMeta.sticker,
          statusTags: tags,
        },
      ]);
    },
    [personaMeta.sticker]
  );

  const sendChat = useCallback(
    async (text: string, personaOverride?: TreeholePersonaId) => {
      if (!user) {
        setLoginOpen(true);
        return;
      }
      const trimmed = text.trim();
      if (!trimmed) {
        showToast("想说点什么再聊～");
        inputRef.current?.focus();
        return;
      }

      const pid = personaOverride ?? persona;
      const meta = TREEHOLE_PERSONAS.find((p) => p.id === pid) ?? personaMeta;

      setChatStarted(true);
      setMessages((prev) => [
        ...prev,
        { id: nextMsgId(), role: "user", text: trimmed },
      ]);
      setInput("");
      setChatting(true);

      try {
        const res = await apiExpressionGenerate({
          kind: "emotion_sign",
          prompt: `[${meta.name}] ${trimmed}`,
        });
        const replyText =
          res.text ??
          TREEHOLE_MOCK_CHAT_REPLIES[pid][replyIdx % TREEHOLE_MOCK_CHAT_REPLIES[pid].length];
        const apiTags = res.tags?.length ? res.tags : undefined;
        const fallbackTags = pickTreeholeStatusTags(3).map((t) => `${t.label}：${t.value}`);
        const tagList = apiTags ?? fallbackTags;
        appendAssistant(replyText, tagList);
        if (res.user) setUser(res.user);
        if (isClientServerMode()) {
          scheduleBackgroundSync();
        } else {
          addHistory("树洞陪聊", trimmed, {
            userMessage: trimmed,
            text: replyText,
            tags: tagList,
            persona: meta.name,
          });
        }
        setReplyIdx((i) => i + 1);
        setMomentsVariants(
          TREEHOLE_MOMENTS_VARIANTS.map((v) => ({
            ...v,
            text: trimmed.length > 4 ? `${v.text}` : v.text,
          }))
        );
      } catch (e) {
        setMessages((prev) => prev.slice(0, -1));
        if (e instanceof ExpressionApiError && e.code === "quota_insufficient") {
          showToast(TREEHOLE_QUOTA_COPY.insufficient);
          openQuotaModal();
        } else {
          const replies = TREEHOLE_MOCK_CHAT_REPLIES[pid];
          const mockReply = replies[replyIdx % replies.length];
          const mockTags = pickTreeholeStatusTags(3).map((t) => `${t.label}：${t.value}`);
          appendAssistant(mockReply, mockTags);
          if (!isClientServerMode()) {
            addHistory("树洞陪聊", trimmed, {
              userMessage: trimmed,
              text: mockReply,
              tags: mockTags,
              persona: meta.name,
            });
          }
          setReplyIdx((i) => i + 1);
        }
      } finally {
        setChatting(false);
      }
    },
    [
      user,
      persona,
      personaMeta,
      replyIdx,
      setLoginOpen,
      showToast,
      openQuotaModal,
      appendAssistant,
      addHistory,
      scheduleBackgroundSync,
      setUser,
    ]
  );

  const onEmotionSignAction = useCallback(
    async (label: "保存图片" | "发朋友圈" | "微信状态") => {
      if (label === "保存图片") {
        if (savingPoster) return;
        setSavingPoster(true);
        showToast("正在生成情绪卡片…");
        try {
          const ok = await downloadEmotionSignPoster({ quote: emotionSign, energy, night });
          showToast(ok ? "图片已生成，请在下载或相册中查看" : "保存失败，请换浏览器重试");
        } catch {
          showToast("保存失败，请换浏览器重试");
        } finally {
          setSavingPoster(false);
        }
        return;
      }
      const channel = label === "发朋友圈" ? "moments" : "wechat";
      const text = buildEmotionSignShareText(emotionSign, channel);
      const copied = await copyToClipboard(text);
      showToast(copied ? `已复制 · ${label}` : "复制失败，请手动长按复制");
    },
    [emotionSign, energy, night, savingPoster, showToast]
  );

  const onMoodPick = (moodId: (typeof TREEHOLE_MOODS)[number]["id"]) => {
    const mood = TREEHOLE_MOODS.find((m) => m.id === moodId);
    if (mood) {
      setEnergy(mood.energy);
      refreshSign();
      showToast(`记下了：${mood.label} ${mood.emoji}`);
    }
    setMoodOpen(false);
  };

  const onQuickAction = async (actionId: TreeholeQuickActionId) => {
    switch (actionId) {
      case "comfort_more":
        await sendChat("再哄我两句", "comfort");
        break;
      case "clarify":
        setPersona("clarify");
        await sendChat(input.trim() || "帮我理理，我现在有点乱", "clarify");
        break;
      case "reply_ta":
        setPersona("reply");
        showToast("已切到「帮我回TA」，把对话贴进来～");
        inputRef.current?.focus();
        break;
      case "moments":
        showToast("已生成 3 种朋友圈文案，往下翻翻～");
        break;
      case "xhs": {
        const copied = await copyToClipboard(TREEHOLE_MOCK_SOCIAL_COPY.xhs);
        showToast(copied ? "已复制小红书文案" : "复制失败");
        break;
      }
      case "wake_line":
        setPersona("wake");
        await sendChat("给我一句轻轻骂醒的话，别太凶", "wake");
        break;
      case "sign_card":
        signRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        refreshSign();
        showToast("情绪卡片在这，可保存发圈～");
        break;
      default:
        break;
    }
  };

  if (!ready) {
    return (
      <AppShell showHeader={false} homePage>
        <div className="flex min-h-[40vh] items-center justify-center text-[13px] text-[#FF4F8B]">
          加载中…
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell showHeader={false} homePage={!night} treeholeDark={night}>
      <div
        className={cn(
          "treehole-page treehole-page-route-enter relative min-h-[calc(100vh-5rem)] overflow-hidden",
          !night && "treehole-page-day"
        )}
        data-theme={night ? "night" : "day"}
      >
        {night ? (
          <>
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1a1035] via-[#120a24] to-[#080512]"
              aria-hidden
            />
            <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#7c3aed]/25 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -right-16 top-48 h-48 w-48 rounded-full bg-[#ec4899]/20 blur-3xl" aria-hidden />
          </>
        ) : (
          <>
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#FFF6FA] via-[#FFFBF8] to-[#F0FDF9]"
              aria-hidden
            />
            <div className="pointer-events-none absolute -left-16 top-8 h-40 w-40 rounded-full bg-[#FF9EC4]/20 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -right-10 top-32 h-36 w-36 rounded-full bg-[#A7F3D0]/25 blur-3xl" aria-hidden />
          </>
        )}
        <TreeholeParticles />

        <div className="relative z-10 px-3.5 pb-4 pt-1">
          {!night ? <ChatModeSwitcher active="treehole" /> : null}

          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="th-title text-[17px] font-black">情绪树洞</h1>
                <span className="rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-2 py-0.5 text-[9px] font-black text-white">
                  搭子
                </span>
              </div>
              <p className="th-sub mt-0.5 text-[10px]">陪聊 · 帮你回 · 情绪文案</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <TreeholeNightHint night={night} ready={ready}>
                <TreeholeNightToggle
                  night={night}
                  onToggle={() => {
                    if (!night) dismissTreeholeNightHint();
                    toggle();
                    if (!night) setPersona("lateNight");
                    else setPersona("comfort");
                    showToast(night ? "回到日间奶油模式啦 ☀️" : "深夜抱抱模式开启 🌙");
                  }}
                />
              </TreeholeNightHint>
              <Link
                href="/history?filter=treehole"
                className="th-ghost-btn rounded-full px-2.5 py-1 text-[10px] font-bold"
              >
                我的记录
              </Link>
            </div>
          </div>

          <ThCard className="relative mb-3 overflow-hidden p-4">
            <div className="flex gap-3">
              <div className="min-w-0 flex-1">
                <p className="th-title text-[15px] font-black leading-snug">{TREEHOLE_HOME_COPY.title}</p>
                <p className="th-sub mt-1.5 text-[11px] leading-relaxed">{TREEHOLE_HOME_COPY.subtitle}</p>
                <p className="th-muted mt-2 text-[10px]">↓ 在下方输入框说话，点「陪我聊聊」即可</p>
              </div>
              <div className="relative flex h-[88px] w-[72px] shrink-0 items-end justify-center">
                <span className="treehole-mascot-float text-[48px] leading-none">🐱</span>
                {night ? (
                  <span className="absolute -right-1 top-0 text-[18px]">🌙</span>
                ) : (
                  <span className="absolute -right-1 top-0 text-[16px]">✨</span>
                )}
              </div>
            </div>
          </ThCard>

          <TreeholeChatBubbles messages={messages} loading={chatting} night={night} />

          {!hasUserMessage && !chatting ? (
            <ThCard className="mb-3 p-3">
              <p className="th-title mb-2 text-[11px] font-black">很多人今晚也在想…</p>
              <div className="treehole-hot-scenarios flex items-stretch gap-1.5">
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-1.5">
                  {TREEHOLE_HOT_SCENARIOS.slice(0, 4).map((scene) => (
                    <button
                      key={scene}
                      type="button"
                      onClick={() => {
                        setInput(scene);
                        inputRef.current?.focus();
                      }}
                      className="th-list-item rounded-xl px-2 py-2 text-left text-[10px] leading-snug"
                    >
                      {scene}
                    </button>
                  ))}
                </div>
                <div className="treehole-hot-scenarios-lamp flex w-[52px] shrink-0 items-center justify-center self-center">
                  <TreeholeNightLantern size="sm" hanging={false} />
                </div>
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-1.5">
                  {TREEHOLE_HOT_SCENARIOS.slice(4).map((scene) => (
                    <button
                      key={scene}
                      type="button"
                      onClick={() => {
                        setInput(scene);
                        inputRef.current?.focus();
                      }}
                      className="th-list-item rounded-xl px-2 py-2 text-left text-[10px] leading-snug"
                    >
                      {scene}
                    </button>
                  ))}
                </div>
              </div>
            </ThCard>
          ) : null}

          <ThCard className="mb-3 p-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              placeholder="乱七八糟地说也可以，我在听…"
              className="th-input w-full resize-none bg-transparent text-[13px] leading-relaxed outline-none"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {TREEHOLE_PROMPT_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setInput(chip)}
                  className="th-chip rounded-full px-2.5 py-1 text-[10px] font-medium"
                >
                  {chip}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={chatting}
              onClick={() => void sendChat(input)}
              className="treehole-breathe mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#FF4F8B] via-[#FF6B9D] to-[#FF9A4D] py-3 text-[14px] font-black text-white shadow-[0_6px_20px_rgba(255,79,139,0.4)] disabled:opacity-60"
            >
              <Heart size={16} fill="currentColor" />
              {chatting ? "正在认真听你说…" : "陪我聊聊"}
            </button>
          </ThCard>

          {chatStarted ? (
            <div className="mb-3 flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              {TREEHOLE_QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => void onQuickAction(action.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-bold shadow-sm active:scale-95",
                    night
                      ? "bg-white/12 text-white ring-1 ring-white/20"
                      : "bg-white text-[#FF4F8B] ring-1 ring-[#FFE8F0]"
                  )}
                >
                  <span>{action.emoji}</span>
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}

          <div ref={signRef} className="mb-3 grid grid-cols-5 gap-2">
            <ThCard className="col-span-3 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="th-title text-[11px] font-black">今日情绪卡片</p>
                <button
                  type="button"
                  onClick={() => setMoodOpen(true)}
                  className="th-chip shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold"
                >
                  📝 记心情
                </button>
              </div>
              <p className="th-body mt-2 text-[12px] leading-relaxed">{emotionSign}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(["保存图片", "发朋友圈", "微信状态"] as const).map((label) => (
                  <button
                    key={label}
                    type="button"
                    disabled={label === "保存图片" && savingPoster}
                    onClick={() => void onEmotionSignAction(label)}
                    className="th-chip rounded-full px-2 py-1 text-[9px] font-bold disabled:opacity-50"
                  >
                    {label === "保存图片" && savingPoster ? "生成中…" : label}
                  </button>
                ))}
              </div>
            </ThCard>
            <ThCard className="col-span-2 flex flex-col p-3">
              <p className="th-title text-[11px] font-black">今日能量条</p>
              <div className="mt-2 flex flex-1 flex-col justify-center gap-2.5">
                <EnergyBar label="电量" value={energy.fatigue} color="bg-gradient-to-r from-[#F472B6] to-[#FB7185]" />
                <EnergyBar label="治愈" value={energy.healing} color="bg-gradient-to-r from-[#6EE7B7] to-[#34D399]" />
                <EnergyBar label="开心" value={energy.happiness} color="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B]" />
              </div>
              <p className="th-muted mt-2 text-[8px]">🐱 允许 emo，也允许慢慢好起来</p>
            </ThCard>
          </div>

          <div className="mb-3">
            <p className="th-title mb-0.5 px-0.5 text-[12px] font-black">选个聊天搭子</p>
            <p className="th-muted mb-2 px-0.5 text-[10px]">今晚想用哪种语气陪你</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
              {TREEHOLE_PERSONAS.map((p) => {
                const active = persona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPersona(normalizeTreeholePersonaId(p.id))}
                    className={cn(
                      "treehole-persona-chip flex w-[68px] shrink-0 flex-col items-center rounded-2xl p-2 transition active:scale-95",
                      active ? "th-persona-active scale-[1.02]" : "th-persona opacity-90"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-lg shadow-sm ring-2",
                        p.gradient,
                        active ? "ring-white/50" : "ring-transparent"
                      )}
                    >
                      {p.emoji}
                    </span>
                    <p className="th-persona-name mt-1.5 line-clamp-1 text-[10px] font-black">{p.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <TreeholeSocialPanel
            variants={momentsVariants}
            xhsCopy={TREEHOLE_MOCK_SOCIAL_COPY.xhs}
            night={night}
            onCopy={(text, label) => {
              void copyToClipboard(text);
              showToast(`已复制 · ${label}`);
            }}
          />

          <Link
            href="/profile?pricing=1"
            className="th-vip flex flex-col gap-2 rounded-2xl px-3.5 py-3"
          >
            <div className="flex items-center justify-between">
              <p className="th-vip-title text-[12px] font-black">树洞搭子 Pro</p>
              <span className="shrink-0 rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-3 py-1.5 text-[10px] font-bold text-white">
                {TREEHOLE_QUOTA_COPY.cta}
              </span>
            </div>
            <ul className="th-vip-sub grid grid-cols-1 gap-0.5 text-[10px]">
              {TREEHOLE_VIP_PERKS.map((perk) => (
                <li key={perk}>· {perk}</li>
              ))}
            </ul>
          </Link>
        </div>

        {moodOpen ? (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="th-modal w-full max-w-[400px] rounded-[24px] p-4">
              <p className="th-title text-center text-[14px] font-black">今天什么 vibe？</p>
              <p className="th-sub mt-1 text-center text-[10px]">选一下，更新你的情绪卡片</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {TREEHOLE_MOODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onMoodPick(m.id)}
                    className="th-modal-item flex flex-col items-center rounded-2xl py-3"
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="th-title mt-1 text-[11px] font-bold">{m.label}</span>
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setMoodOpen(false)} className="th-muted mt-3 w-full py-2 text-[12px] font-bold">
                先不选
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
