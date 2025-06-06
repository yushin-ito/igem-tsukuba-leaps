import type { ReactNode } from "react";

import Footer from "@/components/footer";
import Header from "@/components/header";

interface TopLayoutProps {
  children: ReactNode;
}

const AuthLayout = async ({ children }: TopLayoutProps) => {
  return (
    <div className="relative flex h-screen flex-col">
      <header>
        <Header />
      </header>
      <main className="flex-1">{children}</main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default AuthLayout;
