type LogLevel = "info" | "warn" | "error";

class Logger {
  private formatLogMessage(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
  ) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (meta) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }

    return logMessage;
  }

  private log(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
  ) {
    const formattedMessage = this.formatLogMessage(level, message, meta);

    console[level](formattedMessage);

    // TODO send logs to whaever logging service i decide to use (if i do) but prolly sentry
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log("warn", message, meta);
  }

  error(message: string, meta?: Record<string, unknown>) {
    this.log("error", message, meta);
  }
}

export const logger = new Logger();
