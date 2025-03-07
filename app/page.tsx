import { VideoChat } from "./components/VideoChat";

export default function Home() {
 
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Chat App</h1>
      <div>Make connection with any number of people here</div>
      <div className="w-full">
        <VideoChat />
      </div>
    </main>
  );
}