import { useState } from 'react';

export default function ChatInterface() {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Mock bot response
    setTimeout(() => {
      const botResponse = { role: 'bot' as const, text: `This is a mock response to: "${input}"` };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col h-96">
      <h3 className="text-xl font-bold mb-4 border-b pb-2">Ask Gemini Assistant</h3>
      <div className="flex-grow overflow-y-auto space-y-4 p-2">
        {messages.map((msg, index) => (
          <div key={index} className={`p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="mt-4 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-grow border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Ask about regeneration..."
        />
        <button onClick={handleSend} className="bg-green-600 text-white px-4 rounded-r-lg hover:bg-green-700">Send</button>
      </div>
    </div>
  );
}