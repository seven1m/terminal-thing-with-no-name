class Stream {
  constructor() {
    this.data = []
    this.closed = false
  }

  bind(callback) {
    this.callback = callback
    this.data.forEach((args) => this.callback.apply(null, args))
    this.data.length = 0
  }

  unbind() {
    this.callback = null
  }

  onClosed(callback) {
    this.closedCallback = callback
    if (this.closed) this.closedCallback()
  }

  close() {
    this.closed = true
    if (this.closedCallback) this.closedCallback()
  }

  write(_args) {
    let args = []
    for (let i = 0; i < arguments.length; i++) {
      args.push(arguments[i])
    }
    this.data.push(args)
    if (this.callback) {
      this.data.forEach((args) => this.callback.apply(null, args))
      this.data.length = 0
    }
  }

  writeln(string) {
    this.write(string + "\n")
  }

  pipe(emitter) {
    this.callback = emitter.emit
  }

  get dataAsString() {
    let parts = []
    this.data.forEach((part) => parts.push(part[0]))
    return parts.join('\n')
  }
}

export default Stream
