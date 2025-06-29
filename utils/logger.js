const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',

    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',

    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m'
};

class Logger {
    static log(category, message, color = colors.white) {
        const timestamp = new Date().toLocaleTimeString();
        const categoryFormatted = `[${category.toUpperCase()}]`;
        console.log(`${colors.gray}${timestamp}${colors.reset} ${color}${categoryFormatted}${colors.reset} ${message}`);
    }

    static info(message) {
        this.log('INFO', message, colors.blue);
    }

    static success(message) {
        this.log('SUCCESS', message, colors.green);
    }

    static warning(message) {
        this.log('WARNING', message, colors.yellow);
    }

    static error(message, ...args) {
        const timestamp = new Date().toLocaleTimeString();
        console.error(`${timestamp} [ERROR] ${message}`, ...args);
    }

    static debug(message, ...args) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`${timestamp} [DEBUG] ${message}`, ...args);
    }

    static discord(message) {
        this.log('DISCORD', message, colors.magenta);
    }

    static telegram(message) {
        this.log('TELEGRAM', message, colors.cyan);
    }

    static web(message) {
        this.log('WEB', message, colors.green);
    }

    static command(message) {
        this.log('COMMAND', message, colors.yellow);
    }

    static system(message) {
        this.log('SYSTEM', message, colors.bright + colors.white);
    }

    static startup(message) {
        this.log('STARTUP', message, colors.bright + colors.green);
    }

    static separator() {
        console.log(`${colors.cyan}========================================${colors.reset}`);
    }

    static header(title) {
        console.log(`${colors.cyan}===== ${colors.bright}${colors.white}${title}${colors.reset}${colors.cyan} =====${colors.reset}`);
    }

    static ready() {
        console.log();
        this.log('SYSTEM', 'All systems operational', colors.bright + colors.green);
        this.log('SYSTEM', 'Dashboard: http://0.0.0.0:5000', colors.cyan);
        this.log('SYSTEM', 'Bot is now listening for commands...', colors.yellow);
        console.log();
    }
}

module.exports = Logger;