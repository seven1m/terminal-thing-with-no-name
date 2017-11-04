class Program {
  constructor(args, session, stdin, stdout, stderr) {
    this.args = args
    this.session = session
    this.stdin = stdin
    this.stdout = stdout
    this.stderr = stderr
  }
}

export class cat extends Program {
  main(status) {
    this.args.forEach((arg) => {
      const path = expandPath(this.session.cwd, arg)
      this.stdout.writeln(this.session.fs.readFileSync(path))
      status(0)
    })
  }
}

export class cd extends Program {
  main(status) {
    const path = this.args[0]
    const newCwd = expandPath(this.session.cwd, path)
    this.session.fs.stat(newCwd, (err) => {
      if (err) {
        this.stderr.writeln(`cd: ${newCwd}: ${err}`)
        status(1)
      } else {
        this.session.cwd = newCwd
        status(0)
      }
    })
  }
}

export class clear extends Program {
  main(status) {
    const height = this.session.term.geometry[1]
    for (let i=0; i<height-1; i++) {
      this.stdout.write('\r\n')
    }
    this.stdout.write('\x1B[0;0f')
    status(0)
  }
}

export class echo extends Program {
  main(status) {
    const strings = this.args.map((arg) => expandVariables(arg, this.session.shell))
    this.stdout.writeln(strings.join(' '))
    status(0)
  }
}

export class ls extends Program {
  main(status) {
    const path = expandPath(this.session.cwd, this.args[0] || '.')
    this.session.fs.readdir(path, (err, files) => {
      if (err) {
        this.stderr.writeln(`ls: ${path}: ${err}`)
        status(1)
      } else {
        files.forEach((file) => {
          this.stdout.writeln(file)
        })
        status(0)
      }
    })
  }
}

export class mkdir extends Program {
  main(status) {
    const path = expandPath(this.session.cwd, this.args[0] || '.')
    this.session.fs.mkdir(path, (err) => {
      if (err) {
        this.stderr.writeln(`mkdir: ${path}: ${err}`)
        status(1)
      } else {
        status(0)
      }
    })
  }
}

export class pwd extends Program {
  main(status) {
    this.stdout.writeln(this.session.cwd)
    status(0)
  }
}

export class rm extends Program {
  main(status) {
    const path = expandPath(this.session.cwd, this.args[0] || '.')
    this.session.fs.unlink(path, (err) => {
      if (err) {
        this.stderr.writeln(`rm: ${path}: ${err}`)
        status(1)
      } else {
        status(0)
      }
    })
  }
}

export class rmdir extends Program {
  main(status) {
    const path = expandPath(this.session.cwd, this.args[0] || '.')
    this.session.fs.rmdir(path, (err) => {
      if (err) {
        this.stderr.writeln(`rmdir: ${path}: ${err}`)
        status(1)
      } else {
        status(0)
      }
    })
  }
}

export class touch extends Program {
  main(status) {
    const path = expandPath(this.session.cwd, this.args[0] || '.')
    this.session.fs.writeFile(path, '', (err) => {
      if (err) {
        this.stderr.writeln(`touch: ${path}: ${err}`)
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
