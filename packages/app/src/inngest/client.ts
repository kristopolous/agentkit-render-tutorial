import { Inngest } from "inngest";
import { dbMiddleware } from "./middleware";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "hacker-news-agent",
  // If you're using Next.js Edge Runtime, you need to set isProduction explicitly
  isProduction: process.env.NODE_ENV === "production",
  middleware: [dbMiddleware],
});
