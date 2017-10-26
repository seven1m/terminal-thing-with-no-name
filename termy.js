import Shell from './js/shell.js'

window.shell = new Shell('terminal', (cwd) => `${cwd}$ `)
shell.start()
