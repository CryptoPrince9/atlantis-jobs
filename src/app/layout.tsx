import './globals.css';
import React from 'react';
import { Providers } from '../components/Providers';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const metadata = {
  title: 'NexusAI | 24/7 Autonomous Web3 & AI Recruitment Platform',
  description: 'Production-ready AI screening, resume matching, and Web3 BEP20 USDT smart contract job paywalls on BNB Smart Chain.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-900 text-white min-h-screen flex flex-col antialiased">
        <Providers>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
