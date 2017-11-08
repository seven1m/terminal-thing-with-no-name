import ArgParser from './shell/arg_parser.js'
import Pipeline from './shell/pipeline.js'
import Process from './process.js'
import Stream from './stream.js'

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
    this.stdin = new Stream()
    this.stdout = new Stream()
    this.stderr = new Stream()
  }

  execute(line, callback) {
    if (line.trim() === '') return callback()
    const parts = line.trim().split(/\s*\|\s*/).map((part) => ArgParser.parse(part))
    new Pipeline(parts, this.session, this.stdin, this.stdout, this.stderr).start((status) => {
      this.lastStatus = status
      callback()
    })
  }

  executeLine(line) {
    this.execute(line, () => {
      this.term.write(this.prompt())
      this.position = 0
      this.line = ''
    })
  }

  main() {
    this.setupStreams()
    this.term.write(this.prompt(), false)
    this.enableInput()
  }

  setupStreams() {
    this.term.on('key', (key, ev) => this.stdin.write(key, ev))
    const out = (str) => {
      str = str.replace(/\n/g, "\r\n")
      this.term.write.apply(this.term, [str].concat(Array.prototype.slice(arguments, 1)))
    }
    this.stdout.bind(out)
    this.stderr.bind(out)
  }

  enableInput() {
    if (this.inputEnabled) return
    this.inputEnabled = true
    this.handleKeyBound = this.handleKeyBound || this.handleKey.bind(this)
    this.stdin.bind(this.handleKeyBound)
  }
  
  disableInput() {
    if (!this.inputEnabled) return
    this.inputEnabled = false
    this.stdin.unbind()
  }
  
  handleKey(key, ev) {
    switch (ev.keyCode) {
      case KEYS.enter:
        this.term.write('\r\n')
        this.executeLine(this.line)
        break
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
        break
      case KEYS.tab:
        const words = this.line.split(/\s+/)
        const word = words[words.length - 1]
        this.session.fs.readdir(this.session.cwd, (err, files) => {
          const matching = files.filter((f) => f.indexOf(word) === 0)
          if (matching.length > 0) {
            const rest = matching[0].substring(word.length)
            this.line = this.line + rest
            this.position += rest.length
            this.term.write(rest)
          }
        })
        break
      case KEYS.up:
      case KEYS.down:
        break
      case KEYS.left:
        if (this.position > 0) {
          this.position--
          this.term.write('\b')
        }
        break
      case KEYS.right:
        if (this.position < this.line.length) {
          this.position++
          this.term.write('\x1B[1C')
        }
        break
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
  }
}

export default Shell
