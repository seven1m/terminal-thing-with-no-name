import Shell from './js/shell.js'
import { MFS, FS } from './js/fs.js'

class Session {
  constructor() {
    this.MFS = MFS
    this.term = new Terminal()
    this.env = {
      PWD: '/'
    }
    this.fs = FS
  }

  get cwd() {
    return this.env['PWD']
  }

  set cwd(dir) {
    this.env['PWD'] = dir
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
