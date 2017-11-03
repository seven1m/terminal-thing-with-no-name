import ShellBuiltins from './shell/builtins.js'
import FS from './fs.js'

const KEYS = {
  backspace: 8,
  tab:       9,
  enter:     13,
  left:      37,
  up:        38,
  right:     39,
  down:      40
}

class Shell {
  constructor(session, prompt) {
    this.session = session
    this.term = session.term
    this.prompt = prompt
    this.line = ''
    this.position = 0
    this.listeners = {}
    this.lastStatus = 0
    this.builtins = new ShellBuiltins(this)
  }

  execute(line, callback) {
    const args = parseArgs(line)
    const command = args.shift()
    if (command.trim() === '') return callback()
    this.builtins.call(command, args, (status) => {
      this.lastStatus = status
      callback()
    })
  }

  main() {
    this.term.write(this.prompt(), false)
    this.term.on('key', (key, ev) => {
      switch (ev.keyCode) {
        case KEYS.enter:
          this.term.write('\r\n')
          this.execute(this.line, () => {
            this.term.write(this.prompt())
            this.position = 0
            this.line = ''
          })
          break;
        case KEYS.backspace:
          if (this.line.length > 0) {
            if (this.position > 0 && this.term.buffer.x === 0) {
              const x = this.term.geometry[0]
              const y = this.term.buffer.y // NOTE: this should be y - 1; maybe a bug in xterm.js?
              this.term.write(`\x1B[${y};${x}f `)
            }
            this.term.write('\b \b')
            this.line = this.line.substring(0, this.line.length - 1)
            this.position--
          }
          break;
        case KEYS.tab:
        case KEYS.up:
        case KEYS.down:
          break;
        case KEYS.left:
          if (this.position > 0) {
            this.position--
            this.term.write('\b')
          }
          break;
        case KEYS.right:
          if (this.position < this.line.length) {
            this.position++
            this.term.write('\x1B[1C')
          }
          break;
        default:
          if(this.position === this.line.length) {
            this.line = this.line + key
            this.term.write(key)
          } else {
            this.line = this.line.substring(0, this.position) + key + this.line.substring(this.position)
            this.term.write(key)
            const rest = this.line.substring(this.position + 1)
            this.term.write(rest)
            for (let i = 0; i < rest.length; i++) this.term.write('\b')
          }
          this.position++
      }
    })
  }

  run(program) {

  }
}

// adapted from http://krasimirtsonev.com/blog/article/Simple-command-line-parser-in-JavaScript
const parseArgs = (line) => {
  const args = []
  let readingPart = false
  let part = ''
  line = line.trim()
  for (var i=0; i<line.length; i++) {
    if (line.charAt(i) === ' ' && !readingPart) {
      if (line.charAt(i + 1) !== ' ') {
        args.push(part)
        part = ''
      }
    } else {
      if (line.charAt(i) === '"') {
        readingPart = !readingPart
      } else {
        part += line.charAt(i)
      }
    }
  }
  args.push(part)
  return args
}

export default Shell
