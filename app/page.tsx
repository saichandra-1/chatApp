import { VideoChat } from "./components/VideoChat";

export default function Home() {
 
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <h1 className="text-3xl font-bold mb-6">Text share app</h1>
      <div>Send text immdately from on devise to another without whatsapp !!!</div>
      <VideoChat />
    </main>
  );
}