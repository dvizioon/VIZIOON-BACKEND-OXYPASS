require('dotenv').config();
const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.saveToFile = process.env.SAVE_LOGS === 'true';
    this.logDir = path.join(process.cwd(), 'logs');
    
    // Códigos de cores ANSI
    this.colors = {
      reset: '\x1b[0m',
      red: '\x1b[31m',      // error
      green: '\x1b[32m',    // success
      yellow: '\x1b[33m',   // warning
      blue: '\x1b[34m',     // info
      magenta: '\x1b[35m',  // debug (rosa)
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      gray: '\x1b[90m'
    };
    
    if (this.saveToFile) {
      this.ensureLogDirectory();
    }
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getCallerInfo() {
    const stack = new Error().stack;
    const stackLines = stack.split('\n');
    // Linha 4 geralmente contém o arquivo que chamou o logger
    const callerLine = stackLines[4];
    if (callerLine) {
      const match = callerLine.match(/at.*\((.*):\d+:\d+\)/);
      if (match) {
        const fullPath = match[1];
        const fileName = path.basename(fullPath);
        return fileName;
      }
    }
    return 'unknown';
  }

  formatMessage(level, message) {
    const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const caller = this.getCallerInfo();
    return `[${timestamp}] [${level.toUpperCase()}] [${caller}] ${message}`;
  }

  formatColoredMessage(level, message, color) {
    const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const caller = this.getCallerInfo();
    return `${color}[${timestamp}] [${level.toUpperCase()}] [${caller}] ${message}${this.colors.reset}`;
  }

  writeToFile(content) {
    if (!this.saveToFile) return;
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `${date}.log`;
    const filepath = path.join(this.logDir, filename);
    
    try {
      // Remover códigos de cor para o arquivo
      const cleanContent = content.replace(/\x1b\[[0-9;]*m/g, '');
      fs.appendFileSync(filepath, cleanContent + '\n');
    } catch (error) {
      console.error('Erro ao escrever no arquivo de log:', error);
    }
  }

  error(message) {
    const formatted = this.formatMessage('error', message);
    const colored = this.formatColoredMessage('error', message, this.colors.red);
    console.error(colored);
    this.writeToFile(formatted);
  }

  info(message) {
    const formatted = this.formatMessage('info', message);
    const colored = this.formatColoredMessage('info', message, this.colors.blue);
    console.log(colored);
    this.writeToFile(formatted);
  }

  debug(message) {
    if (process.env.NODE_ENV === 'development') {
      const formatted = this.formatMessage('debug', message);
      const colored = this.formatColoredMessage('debug', message, this.colors.magenta);
      console.log(colored);
      this.writeToFile(formatted);
    }
  }

  success(message) {
    const formatted = this.formatMessage('success', message);
    const colored = this.formatColoredMessage('success', message, this.colors.green);
    console.log(colored);
    this.writeToFile(formatted);
  }

  warning(message) {
    const formatted = this.formatMessage('warning', message);
    const colored = this.formatColoredMessage('warning', message, this.colors.yellow);
    console.warn(colored);
    this.writeToFile(formatted);
  }
}

module.exports = new Logger();