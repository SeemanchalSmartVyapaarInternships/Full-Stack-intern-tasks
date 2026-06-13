import type { Metadata } from 'next';
import Sidebar from '@/components/layout/Sidebar';
import MobileSidebar from '@/components/layout/MobileSidebar';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'Dashboard — SSC',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Drawer */}
      <MobileSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto overflow-x-hidden"
          role="main"
          aria-label="Dashboard content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
