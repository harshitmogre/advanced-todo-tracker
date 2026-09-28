import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { TasksProvider } from '@/lib/context/TasksContext';
import AppShell from '@/components/layout/AppShell';

const font = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'FocusFlow — Productivity Tracker',
  description: 'Task management with analytics and productivity insights.'
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var theme = window.localStorage.getItem('pt_theme_v1') || 'light';
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <TasksProvider>
          <AppShell>{children}</AppShell>
        </TasksProvider>
      </body>
    </html>
  );
}
