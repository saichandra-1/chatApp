"use client";

import { useEffect, useState } from "react";
import { socket } from "../lib/socket";
import { Copy } from "lucide-react"; 
import { Check } from "lucide-react";

export function VideoChat() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [copiedStates, setCopiedStates] = useState<boolean[]>([]); // Array to track copied state for each message

  function generateFunnyName() {
    const firstNames = ['Fluffy', 'Wacky', 'Bouncy', 'Silly', 'Goofy', 'Snazzy', 'Zippy', 'Loopy'];
    const lastNames = ['McGiggles', 'Banana', 'Wobble', 'Snorkel', 'Doodle', 'Sprinkle', 'Bumble', 'Wiggles'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }
  
  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }
    // Generate random userId
    const randomUserId = generateFunnyName();
    setUserId(randomUserId);
    setCopiedStates([]); // Initialize copied states for messages

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }
  
    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");  
    }
  
    // Listen for incoming messages
    socket.on("world", (data) => {
      setReceivedMessages((prevMessages) => [...prevMessages, data]);
      setCopiedStates((prevStates) => [...prevStates, false]); // Add a new "not copied" state for the new message
    });
    
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
      
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("world");  // Clean up listener
    };
  }, []);

  function sendMessageToServer() {
    if (message.trim()) {
      socket.emit("hello", userId + "#1!2@$" + message);
      setMessage("");
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessageToServer();
    }
  };

  const copyMessageToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedStates((prevStates) =>
          prevStates.map((state, i) => (i === index ? true : state)) // Set only this message as copied
        );
        setTimeout(() => {
          setCopiedStates((prevStates) =>
            prevStates.map((state, i) => (i === index ? false : state)) // Revert only this message after 1s
          );
        }, 3000);
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  return (
    <div className="flex flex-col items-center">
      <div>
        <p>Status: {isConnected ? "connected" : "disconnected"}</p>
        <p>Transport: {transport}</p>
      </div>

      <div className="p-5 flex-col w-full"> 
        <div className="justify-center flex items-end">
          <textarea 
            className="text-black p-2 w-2/4 max-h-[300px] min-h-[80px]" 
            value={message}
            onKeyDown={handleKeyDown} 
            onChange={(e) => setMessage(e.target.value)} 
            placeholder="Type your message here..."
            style={{ resize: "vertical" }} // Allow vertical resizing only
          />
          <div className="items-end">
            <button 
              onClick={sendMessageToServer} 
              className="bg-white text-black py-3 px-7 ml-3 rounded-lg"
            >
              Send
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center items-center h-full bg-gray-100">
        <div className="w-[750px] h-[500px] bg-white shadow-lg rounded-2xl p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Messages</h2>
          <div className="h-[420px] overflow-y-auto p-2 border border-gray-300 rounded-lg flex flex-col">
            {receivedMessages.map((messageData, index) => {
              const parts = messageData.split("#1!2@$");
              const username = parts[0];
              const messageContent = parts[1];
              
              const isCurrentUser = username === userId;
              
              return (
                <div 
                  key={index} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} w-full my-1`}
                >
                  <div
                    className={`max-w-[50%] p-2 rounded-lg break-words relative ${
                      isCurrentUser 
                        ? 'bg-blue-100 text-blue-900' 
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <div className="text-xs text-gray-500 mb-1 flex justify-between items-center">
                      <span>{username}</span>
                      <button 
                        onClick={() => copyMessageToClipboard(messageContent, index)} // Pass index to track specific message
                        className={`text-gray-600 hover:text-gray-900 ${
                          isCurrentUser ? 'order-first mr-2' : 'order-last ml-2'
                        }`}
                        title="Copy message"
                      >
                        {copiedStates[index] ? <Check size={14} /> : <Copy size={12} />}
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap">{messageContent}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}