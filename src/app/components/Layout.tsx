import { Outlet } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}