// simple vi-like editor

const MODES = [
  'normal', // 0
  'insert', // 1
  'command' // 2
]

const KEYS = {
  backspace: 8,
  enter: 13
}

class Vi extends Program {
  constructor(...args) {
    super(...args)
    this.mode = 0
    this.data = "Welcome to an editor that loosely resembles Vi!\n\nType :q to quit."
    this.x = 1
    this.y = 1
  }

  main(status) {
    //const path = this.args[0]
    this.term.clear()
    this.stdout.write(this.data.replace(/\r?\n/g, '\r\n'))
    this.normalMode()
    this.stdin.bind(this.handleKey.bind(this))
    this.exit = status
  }

  normalMode() {
    this.mode = 0
    this.stdout.write(`\x1B[${this.y};${this.x}f`)
  }

  insertMode() {
    this.mode = 1
  }

  commandMode() {
    this.mode = 2
    const height = this.term.geometry[1]
    this.clearStatus()
    this.stdout.write(`\x1B[${height};0f:`)
    this.command = ':'
  }

  clearStatus() {
    const height = this.term.geometry[1]
    this.stdout.write(`\x1B[${height};0f:`)
    const width = this.term.geometry[0]
    for (let i = 0; i < width - 1; i ++) { this.stdout.write(' ') }
  }

  message(msg) {
    const height = this.term.geometry[1]
    this.stdout.write(`\x1B[${height};0f:`)
    this.stdout.write(msg)
  }

  executeCommand() {
    const command = this.command.trim().replace(/^:/, '')
    switch (command) {
      case 'q':
        this.stdout.writeln('')
        this.exit(0)
        break
      default:
        this.message(`unknown command: ${command}`)
        this.normalMode()
    }
  }

  handleKey(key, ev) {
    switch (this.mode) {
      case 0:
        switch (ev.key) {
          case 'h':
          case 'ArrowLeft':
            this.stdout.write('\x1b[1D')
            this.x = Math.max(0, this.x - 1)
            break
          case 'j':
          case 'ArrowDown':
            this.stdout.write('\x1B[1B')
            this.y = this.y + 1
            break
          case 'k':
          case 'ArrowUp':
            this.stdout.write('\x1B[1A')
            this.y = Math.max(0, this.y - 1)
            break
          case 'l':
          case 'ArrowRight':
            this.stdout.write('\x1B[1C')
            this.x = this.x + 1
            break
          case ':':
            this.commandMode()
            break
        }
        break
      case 1:
        switch (ev.keyCode) {
          case KEYS.backspace:
            this.stdout.write('\b \b')
            break
          default:
            this.command = this.command + key
            this.stdout.write(key)
        }
        break
      case 2:
        switch (ev.keyCode) {
          case KEYS.enter:
            this.executeCommand()
            break
          case KEYS.backspace:
            this.command = this.command.substring(0, this.command.length - 1)
            this.stdout.write('\b \b')
            break
          default:
            this.command = this.command + key
            this.stdout.write(key)
        }
        break
    }
  }
}

export default Vi
