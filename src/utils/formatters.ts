/**
 * Format price to Indonesian Rupiah format
 * @param price Number to format
 * @returns Formatted price string
 */
export function formatRupiah(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

/**
 * Format price to short format (K, M, B)
 * @param price Number to format
 * @returns Formatted price string with unit
 */
export function formatShortPrice(price: number): string {
  if (price >= 1000000000) {
    return `Rp ${(price / 1000000000).toFixed(1)}B`;
  } else if (price >= 1000000) {
    return `Rp ${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `Rp ${(price / 1000).toFixed(0)}K`;
  } else {
    return formatRupiah(price);
  }
}

/**
 * Truncate text to specified length with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
} 