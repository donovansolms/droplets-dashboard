export const shortenAddress = (address: string) => {
    if (address.length <= 15) return address; // Return the address if it's already short
    return `${address.slice(0, 10)}...${address.slice(-4)}`; // Shorten the address
}