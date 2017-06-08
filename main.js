const electron = require('electron');
const settings = require('electron-settings');
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const ipc = electron.ipcMain
const path = require('path')
const url = require('url')
const Menu = electron.Menu
const MenuItem = electron.MenuItem
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

let template  = [{
  label : '文件',
    submenu:[
          { label: '保存',
            accelerator: 'ctrl+s',
            click: function () {
                saveSetting()
            }
          },
          {
            label: '打开',
            accelerator: 'ctrl+a',
            click:function () {
                openItSetting()

              }
          }
        ]
}]


const menu = new Menu();
menu.append(new MenuItem({label: '复制'}));
menu.append(new MenuItem({type: 'separator'}));
menu.append(new MenuItem({label:'Electron', type:'checkbox', checked: true}));

app.on('browser-window-created', function (event, win) {
    win.webContents.on('context-menu',function (e,params) {
        menu.popup(win, params.x, params.y)

    })

});

ipc.on('show-context-menu',function (event) {
    const win = BrowserWindow.fromWebContents(event.sender)
    menu.popup(win)

});

function findReopenMenuItem () {
    const menu = Menu.getApplicationMenu()
    if (!menu) return

    let reopenMenuItem
    menu.items.forEach(function (item) {
        if (item.submenu) {
            item.submenu.items.forEach(function (item) {
                if (item.key === 'reopenMenuItem') {
                    reopenMenuItem = item
                }
            })
        }
    })
    return reopenMenuItem
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
      x:settings.get('size.x'),
      y:settings.get('size.y'),
      width: settings.get('size.width'),
      height: settings.get('size.height')
  })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  mainWindow.on('close',function () {
      let size = mainWindow.getBounds();
      settings.set('size',{
          x:size.x,
          y:size.y,
          width: size.width,
          height:size.height

      })
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('ready', function () {
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
})
app.on('browser-window-created', function () {
    let reopenMenuItem = findReopenMenuItem()
    if (reopenMenuItem) reopenMenuItem.enabled = false
})

app.on('window-all-closed', function () {
    let reopenMenuItem = findReopenMenuItem()
    if (reopenMenuItem) reopenMenuItem.enabled = true
})
app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
