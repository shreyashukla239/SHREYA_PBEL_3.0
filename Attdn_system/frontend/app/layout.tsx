import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});
export const metadata = {
  title: 'Smart Attendance Monitoring Portal',
  description: 'Secure, high-speed, contactless facial recognition biometric attendance portal.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable}`}>
      <body className="font-sans antialiased bg-slate-950 text-slate-100 min-h-screen select-none">
        {children}
      </body>
    </html>
  );
}
