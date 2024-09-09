export const formatNumberCompact = (number: number): string => {
    if (number >= 1_000_000_000) {
        return (number / 1_000_000_000).toFixed(2).replace(/\.0$/, '') + 'B';
    }
    if (number >= 1_000_000) {
        return (number / 1_000_000).toFixed(2).replace(/\.0$/, '') + 'M';
    }
    if (number >= 1_000) {
        return (number / 1_000).toFixed(2).replace(/\.0$/, '') + 'K';
    }
    return number.toString();
}
