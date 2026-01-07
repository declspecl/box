import { CHECK_IP_URL } from "./constants.ts";

export async function fetchPublicIp(): Promise<string> {
    const response = await fetch(CHECK_IP_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch IP: ${response.status}`);
    }

    return (await response.text()).trim();
}
