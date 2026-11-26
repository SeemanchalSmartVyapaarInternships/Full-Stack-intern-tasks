import './globals.css';
import { TenantProvider } from '@/context/TenantContext';
import DashboardShell from '@/components/layout/DashboardShell';

export const metadata = {
  title: 'VyapaarPulse — Multi-Tenant SaaS Admin Dashboard',
  description:
    'Production-grade Multi-Tenant SaaS Admin Dashboard built with Next.js, React, and Tailwind CSS for SSC Full Stack Internship Week 1.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <TenantProvider>
          <DashboardShell>{children}</DashboardShell>
        </TenantProvider>
      </body>
    </html>
  );
}
