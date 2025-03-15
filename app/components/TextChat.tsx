"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from "react";
import { socket } from "../lib/socket";
import { Copy, Check } from "lucide-react";

interface Props {
  setusername: (username: string) => void;
  setIsConnectedTop: (isConnected: boolean) => void;
  setNumberofusersonline: (numberofusersonline: number) => void;
}

export function TextChat({ setusername, setIsConnectedTop, setNumberofusersonline }: Props) {
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [copiedStates, setCopiedStates] = useState<boolean[]>([]);
  const [messageTimestamps, setMessageTimestamps] = useState<string[]>([]);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  const [roomId, setRoomId] = useState("");

  function generateFunnyName() {
    const firstNames = ['Fluffy', 'Wacky', 'Bouncy', 'Silly', 'Goofy', 'Snazzy', 'Zippy', 'Loopy'];
    const lastNames = ['McGiggles', 'Banana', 'Wobble', 'Snorkel', 'Doodle', 'Sprinkle', 'Bumble'];

    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  useEffect(() => {
    const roomid = searchParams.get('roomid');
    if (!roomid) {
      const newRoomId = Math.floor(Math.random() * 100000).toString();
      window.location.href = `${window.location.pathname}?roomid=${newRoomId}`;
      setRoomId(newRoomId);
    } else {
      setRoomId(String(roomid));
    }
    let storedUserId = localStorage.getItem("userId");

    if (!storedUserId) {
      storedUserId = generateFunnyName();
      localStorage.setItem("userId", storedUserId);
    }

    setUserId(storedUserId);
    setusername(storedUserId);
  }, [searchParams, setusername]); // Added missing dependencies

  useEffect(() => {
    if (roomId && userId) {
      socket.emit("joinRoom", { roomId, userId });
    }
  }, [roomId, userId]); // This effect runs when roomId or userId changes

  function getCurrentISTTime() {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));

    let hours = istTime.getUTCHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    const minutes = istTime.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} ${ampm}`;
  }

  useEffect(() => {
    function onConnect() {
      setIsConnectedTop(true);
      socket.emit("user_joined", { userId: userId });
    }

    function onDisconnect() {
      setIsConnectedTop(false);
      socket.emit("disconnect");
    }

    socket.on("user_count", setNumberofusersonline);

    socket.on("world", (data) => {
      setReceivedMessages((prevMessages) => [...prevMessages, data]);
      setCopiedStates((prevStates) => [...prevStates, false]);
      setMessageTimestamps((prevTimestamps) => [...prevTimestamps, getCurrentISTTime()]);
      setTimeout(scrollToBottom, 0);
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
      socket.off("user_count");
    };
  }, [setIsConnectedTop, setNumberofusersonline, userId]); // Added missing dependencies

  useEffect(() => {
    scrollToBottom();
  }, [receivedMessages]);

  function scrollToBottom() {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }

  function sendMessageToServer() {
    if (message.trim()) {
      socket.emit("hello", `${userId}#1!2@$${message}`);
      setMessage("");
      setTimeout(scrollToBottom, 0);
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessageToServer();
    }
  };

  const copyMessageToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStates((prev) => prev.map((state, i) => (i === index ? true : state)));
      setTimeout(() => setCopiedStates((prev) => prev.map((state, i) => (i === index ? false : state))), 3000);
    });
  };

  return (
    <div className="flex flex-col items-center justify-between h-full">
      <div className="flex justify-center items-center w-full max-w-4xl">
        <div className="w-full bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Messages</h2>
          <div
            ref={messagesContainerRef}
            className="h-[500px] overflow-y-auto p-4 bg-white border border-gray-200 rounded-xl flex flex-col gap-3"
          >
            {receivedMessages.map((messageData, index) => {
              const [username, messageContent] = messageData.split("#1!2@$");
              const isCurrentUser = username === userId;

              return (
                <div key={index} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} w-full`}>
                  <div className={`max-w-xl p-3 rounded-xl break-words shadow-sm ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                    <div className="text-xs flex justify-between items-center mb-1">
                      <span className={isCurrentUser ? 'text-blue-100' : 'text-gray-500'}>{username}</span>
                      <button
                        onClick={() => copyMessageToClipboard(messageContent, index)}
                        className={`hover:opacity-80 ${isCurrentUser ? 'text-blue-100' : 'text-gray-600'}`}
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

      <div className="w-full max-w-4xl mt-6">
        <div className="flex gap-4 bg-white p-4 rounded-xl shadow-md border border-gray-200 items-center">
          <textarea
            className="flex-1 p-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical min-h-[80px] max-h-[200px]"
            value={message}
            onKeyDown={handleKeyDown}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
          />
          <button onClick={sendMessageToServer} className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-sm">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
