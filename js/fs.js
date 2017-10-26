const bfs = {}
BrowserFS.install(bfs)
BrowserFS.configure({
  fs: 'MountableFileSystem',
  options: {
    '/': {
      fs: 'LocalStorage'
    }
  }
}, (e) => {
  if (e) throw e
})

export default bfs.require('fs')
