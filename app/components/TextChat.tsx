"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "../lib/socket";
import { Copy, Check} from "lucide-react"; 

interface props{
  setusername: (username: string) => void,
  setIsConnectedTop: (isConnected: boolean) => void,
  setNumberofusersonline: (numberofusersonline: number) => void
}


export function TextChat({ setusername ,setIsConnectedTop ,setNumberofusersonline}:props) {
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [copiedStates, setCopiedStates] = useState<boolean[]>([]); // Array to track copied state for each message
  const [messageTimestamps, setMessageTimestamps] = useState<string[]>([]); // Array to store timestamps
  
  // Reference to the messages container for auto-scrolling
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  function generateFunnyName() {
    const firstNames = ['Fluffy', 'Wacky', 'Bouncy', 'Silly', 'Goofy', 'Snazzy', 'Zippy', 'Loopy'];
    const lastNames = ['McGiggles', 'Banana', 'Wobble', 'Snorkel', 'Doodle', 'Sprinkle', 'Bumble', 'Wiggles'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }
  
  // Function to get current time in Indian Standard Time (IST) with 12-hour format
  function getCurrentISTTime() {
    const now = new Date();
    
    // Converting to IST (UTC+5:30)
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    
    // Format in 12-hour clock with AM/PM
    let hours = istTime.getUTCHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    
    const minutes = istTime.getUTCMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes} ${ampm}`;
  }
  
  // Function to scroll the message container to the bottom
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };
  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [receivedMessages]);
  
  useEffect(() => {
    let storedUserId = localStorage.getItem("userId");
  
    // Only generate a new ID if one doesn't exist at all
    if (!storedUserId) {
      storedUserId = generateFunnyName();
      localStorage.setItem("userId", storedUserId);
    }
    setusername(storedUserId);
    
    setUserId(storedUserId); // Set the user ID state
  
    setCopiedStates([]); // Initialize copied states for messages
    setMessageTimestamps([]); // Initialize timestamps for messages
  
    // Rest of your useEffect logic remains the same
    function onConnect() {
      setIsConnectedTop(true);
  
      socket.io.engine.on("upgrade", () => {
      });
  
      // Announce this user's presence to the server
      socket.emit("user_joined", { userId: storedUserId });
    }

    function onDisconnect() {
        setIsConnectedTop(false);
    }

    // Listen for user count updates from the server
    socket.on("user_count", (count) => {
        setNumberofusersonline(count);
    });

    // Listen for incoming messages
    socket.on("world", (data) => {
        setReceivedMessages((prevMessages) => {
            const newMessages = [...prevMessages, data];
            setTimeout(scrollToBottom, 0); // Scroll after state update
            return newMessages;
        });
        setCopiedStates((prevStates) => [...prevStates, false]); 
        setMessageTimestamps((prevTimestamps) => [...prevTimestamps, getCurrentISTTime()]);
    });

    if (socket.connected) {
        onConnect();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("world");
    };
}, []);


  function sendMessageToServer() {
    if (message.trim()) {
      socket.emit("hello", userId + "#1!2@$" + message);
      setMessage("");
      // Also scroll to bottom after sending a message
      setTimeout(scrollToBottom, 0);
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
            prevStates.map((state, i) => (i === index ? false : state)) // Revert only this message after 3s
          );
        }, 3000);
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  return (
<div className="flex flex-col items-center justify-between h-full ">
  
  {/* Messages Container */}
  <div className="flex justify-center items-center w-full max-w-4xl">
    <div className="w-full bg-white shadow-md rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Messages</h2>
      <div
        onContextMenu={(e) => e.preventDefault()}
        ref={messagesContainerRef}
        className="h-[500px] overflow-y-auto p-4 bg-white border border-gray-200 rounded-xl flex flex-col gap-3"
      >
        {receivedMessages.map((messageData, index) => {
          const parts = messageData.split("#1!2@$");
          const username = parts[0];
          const messageContent = parts[1];
          const isCurrentUser = username === userId;

          return (
            <div
              key={index}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} w-full`}
            >
              <div
                className={` max-w-xl p-3 rounded-xl break-words shadow-sm ${
                  isCurrentUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <div className="text-xs flex justify-between items-center mb-1">
                  <span className={isCurrentUser ? 'text-blue-100' : 'text-gray-500'}>
                    {username}
                  </span>
                  <button
                    onClick={() => copyMessageToClipboard(messageContent, index)}
                    className={`hover:opacity-80 ${
                      isCurrentUser ? 'text-blue-100' : 'text-gray-600'
                    } ${isCurrentUser ? 'order-first mr-2' : 'order-last ml-2'}`}
                    title="Copy message"
                  >
                    {copiedStates[index] ? <Check size={14} /> : <Copy size={12} />}
                  </button>
                </div>
                <div className="whitespace-pre-wrap text-sm">{messageContent}</div>
                <div className={`text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'} text-right mt-1`}>
                  {messageTimestamps[index] || getCurrentISTTime()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>

  {/* Input Area */}
  <div className="w-full max-w-4xl mt-6 ">
    <div className="flex  gap-4 bg-white p-4 rounded-xl shadow-md border border-gray-200 items-center">
      <textarea
        className="flex-1 p-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical min-h-[80px] max-h-[200px]"
        value={message}
        onKeyDown={handleKeyDown}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
      />
      <button
        onClick={sendMessageToServer}
        className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-sm"
      >
        Send
      </button>
    </div>
  </div>

</div>
  );
}