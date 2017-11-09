// simple vi-like editor

class Vi extends Program {
  main(status) {
    const path = this.args[0]
    this.term.writeln('hi from vi!')
    this.stdin.bind(this.handleKey.bind(this))
    this.onComplete = status
  }

  handleKey(key, ev) {
    if (key === 'q') {
      this.onComplete(0)
    } else {
      this.stdout.write(key)
    }
  }
}

export default Vi
