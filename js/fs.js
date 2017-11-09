export let MFS

BrowserFS.FileSystem.XmlHttpRequest.Create({
  index: 'js/bin/index.json'
}, (e, bin) => {
  BrowserFS.FileSystem.LocalStorage.Create((e, root) => {
    BrowserFS.FileSystem.MountableFileSystem.Create({
      '/': root,
      '/bin': bin
    }, (e, mfs) => {
      MFS = mfs
      BrowserFS.initialize(mfs)
    })
  })
})

export const FS = BrowserFS.BFSRequire('fs')
