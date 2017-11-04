class Stream {
  bind(callback) {
    this.callback = callback
  }

  unbind() {
    this.callback = null
  }

  write(_args) {
    if (!this.callback) return
    this.callback.apply(null, arguments)
  }

  writeln(string) {
    if (!this.callback) return
    this.callback.call(null, string + "\r\n")
  }

  pipe(emitter) {
    this.callback = emitter.emit
  }
}

export default Stream
