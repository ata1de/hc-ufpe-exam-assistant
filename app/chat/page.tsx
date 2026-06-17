import { Suspense } from "react"
import { ChatClient } from "./chat-client"

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-background" />}>
      <ChatClient />
    </Suspense>
  )
}
