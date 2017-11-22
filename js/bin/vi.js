// simple vi-like editor

const MODES = [
  'normal', // 0
  'insert', // 1
  'command' // 2
]

const KEYS = {
  backspace: 8,
  enter: 13
}

class Vi extends Program {
  constructor(...args) {
    super(...args)
    this.mode = 0
    const dataString = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.

Why do we use it?

It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).`
    this.data = new Rope(dataString)
    this.lineLengths = dataString.split(/\n/).map((line) => line.length)
    this.topLineInWindow = 0
    this.lineNum = 0
    this.colNum = 0
    this.firstCharInWindow = 0
  }

  get width() {
    return this.term.geometry[0]
  }

  get height() {
    return this.term.geometry[1]
  }

  get currentLineLength() {
    return this.lineLengths[this.lineNum]
  }

  get currentLineHeight() {
    return this.getLineHeight(this.lineNum)
  }

  get currentLine() {
    let index = this.firstCharInWindow
    for (let i = this.topLineInWindow; i < this.lineNum; i++) {
      index = index + this.lineLengths[i] + 1
    }
    return this.data.substr(index, this.currentLineLength)
  }

  get lineCount() {
    return this.lineLengths.length
  }

  get x() {
    return (this.colNum % this.width) + 1
  }

  get y() {
    const base = this.getVerticalDistance(this.topLineInWindow, this.lineNum) + 1
    const lineWrap = Math.floor(this.colNum / this.width)
    return base + lineWrap
  }

  get bottomOfCurrentLine() {
    return this.getVerticalDistance(this.topLineInWindow, this.lineNum + 1)
  }

  get dataIndex() {
    let index = this.firstCharInWindow
    for (let i = this.topLineInWindow; i < this.lineNum; i++) {
      index = index + this.lineLengths[i] + 1
    }
    return index + this.colNum
  }

  get colNum() {
    return this._colNum
  }

  set colNum(n) {
    const lineLength = (this.mode === 1) ? this.currentLineLength : this.currentLineLength - 1
    n = Math.min(n, lineLength)
    n = Math.max(n, 0)
    this._colNum = n
  }

  fixColNum() {
    this.colNum = this.colNum // force fix
  }

  getVerticalDistance(line1, line2) {
    let negate = false
    if (line1 > line2) {
      [line1, line2] = [line2, line1]
      negate = true
    }
    let distance = 0
    for (let line = line1; line < line2; line++) {
      distance = distance + this.getLineHeight(line)
    }
    return distance * (negate ? -1 : 1)
  }

  getLineHeight(lineNum) {
    return Math.max(1, Math.ceil(this.lineLengths[lineNum] / this.width))
  }

  redraw() {
    this.term.clear()
    let lineNum = this.topLineInWindow
    let charNum = this.firstCharInWindow
    let lineSegment
    y: for (let y = 1; y <= this.height;) {
      this.jump(1, y)
      const lineLength = this.lineLengths[lineNum]
      const line = this.data.substr(charNum, lineLength)
      const segments = stringToSegments(line, this.width)
      for (let s = 0; s < segments.length; s++) {
        const segment = segments[s]
        this.write(segment)
        charNum = charNum + segment.length
        y++
        if (y > this.height) break y
      }
      charNum++ // one extra for the newline
      lineNum++
    }
    this.move() // reset cursor
  }

  write(string) {
    this.stdout.write(string.replace(/\r?\n/g, '\r\n'))
  }

  main(status) {
    //const path = this.args[0]
    this.redraw()
    this.normalMode()
    this.stdin.bind(this.handleKey.bind(this))
    this.exit = status
  }

  normalMode() {
    this.mode = 0
    this.clearStatus()
    this.move()
  }

  insertMode() {
    this.mode = 1
    this.message('-- INSERT --')
  }

  commandMode() {
    this.mode = 2
    this.clearStatus()
    this.jump(1, this.height)
    this.stdout.write(':')
    this.command = ':'
  }

  move() {
    this.jump(this.x, this.y)
  }

  jump(x, y) {
    this.stdout.write(`\x1B[${y};${x}f`)
  }

  clearStatus() {
    this.stdout.write(`\x1B[${this.height};0f`)
    for (let i = 0; i < this.width - 1; i ++) { this.stdout.write(' ') }
  }

  message(msg) {
    this.jump(1, this.height)
    this.stdout.write(msg)
    this.move()
  }

  executeCommand() {
    const command = this.command.trim().replace(/^:/, '')
    switch (command) {
      case 'q':
        this.stdout.writeln('')
        this.exit(0)
        break
      default:
        this.message(`unknown command: ${command}`)
        this.normalMode()
    }
  }

  handleKey(key, ev) {
    switch (this.mode) {
      case 0: // normal mode
        let lineHeight, lineLength, line, jumpCount, match
        switch (ev.key) {
          case '0':
            this.colNum = 0
            this.move()
            break
          case '$':
            this.colNum = this.currentLineLength - 1
            this.move()
            break
          case 'h':
          case 'ArrowLeft':
          case 'Backspace':
            this.colNum--
            this.move()
            break
          case 'j':
          case 'ArrowDown':
          case 'Enter':
            if (this.lineNum == this.lineCount - 1) break;
            this.lineNum = Math.min(this.lineNum + 1, this.lineCount - 1)
            while (this.bottomOfCurrentLine >= this.height) {
              this.firstCharInWindow = this.firstCharInWindow + this.lineLengths[this.topLineInWindow] + 1
              this.topLineInWindow++
            } 
            this.fixColNum()
            this.redraw()
            break
          case 'k':
          case 'ArrowUp':
            if (this.lineNum == 0) break;
            this.lineNum--
            if (this.y < 1) {
              this.topLineInWindow--
              this.firstCharInWindow = this.firstCharInWindow - this.lineLengths[this.topLineInWindow] - 1
            }
            this.fixColNum()
            this.redraw()
            break
          case 'l':
          case 'ArrowRight':
            this.colNum++
            this.move()
            break
          case 'i':
            this.insertMode()
            break
          case 'I':
            this.insertMode()
            match = this.currentLine.match(/[^\s]/)
            if (match) {
              this.colNum = match.index
            } else {
              this.colNum = this.currentLineLength
            }
            break
          case 'a':
            this.insertMode()
            this.colNum++
            break
          case 'A':
            this.insertMode()
            this.colNum = this.currentLineLength + 1
            break
          case 'w':
            line = this.currentLine.substring(this.colNum)
            if (line.length <= 1) {
              if (this.lineNum < this.lineCount - 1) {
                this.lineNum++
                this.colNum = line.match(/^\s*/)[0].length
              }
            } else {
              match = line.match(/^[a-z0-9_]+\s*/i)
              if (match) {
                this.colNum = this.colNum + match[0].length
              } else {
                match = line.match(/^[^\s]+/)
                if (match) {
                  this.colNum = this.colNum + match[0].length
                } else {
                  match = line.match(/^\s*/)
                  this.colNum = this.colNum + match[0].length
                }
              }
            }
            break
          case ':':
            this.commandMode()
            break
        }
        this.message(this.dataIndex.toString() + '    ')
        break
      case 1: // insert mode
        switch (ev.key) {
          case 'Backspace':
            if (this.colNum === 0) break
            this.data.remove(this.dataIndex - 1, this.dataIndex)
            this.colNum--
            this.lineLengths[this.lineNum]--
            this.redraw()
            break
          case 'Escape':
            this.normalMode()
            this.fixColNum()
            break
          default:
            this.data.insert(this.dataIndex, key)
            this.lineLengths[this.lineNum]++
            this.colNum++
            this.redraw()
        }
        break
      case 2: // command mode
        switch (ev.keyCode) {
          case KEYS.enter:
            this.executeCommand()
            break
          case KEYS.backspace:
            this.command = this.command.substring(0, this.command.length - 1)
            this.stdout.write('\b \b')
            break
          default:
            this.command = this.command + key
            this.stdout.write(key)
        }
        break
    }
  }
}

const stringToSegments = (string, width) => {
  if (string.length <= width) {
    return [string]
  } else {
    let consumed = 0
    let segments = []
    while (consumed < string.length) {
      segments.push(string.substr(consumed, width))
      consumed = consumed + width
    }
    return segments
  }
}

export default Vi
