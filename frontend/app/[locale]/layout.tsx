import '@/styles/globals.css';

import { ModalProvider } from '@/components/modal-provider';
import { Toaster } from '@/components/ui/sonner';
import { siteConfig } from '@/config';
import { cn } from '@/lib/utils';
import { ThemeProvider } from 'next-themes';
import Script from 'next/script';
import { SidebarProvider } from '@/hooks/use-sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export const metadata = {
    title: {
        default: 'MemFree - Hybrid AI Search',
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [
        'Hybrid AI Search',
        'Hybrid AI Ask',
        'AI bookmark search',
        'AI document search',
        'AI ask everything',
    ],
    authors: [
        {
            name: 'MemFree',
        },
    ],
    creator: 'MemFree',
    metadataBase: new URL(siteConfig.url),
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: siteConfig.url,
        title: siteConfig.name,
        description: siteConfig.description,
        siteName: siteConfig.name,
        images: [
            {
                url: siteConfig.ogImage,
                width: 1200,
                height: 630,
                alt: siteConfig.name,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.name,
        description: siteConfig.description,
        images: [siteConfig.ogImage],
        creator: '@MemFree',
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
    },
    manifest: `${siteConfig.url}/site.webmanifest`,
};

export default async function RootLayout({
    children,
    params: { locale },
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const messages = await getMessages();
    const isZh = locale == 'zh';

    return (
        <html lang={locale} suppressHydrationWarning>
            <head />
            <body
                className={cn(
                    `min-h-screen bg-background ${isZh ? 'font-serif' : 'font-sans'} antialiased`,
                )}
            >
                <Toaster position="top-center" />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <SidebarProvider>
                        <TooltipProvider>
                            <NextIntlClientProvider messages={messages}>
                                {children}
                            </NextIntlClientProvider>
                        </TooltipProvider>
                    </SidebarProvider>
                    <ModalProvider />
                </ThemeProvider>
                <Script
                    defer
                    src="https://static.cloudflareinsights.com/beacon.min.js"
                    data-cf-beacon={`{"token": "${process.env.NEXT_PUBLIC_CLOUDFLARE_INSIGHTS_TOKEN}"}`}
                ></Script>
                <Script defer src="https://accounts.google.com/gsi/client" />
            </body>
        </html>
    );
}