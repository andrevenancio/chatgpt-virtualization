import ChatInterface from "@/components/ChatInterface";

export default function NonVirtualizedPage() {
  return <ChatInterface useVirtualization={false} />;
}
