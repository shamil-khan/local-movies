// src/lib/logger.ts
import { createConsola } from 'consola/browser';

export const logger = createConsola({
  level: 3, // Info
});

export default logger;
