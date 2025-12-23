// lib/settings.ts
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getSettings = unstable_cache(
    async () => {
        try {
            return await prisma.settings.findFirst();
        } catch (error) {
            console.error("Could not fetch settings:", error);
            return null;
        }
    },
    ["site-settings"],
    { tags: ["settings"] }
);
