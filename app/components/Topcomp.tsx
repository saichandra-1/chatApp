"use client"
import {  useState } from "react";
import { TextChat } from "./TextChat";
import { Circle, Users } from 'lucide-react';

export function Topcomp() {
    const [username, setusername] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [numberofusersonline, setNumberofusersonline] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with username display */}
      <header className="bg-white shadow-sm p-4">
        <div className="w-full px-2 mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800 mr-4">Chat App</h1>
          </div>
          
          {/* Username with online indicator */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
            <div className="relative group">
                {/* Change color based on connection status */}
                <Circle 
                className={`w-3 h-3 ${isConnected ? 'text-green-500 fill-green-500' : 'text-red-500 fill-red-500'}`} 
                />
                <span className="absolute top-0 left-0 w-3 h-3 rounded-full">
                <span 
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} opacity-75`}
                ></span>
                </span>
                
                {/* Tooltip that appears on hover */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    {isConnected ? "Server connected" : "Server disconnected"}
                </div>
            </div>
            <span className="font-medium text-gray-700">
                {username || "Not connected"}
            </span>
            </div>
        </div>
      </header>
      
      {/* Container for users count - positioned at top right */}
      <div className=" mx-auto px-4 md:px-6">
        <div className="flex justify-end mt-2">
          {/* Online users count */}
          <div className="flex items-center gap-2 bg-white shadow-sm px-3 py-1.5 rounded-full">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-gray-700">
              {numberofusersonline} online
            </span>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto  md:p-6 mt-4">
        <div className="text-center mb-8">
          <p className="text-gray-600 text-xl">Connect with people around the world</p>
        </div>
        
        <div className="w-full">
          <TextChat 
            setusername={setusername} 
            setIsConnectedTop={setIsConnected} 
            setNumberofusersonline={setNumberofusersonline} 
          />
        </div>
      </main>
    </div>
  );
}