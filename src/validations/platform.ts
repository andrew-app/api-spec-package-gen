import { AVAILABLE_PLATFORMS } from "@utils/constants";

export const validatePlatform = (platform?: string) => {
    if (!platform) {
        throw new Error('Platform is required');
    }
    if (!AVAILABLE_PLATFORMS.includes(platform)) {
        throw new Error(`Invalid platform: ${platform}`);
    }
    return platform.toLowerCase();
}