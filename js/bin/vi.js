// simple vi-like editor

class Vi {
  constructor(session) {
    this.session = session
    this.term = session.term
  }

  main(args, status) {
    const path = args[0]
    this.term.writeln('hi from vi!')
    this.term.writeln(path)
    status(0)
  }
}

export default Vi
