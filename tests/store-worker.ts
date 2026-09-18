import { openStore } from "../src/lib/sqlite-store.ts";
import { brief } from "./fixtures.ts";
const store = openStore(process.argv[2]);
store.createAndStart(brief, "cross-process-key"); store.close();
