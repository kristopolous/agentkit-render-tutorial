import { Client } from "pg";
import { InngestMiddleware } from "inngest";

export const dbMiddleware = new InngestMiddleware({
  name: "Database Middleware",
  init() {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
      keepAlive: false,
      connectionTimeoutMillis: 1000,
    });
    client.connect();
    return {
      onFunctionRun() {
        return {
          transformInput() {
            return {
              ctx: {
                db: client,
              },
            };
          },
        };
      },
    };
  },
});
