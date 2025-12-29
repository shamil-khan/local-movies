/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from 'chalk';

type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'verbose';

class ChalkLogger {
  private isProduction = import.meta.env.PROD;

  private formatMessage(_level: LogLevel, message: string, context?: string) {
    const prefix = context ? `[${context.toUpperCase()}]` : '[SYSTEM]';
    const timestamp = new Date().toLocaleTimeString();
    return `${timestamp} ${prefix} ${message}`;
  }

  info(message: string, context?: string) {
    if (this.isProduction) return;
    console.log(chalk.blue(this.formatMessage('info', message, context)));
  }

  warn(message: string, context?: string) {
    console.warn(chalk.yellow(this.formatMessage('warn', message, context)));
  }

  error(message: string, context?: string, error?: any) {
    console.error(chalk.red(this.formatMessage('error', message, context)));
    if (error) console.error(error);
  }

  success(message: string, context?: string) {
    if (this.isProduction) return;
    console.log(chalk.green(this.formatMessage('success', message, context)));
  }

  verbose(message: string, context?: string) {
    if (this.isProduction) return;
    // verbose-specific logs
    console.log(
      chalk.gray.bold(this.formatMessage('verbose', message, context)),
    );
  }
}

export const clogger = new ChalkLogger();
