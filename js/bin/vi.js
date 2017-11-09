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
  }

  main(status) {
    //const path = this.args[0]
    this.term.clear()
    this.term.write(this.data.replace(/\r?\n/g, '\r\n'))
    this.normalMode()
    this.stdin.bind(this.handleKey.bind(this))
    this.exit = status
  }

  normalMode() {
    this.mode = 0
    const x = 0 // TODO
    const y = 0 // TODO
    this.term.write(`\x1B[${x};${y}f`)
  }

  insertMode() {
    this.mode = 1
  }

  commandMode() {
    this.mode = 2
    const height = this.term.geometry[1]
    this.clearStatus()
    this.term.write(`\x1B[${height};0f:`)
    this.command = ':'
  }

  clearStatus() {
    const height = this.term.geometry[1]
    this.term.write(`\x1B[${height};0f:`)
    const width = this.term.geometry[0]
    for (let i = 0; i < width - 1; i ++) { this.term.write(' ') }
  }

  message(msg) {
    const height = this.term.geometry[1]
    this.term.write(`\x1B[${height};0f:`)
    this.term.write(msg)
  }

  executeCommand() {
    const command = this.command.trim().replace(/^:/, '')
    switch (command) {
      case 'q':
        this.term.writeln('')
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
            this.term.write('\x1b[1D')
            break
          case 'j':
          case 'ArrowDown':
            this.term.write('\x1B[1B')
            break
          case 'k':
          case 'ArrowUp':
            this.term.write('\x1B[1A')
            break
          case 'l':
          case 'ArrowRight':
            this.term.write('\x1B[1C')
            break
          case ':':
            this.commandMode()
            break
        }
        break
      case 1:
        switch (ev.keyCode) {
          case KEYS.backspace:
            this.term.write('\b \b')
            break
          default:
            this.command = this.command + key
            this.term.write(key)
        }
        break
      case 2:
        switch (ev.keyCode) {
          case KEYS.enter:
            this.executeCommand()
            break
          case KEYS.backspace:
            this.command = this.command.substring(0, this.command.length - 1)
            this.term.write('\b \b')
            break
          default:
            this.command = this.command + key
            this.term.write(key)
        }
        break
    }
  }
}

export default Vi
