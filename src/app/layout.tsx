import './globals.css';
import React from 'react';
import { Providers } from '../components/Providers';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const metadata = {
  title: 'AtlantisJobs | 24/7 Autonomous Web3 & AI Oceanic Hiring Mesh',
  description: 'Sovereign Web3 hiring platform with 300 USDT BSC BEP20 smart contract job posting paywalls, 10 USDT candidate boosts, open-source AI resume parsing, and 24/7 text screening.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-abyss-950 text-white min-h-screen flex flex-col antialiased">
        <Providers>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
