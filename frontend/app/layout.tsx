import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import AppShell from '@/components/AppShell';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Noru EMS | Hotel Employee Management System',
  description: 'Manage hotel employees, departments, roles, shifts, and attendance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`} style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: 'white',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: 'white',
              border: 'none',
            },
            iconTheme: {
              primary: 'white',
              secondary: '#ef4444',
            },
          },
        }} />
      </body>
    </html>
  );
}
