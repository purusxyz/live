import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidepanel from "../components/SidePanel";
import Header from "../components/Header";
import ChatContent from "../components/ChatContent";
import ChatInput from "../components/ChatInput";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const Dashboard = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const navigate = useNavigate();

  const sendPrompt = async (prompt: string) => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
    return;
  }

  const userMessage: Message = {
    id: Date.now(),
    role: "user",
    content: prompt,
  };

  const tempId = Date.now() + 1;

  const updatedMessages = [...messages, userMessage];

  // Show user message immediately and placeholder assistant message
  setMessages([
    ...updatedMessages,
    {
      id: tempId,
      role: "assistant",
      content: "Thinking...",
    },
  ]);

  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to get response from server");
    }

    const data = await response.json();

    const reply = data.reply
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === tempId
          ? {
              ...msg,
              content: reply,
            }
          : msg
      )
    );
  } catch (error) {
    console.error("Chat Error:", error);

//     setMessages((prev) =>
//       prev.map((msg) =>
//         msg.id === tempId
//           ? {
//               ...msg,
//               content: "⚠️ Failed to generate response.",
//             }
//           : msg
//       )
//     );
//   }
// };

  return (
    <div className="flex h-screen">
      <div className="hidden md:block">
  <Sidepanel />
</div>

      <div className="flex-1 flex flex-col">
        <Header />
        <ChatContent messages={messages} />

        <div className="bg-white px-6 py-1">
          <div className="max-w-3xl mx-auto">
            <ChatInput sendPrompt={sendPrompt} />
            <p className="text-xs text-gray-500 mt-2 mb-1 text-center">
              ChatGPT can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;