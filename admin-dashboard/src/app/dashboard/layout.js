import AuthGuard from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";

export const metadata = {
  title: "SmartVyapar Dashboard",
  description: "Role-based ERP dashboard for SmartVyapar",
};

export default function DashboardRootLayout({ children }) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
