import { ZodError } from "zod";

export function safeNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatError(error: unknown): { message: string; details?: unknown } {
  if (error instanceof ZodError) {
    return {
      message: "Validation failed",
      details: error.flatten()
    };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: "Unexpected error" };
}
