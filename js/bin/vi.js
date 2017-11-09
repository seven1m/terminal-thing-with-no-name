// simple vi-like editor

class Vi extends Program {
  main(status) {
    const path = this.args[0]
    this.term.writeln('hi from vi!')
    this.term.writeln(path)
    status(0)
  }
}

export default Vi
