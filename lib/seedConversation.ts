import type { Message } from "./types";
import seedData from "./seedConversation.data.json";

/**
 * Initial thread for the demo.
 * Source HTML: `lib/seed.html` — regenerate JSON with `pnpm run build-seed`.
 */
export const seededConversation: Message[] = seedData as Message[];
