// Utility functions for handling product data

export interface ProductData {
  name?: string;
  model?: string;
  accurate_code?: string;
  category?: string;
  description?: string;
  specifications?: any;
}

/**
 * Generate a better product name when the original name is "UNKNOWN" or empty
 */
export function getDisplayName(product: ProductData): string {
  // If name exists and is not "UNKNOWN", use it
  if (product.name && product.name !== 'UNKNOWN') {
    return product.name;
  }

  // Try to build a meaningful name from available data
  let displayName = '';

  // Option 1: Use category + model
  if (product.category && product.model) {
    displayName = `${product.category} ${product.model}`;
  }
  // Option 2: Use just model if it's descriptive
  else if (product.model && product.model.length > 3) {
    displayName = product.model;
  }
  // Option 3: Use category + accurate_code
  else if (product.category && product.accurate_code) {
    displayName = `${product.category} ${product.accurate_code}`;
  }
  // Option 4: Use just accurate_code
  else if (product.accurate_code) {
    displayName = product.accurate_code;
  }
  // Option 5: Extract from description
  else if (product.description) {
    // Try to extract a meaningful name from description
    const desc = product.description.substring(0, 50).trim();
    displayName = desc.endsWith('...') ? desc.slice(0, -3) : desc;
  }
  // Fallback
  else {
    displayName = product.category || 'Produk Tanpa Nama';
  }

  return displayName.trim();
}

/**
 * Get product code for display (accurate_code or model)
 */
export function getProductCode(product: ProductData): string | null {
  return product.accurate_code || product.model || null;
}

/**
 * Format product name for better readability
 */
export function formatProductName(name: string): string {
  if (!name) return 'Produk Tanpa Nama';
  
  // Clean up common patterns
  return name
    .replace(/^SIEMENS\s*/i, '') // Remove SIEMENS prefix if exists
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

/**
 * Generate a comprehensive product title
 */
export function getProductTitle(product: ProductData): string {
  const displayName = getDisplayName(product);
  const formattedName = formatProductName(displayName);
  
  // If the name is very short or just a code, try to enhance it
  if (formattedName.length < 10 && product.category) {
    return `${product.category} - ${formattedName}`;
  }
  
  return formattedName;
} 