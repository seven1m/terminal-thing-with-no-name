import Shell from './js/shell.js'
import { fsWrapper, FS } from './js/fs.js'

Terminal.applyAddon(fit)

class Session {
  constructor() {
    this.fsWrapper = fsWrapper
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
    this.term.clear = () => {
      // this clear is better than the built-in one
      const height = this.term.geometry[1]
      this.term.write(`\x1B[${height};0f`)
      for (let i = 0; i < height; i++) {
        this.term.write('\r\n')
      }
      this.term.write('\x1B[0;0f')
    }
    this.shell = new Shell(this, () => `${this.cwd}$ `)
    this.shell.main()
  }
}

window.session = new Session()
session.start()
