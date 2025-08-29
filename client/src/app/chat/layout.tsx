import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="flex-1 p-4">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
};

export default ChatLayout;
