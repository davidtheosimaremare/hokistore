export const generateProductSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim() // Remove leading/trailing spaces
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const generateSEOProductUrl = (id: string | number, name: string): string => {
  const slug = generateProductSlug(name);
  return `/product/${id}/${slug}`;
};

export const extractProductIdFromUrl = (url: string): string | null => {
  // Extract ID from URL pattern: /product/[id]/[slug]
  const match = url.match(/\/product\/([^\/]+)/);
  return match ? match[1] : null;
}; 