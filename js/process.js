class Process {
  constructor(program, args, session, stdin, stdout, stderr) {
    this.program = new program(args, session, stdin, stdout, stderr)
  }

  start(status) {
    this.program.main(status)
  }
}

export default Process
