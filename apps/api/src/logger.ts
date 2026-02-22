import type { NextFunction, Request, Response } from "express";
import { mkdirSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const LOG_DIR = join(process.cwd(), "logs");
const APP_LOG = join(LOG_DIR, "app.log");
const ERROR_LOG = join(LOG_DIR, "error.log");

function ensureLogDir() {
  mkdirSync(LOG_DIR, { recursive: true });
}

function nowIso() {
  return new Date().toISOString();
}

function writeLine(file: string, line: string) {
  ensureLogDir();
  appendFileSync(file, `${line}\n`, "utf8");
}

export function logInfo(message: string, context?: unknown) {
  const line = `[${nowIso()}] INFO ${message}${context ? ` ${JSON.stringify(context)}` : ""}`;
  console.log(line);
  writeLine(APP_LOG, line);
}

export function logWarn(message: string, context?: unknown) {
  const line = `[${nowIso()}] WARN ${message}${context ? ` ${JSON.stringify(context)}` : ""}`;
  console.warn(line);
  writeLine(APP_LOG, line);
}

export function logError(message: string, error?: unknown, context?: unknown) {
  const stack = error instanceof Error ? error.stack ?? error.message : undefined;
  const line = `[${nowIso()}] ERROR ${message}${context ? ` ${JSON.stringify(context)}` : ""}${stack ? `\n${stack}` : ""}`;
  console.error(line);
  writeLine(ERROR_LOG, line);
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startedAt = Date.now();
  const reqId = `${startedAt}-${Math.random().toString(36).slice(2, 8)}`;
  (req as Request & { reqId?: string }).reqId = reqId;

  logInfo("request:start", {
    reqId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip
  });

  res.on("finish", () => {
    logInfo("request:end", {
      reqId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt
    });
  });

  next();
}
