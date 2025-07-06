import { useState, useEffect } from "react";

type Message = {
  name: string;
  message: string;
  time?: string;
};

const Messages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const fetchMessages = async () => {
    const res = await fetch("http://localhost:3001/messages");
    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = async () => {
    if (!name || !message) return;
    await fetch("http://localhost:3001/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message }),
    });
    setMessage("");
    fetchMessages(); // refresh
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div>
      <h2>💬 Messages</h2>
      <ul>
        {messages.map((msg, i) => (
          <li key={i}>
            <strong>{msg.name}</strong>: {msg.message}
          </li>
        ))}
      </ul>
      <input
        placeholder="Abraham"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Hello everyone! This app works!"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Messages;
