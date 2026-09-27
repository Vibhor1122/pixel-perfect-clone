import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { APP_NAME } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: `Class Chat — ${APP_NAME}` },
      {
        name: "description",
        content: "Private class chat for students and class representatives.",
      },
    ],
  }),
  component: ChatPage,
});

const initialMessages = [
  {
    id: 1,
    name: "Rahul",
    message: "Does anyone have today's maths notes?",
    time: "2:14 PM",
    mine: false,
  },
  {
    id: 2,
    name: "Priya",
    message: "I have them. I'll upload the PDF.",
    time: "2:16 PM",
    mine: false,
  },
  {
    id: 3,
    name: "You",
    message: "Thanks 👍",
    time: "2:17 PM",
    mine: true,
  },
];

function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);

  const [chatEnabled, setChatEnabled] = useState<boolean | null>(null);
  const [chatError, setChatError] = useState("");

  useEffect(() => {
    void loadChatSetting();
  }, []);

  async function loadChatSetting() {
    setChatError("");

    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("id", "class_chat_enabled")
      .single();

    if (error) {
      setChatError("Could not check the Class Chat status.");
      return;
    }

    setChatEnabled(data.value);
  }

  function sendMessage() {
    if (!chatEnabled) return;

    const text = message.trim();

    if (!text) return;

    setMessages([
      ...messages,
      {
        id: Date.now(),
        name: "You",
        message: text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        mine: true,
      },
    ]);

    setMessage("");
  }

  if (chatEnabled === null) {
    return (
      <AppShell title="Class Chat" subtitle="Students & CR">
        <div className="frost-2 rounded-2xl p-5 text-center ring-hairline">
          <p className="text-[13px] text-muted-foreground">
            {chatError || "Checking Class Chat status..."}
          </p>
        </div>
      </AppShell>
    );
  }

  if (!chatEnabled) {
    return (
      <AppShell title="Class Chat" subtitle="Students & CR">
        <div className="frost-2 rounded-2xl p-6 text-center ring-hairline">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-destructive/10 text-xl">
            🔒
          </div>

          <h2 className="mt-4 text-[15px] font-semibold">
            Class Chat is disabled
          </h2>

          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
            Class Chat has been disabled by the administrator.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Class Chat" subtitle="Students & CR">
      <div className="flex min-h-[calc(100vh-120px)] flex-col">
        <div className="mb-4 rounded-2xl bg-primary/5 px-4 py-3 ring-hairline">
          <p className="text-[12px] font-medium">
            Class Discussion
          </p>

          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Students and class representatives only
          </p>
        </div>

        <div className="flex-1 space-y-4 pb-5">
          {messages.map((item) => (
            <div
              key={item.id}
              className={`flex ${
                item.mine ? "justify-end" : "justify-start"
              }`}
            >
              <div className="max-w-[82%]">
                {!item.mine && (
                  <p className="mb-1 px-1 text-[10px] font-medium text-muted-foreground">
                    {item.name}
                  </p>
                )}

                <div
                  className={
                    item.mine
                      ? "rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-primary-foreground"
                      : "frost-2 rounded-2xl rounded-bl-md px-3.5 py-2.5 ring-hairline"
                  }
                >
                  <p className="text-[13px] leading-relaxed">
                    {item.message}
                  </p>

                  <p
                    className={`mt-1 text-right text-[9px] ${
                      item.mine
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="frost sticky bottom-3 flex items-end gap-2 rounded-2xl p-2 ring-hairline">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Message your class..."
            rows={1}
            className="max-h-24 min-h-10 flex-1 resize-none bg-transparent px-3 py-2.5 text-[13px] outline-none placeholder:text-muted-foreground"
          />

          <button
            onClick={sendMessage}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
            aria-label="Send message"
          >
            ↑
          </button>
        </div>
      </div>
    </AppShell>
  );
}