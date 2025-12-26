import './globals.css';

export const metadata = {
    title: 'LeetMastery - Local',
    description: 'Master your LeetCode patterns locally.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
