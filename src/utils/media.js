export const getMediaUrl = (path) => {
    if (!path || typeof path !== 'string') return "";
    if (path.startsWith("http")) return path;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:7000";

    // Clean up the path: remove leading slash if it exists
    const cleanPath = path.replace(/^\/+/, "");

    // Ensure backendUrl doesn't have a trailing slash
    const cleanBaseUrl = backendUrl.replace(/\/+$/, "");

    // If the path contains 'uploads/', it's likely an old file, but we still route it 
    // through the media proxy to be safe and consistent.
    // The media proxy handles both S3 keys and old local paths.
    return `${cleanBaseUrl}/api/media/${cleanPath}`;
};
