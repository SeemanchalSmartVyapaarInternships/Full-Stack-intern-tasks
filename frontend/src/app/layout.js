import './globals.css';

export const metadata = {
  title: 'MedCareX — Healthcare ERP MVP',
  description: 'MedCareX Healthcare Management System (SSC Internship Weeks 5-6 Final Project)',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
