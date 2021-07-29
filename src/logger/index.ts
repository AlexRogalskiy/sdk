import consola from 'consola'

// const consola = require('consola')

// export const pinoLogger = pino({ name: 'cloud-graph', prettyPrint: process.env.NODE_ENV === 'development' })

export class Logger {
  constructor(debug: string) {
    const levelRange = ['-1', '0', '1', '2', '3', '4', '5']
    this.logger = consola.create({
      level: levelRange.indexOf(debug) > -1 ? Number(debug) : 3,
    })
  }

  logger: typeof consola

  // Legacy log method
  log(
    msg: string | Array<any> | any,
    options: { verbose?: boolean; level?: string } = {}
  ): void {
    const { verbose, level = 'info' } = options
    if (verbose) {
      // TODO: Implement verbose loggeer
    } else {
      this.logger[level](msg)
    }
  }

  info(msg: string | Array<any> | any) {
    this.logger.info(msg)
  }

  error(msg: string | Array<any> | any) {
    this.logger.error(msg)
  }

  success(msg) {
    this.logger.success(msg)
  }

  warn(msg: string | Array<any> | any) {
    this.logger.warn(msg)
  }

  debug(msg: string | Array<any> | any) {
    this.logger.debug(msg)
  }
}

export default new Logger(process.env.DEBUG)
