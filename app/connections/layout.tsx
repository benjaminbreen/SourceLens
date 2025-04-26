// app/connections/layout.tsx
// Layout for the connections page ensuring proper metadata and structure
// Provides the outer container for the cosmic connections visualization

import { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme/ThemeProvider';


export const metadata: Metadata = {
  title: 'SourceLens Connections',
  description: 'Explore connections between your source and related concepts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}