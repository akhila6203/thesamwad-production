import { Outlet } from "react-router-dom";
import Header from "../components/homecomponents/Header";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {children ?? <Outlet />}
      </main>

      <WhatsAppButton />
    </div>
  );
}