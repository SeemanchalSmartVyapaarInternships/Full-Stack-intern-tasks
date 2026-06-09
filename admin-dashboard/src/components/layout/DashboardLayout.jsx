"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const sidebarWrapRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    if (loaded) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          clearProps: "transform",
        }
      );
    }
  }, [loaded]);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    gsap.to(sidebarWrapRef.current, {
      width: next ? 64 : 256,
      duration: 0.35,
      ease: "power2.inOut",
    });
  }

  return (
    <>
      <LoadingScreen onDone={() => setLoaded(true)} />

      <div
        className="flex h-screen overflow-hidden"
        style={{ backgroundColor: "var(--content-bg)" }}
      >
        <div
          ref={sidebarWrapRef}
          className="hidden lg:flex flex-col shrink-0 overflow-hidden"
          style={{ width: 256 }}
        >
          <Sidebar
            isOpen={false}
            onClose={() => {}}
            collapsed={collapsed}
          />
        </div>

        {/* Mobile sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={false}
          mobileOnly
        />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopNavbar
            onMenuToggle={() => setSidebarOpen((p) => !p)}
            onCollapseToggle={toggleCollapse}
            collapsed={collapsed}
          />

          <main
            ref={mainRef}
            className="flex-1 overflow-y-auto px-4 md:px-6 py-5"
            id="main-content"
            aria-label="Main dashboard content"
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
