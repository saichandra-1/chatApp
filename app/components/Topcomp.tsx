"use client";
import { useState, useRef, useEffect } from "react";
import { TextChat } from "./TextChat";
import { Circle, Users } from "lucide-react";
import { Suspense } from "react";

export function Topcomp() {
  const [username, setusername] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [numberofusersonline, setNumberofusersonline] = useState(0);
  const [listOfUsers, setListOfUsers] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle page reload
  const pagereload = () => {
    history.go(0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with username display */}
      <header className="bg-white shadow-sm p-4">
        <div className="w-full px-2 mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1
              className="text-2xl font-bold text-gray-800 mr-4 hover:cursor-pointer"
              onClick={pagereload}
            >
              Chat App
            </h1>
          </div>

          {/* Username with online indicator */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
            <div className="relative group">
              <Circle
                className={`w-3 h-3 ${
                  isConnected
                    ? "text-green-500 fill-green-500"
                    : "text-red-500 fill-red-500"
                }`}
              />
              <span className="absolute top-0 left-0 w-3 h-3 rounded-full">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    isConnected ? "bg-green-400" : "bg-red-400"
                  } opacity-75`}
                ></span>
              </span>
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
      <div className="mx-auto px-4 md:px-6">
        <div className="flex justify-end mt-2 relative" ref={dropdownRef}>
          {/* Online users count with dropdown trigger */}
          <div
            className="flex items-center gap-2 bg-white shadow-sm px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onMouseEnter={() => setIsDropdownOpen(true)}
          >
            <Users className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-gray-700">
              {numberofusersonline} online
            </span>
          </div>

          {/* Dropdown for list of users */}
          {isDropdownOpen && (
            <div
              className="absolute top-full right-0 mt-2 w-64 bg-white shadow-lg rounded-lg z-10 max-h-64 overflow-y-auto border border-gray-200"
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <div className="p-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Users Online
                </h3>
                <ul className="space-y-1">
                  {/* Current user at the top with blue background */}
                  <li className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md font-medium">
                    {username || "You"}
                  </li>
                  {/* List of other users */}
                  {listOfUsers.length > 0 ? (
                    listOfUsers.map((user, index) => {
                      return user !== username ? (
                        <li
                          key={index}
                          className="px-2 py-1 text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          {user}
                        </li>
                      ) : null;
                    })
                  ) : (
                    <li className="px-2 py-1 text-gray-500 italic">
                      No other users online
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto md:p-6 mt-4">
        <div className="text-center mb-8">
          <p className="text-gray-600 text-xl">
            Connect with people around the world
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <div className="w-full">
            <TextChat
              setusername={setusername}
              setIsConnectedTop={setIsConnected}
              setNumberofusersonline={setNumberofusersonline}
              setListOfUsers={setListOfUsers}
            />
          </div>
        </Suspense>
      </main>
    </div>
  );
}