import "./globals.css";

export const metadata = {
  title: "MedCareX Healthcare ERP",
  description: "Enterprise healthcare management MVP for patients, doctors, appointments and analytics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
