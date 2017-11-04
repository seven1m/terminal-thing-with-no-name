import Shell from './js/shell.js'
import FS from './js/fs.js'

class Session {
  constructor() {
    this.term = new Terminal()
    this.cwd = '/'
    this.fs = FS
  }

  start() {
    this.term.open(document.getElementById('terminal'), true);
    this.term.fit()
    this.shell = new Shell(this, () => `${this.cwd}$ `)
    this.shell.main()
  }
}

window.session = new Session()
session.start()
