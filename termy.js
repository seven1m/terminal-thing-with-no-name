import Shell from './js/shell.js'

class Session {
  constructor() {
    this.term = new Terminal()
    this.cwd = '/'
  }

  start() {
    this.term.open(document.getElementById('terminal'), true);
    this.term.fit()
    this.shell = new Shell(this, () => `${this.cwd}$ `)
    this.shell.main()
  }
}

const session = new Session()
session.start()
