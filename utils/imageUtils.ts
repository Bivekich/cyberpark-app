/**
 * Utility functions for handling images and profile pictures
 */

/**
 * Gets the proper URL for a profile picture, handling S3 URLs and fallbacks
 * @param imageUrl The image URL from the API
 * @returns A valid image URL or null for fallback to default icon
 */
export const getProfileImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) {
    return null; // Return null to show default icon
  }
  
  // If it contains placeholder.com, return null for fallback
  if (imageUrl.includes('placeholder.com')) {
    return null;
  }
  
  // If it's already a complete URL, return it
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's an S3 key without a full URL, construct it
  // Note: In React Native, we don't have access to environment variables in the same way
  // The backend should provide complete URLs
  return imageUrl;
};

/**
 * Checks if a URL is valid
 * @param url The URL to check
 * @returns Boolean indicating if the URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}; 