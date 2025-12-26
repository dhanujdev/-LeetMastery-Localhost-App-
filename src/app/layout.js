import './globals.css';

export const metadata = {
    title: 'LeetMastery - Local',
    description: 'Master your LeetCode patterns locally.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="h-full">
            <body className="h-full antialiased">{children}</body>
        </html>
    );
}
