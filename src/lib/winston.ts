import winston from "winston";

const { combine, timestamp, printf, colorize } = winston.format;

const logger = winston.createLogger({
  level: "info", 
  format: combine(
    colorize({ all: true }), 
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), 
  ],
});

export default logger;
