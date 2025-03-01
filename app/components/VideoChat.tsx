"use client";

import { useEffect, useState } from "react";
import { socket } from "../lib/socket";

export function VideoChat() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [resivedmessage, setResivedMessage] = useState("");

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }
  
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
  
    // ✅ Listen for incoming "hello" messages
    socket.on("world", (data) => {
      setResivedMessage(data);
    });
  
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
      
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("hello");  // Clean up listener
    };
  }, []);

  const [messages,setmessages]=useState("");

  function sedmessagetoserver(){
    socket.emit("hello",messages);
  }
  

  
  return (
    <div className="flex flex-col items-center">
      <div>
        <p>Status: { isConnected ? "connected" : "disconnected" }</p>
        <p>Transport: { transport }</p>
      </div>

      <div className="p-5 gap-3 flex flex-row"> 

        <input type="text" className="text-black p-2" onChange={(e) => setmessages(e.target.value)} />
        <button onClick={sedmessagetoserver} className="bg-white text-black p-2">Send</button>
      </div>
      <div>
        <span>{resivedmessage}</span> 
      </div>
    </div>

  );
}