import FS from '../fs.js'

class ShellBuiltins {
  constructor(term, shell) {
    this.term = term
    this.shell = shell
  }

  call(command, args, status) {
    const commands = {
      cd: true,
      clear: true,
      echo: true,
      ls: true,
      mkdir: true,
      pwd: true,
      rm: true,
      rmdir: true,
      touch: true
    }
    if (commands.hasOwnProperty(command)) {
      this[command].call(this, args, status)
    } else {
      this.term.writeln(`command not found: ${command}`)
      status(127)
    }
  }

  cd(args, status) {
    const path = args[0]
    const newCwd = expandPath(this.shell.cwd, path)
    FS.stat(newCwd, (err) => {
      if (err) {
        this.term.writeln(`cd: ${newCwd}: ${err}`)
        status(1)
      } else {
        this.shell.cwd = newCwd
        status(0)
      }
    })
  }

  clear(_args, status) {
    const height = this.term.geometry[1]
    for (let i=0; i<height-1; i++) {
      this.term.write('\r\n')
    }
    this.term.write('\x1B[0;0f')
    status(0)
  }

  echo(args, status) {
    args = args.map((arg) => expandVariables(arg, this.shell))
    this.term.writeln(args.join(' '))
    status(0)
  }

  ls(args, status) {
    const path = expandPath(this.shell.cwd, args[0] || '.')
    FS.readdir(path, (err, files) => {
      if (err) {
        this.term.writeln(`ls: ${path}: ${err}`)
        status(1)
      } else {
        files.forEach((file) => {
          this.term.writeln(file)
        })
        status(0)
      }
    })
  }

  mkdir(args, status) {
    const path = expandPath(this.shell.cwd, args[0] || '.')
    FS.mkdir(path, (err) => {
      if (err) {
        this.term.writeln(`mkdir: ${path}: ${err}`)
        status(1)
      } else {
        status(0)
      }
    })
  }

  pwd(_args, status) {
    this.term.writeln(this.shell.cwd)
    status(0)
  }

  rm(args, status) {
    const path = expandPath(this.shell.cwd, args[0] || '.')
    FS.unlink(path, (err) => {
      if (err) {
        this.term.writeln(`rm: ${path}: ${err}`)
        status(1)
      } else {
        status(0)
      }
    })
  }

  rmdir(args, status) {
    const path = expandPath(this.shell.cwd, args[0] || '.')
    FS.rmdir(path, (err) => {
      if (err) {
        this.term.writeln(`rmdir: ${path}: ${err}`)
        status(1)
      } else {
        status(0)
      }
    })
  }

  touch(args, status) {
    const path = expandPath(this.shell.cwd, args[0] || '.')
    FS.writeFile(path, '', (err) => {
      if (err) {
        this.term.writeln(`touch: ${path}: ${err}`)
        status(1)
      } else {
        status(0)
      }
    })
  }
}

const expandVariables = (string, shell) => {
  return string.replace(/\$(\?)|\$(\w+)|\$\{([^\}]+)\}/g, (match) => {
    const name = match[1] || match[2] || match[3]
    switch (name) {
      case '?':
        return shell.lastStatus
      default:
        return ''
    }
  })
}

const expandPath = (cwd, path) => {
  if (path.match(/^\//)) {
    return normalizePath(path)
  } else {
    path = path.replace(/\/$/, '')
    cwd = cwd.replace(/^\//, '').split('/')
    path.split('/').forEach((part) => {
      if (part.match(/^\.+$/)) {
        part.substring(1).split('').forEach(() => cwd.pop())
      } else {
        cwd.push(part)
      }
    })
    return normalizePath(cwd.join('/'))
  }
}

const normalizePath = (path) => (
  ('/' + path).replace(/\/\//g, '/').replace(/([^\/])\/$/, '$1')
)

export default ShellBuiltins
