// The utility functions in this file are shared between the client and the server.

export function isValidUrl(input: string): boolean {
    try {
        const url = new URL(input);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return false;
        }

        const hostname = url.hostname;
        if (!hostname.includes('.')) {
            return false;
        }

        if (input.length > 2000) {
            return false;
        }

        return true;
    } catch (_) {
        return false;
    }
}

export function checkIsPro(user: any) {
    if (!user) return false;
    const periodEnd = new Date(user.stripeCurrentPeriodEnd || 0);

    const isPaid =
        user.stripePriceId && periodEnd.getTime() + 86_400_000 > Date.now()
            ? true
            : false;
    return isPaid;
}

export function extractFirstImageUrl(text: string): string | null {
    const regex = /https?:\/\/[^ ]+\.(jpg|jpeg|png|gif|bmp|webp)/i;
    const match = text.match(regex);
    return match ? match[0] : null;
}
