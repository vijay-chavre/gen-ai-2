import { createApp } from "./app.js";
import { env } from "./config/env.js";

export async function main(): Promise<void> {
  const port = env.PORT;
  const app = createApp();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${port}`);
  });
}

// Run main() if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Failed to run main():", error);
    process.exit(1);
  });
}


