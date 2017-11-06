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
    this.data.push(arguments)
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
}

export default Stream
