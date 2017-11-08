export let MFS

BrowserFS.FileSystem.LocalStorage.Create((e, ls) => {
  BrowserFS.FileSystem.MountableFileSystem.Create({
    '/': ls
  }, (e, mfs) => {
    MFS = mfs
    BrowserFS.initialize(mfs)
  })
})

export const FS = BrowserFS.BFSRequire('fs')
