import * as Builtins from './builtins.js'
import Process from '../process.js'
import Stream from '../stream.js'

class Pipeline {
  constructor(parts, session, stdin, stdout, stderr) {
    this.parts = parts
    this.session = session
    this.stdin = stdin
    this.stdout = stdout
    this.stderr = stderr
  }

  start(status) {
    let stdin = this.stdin
    let stdout = this.stdout
    let stderr = this.stderr
    let index = 0
    this.parts.forEach((part) => {
      const command = part[0]
      const args = part.slice(1)
      const program = Builtins[command]
      const first = index == 0
      const last = index == this.parts.length - 1
      stdin = first ? this.stdin : stdout
      stdout = last ? this.stdout : new Stream()
      index++
      if (program) {
        const process = new Process(program, args, this.session, stdin, stdout, stderr)
        const callback = (s) => { 
          if (s === 0 && last) {
            status(0)
          } else if (s === 0) {
            stdout.close()
          } else {
            status(s)
          }
        }
        process.start(callback)
      } else {
        this.stderr.writeln(`command not found: ${command}`)
        status(127)
      }
    })
  }
}

export default Pipeline
