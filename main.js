const { app, BrowserWindow, ipcMain } = require('electron');
const {autoUpdater} = require("electron-updater");
require('@electron/remote/main').initialize();

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    backgroundColor: '#1c1c1c',
    show: false,
    webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        contextIsolation: false,
        devTools: true,
        sandbox: false
    }
  })


  mainWindow.loadFile('./CLIENT/HTML/load.html')
  require("@electron/remote/main").enable(mainWindow.webContents);
  mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', function (){
    mainWindow.show();
});

}
var updateCheck = false;
var updateMsg = '';
app.whenReady().then(() => {

  ipcMain.handle('updates', async (event, someArgument) => {
    if(!updateCheck){
      autoUpdater.checkForUpdatesAndNotify().then((res) => {
        if(res != null){
          return;
        }else{
          updateMsg = 'UPDATE NOT AVAILABLE';
        }
      });
      autoUpdater.autoDownload = true;
      autoUpdater.autoInstallOnAppQuit = true;
      autoUpdater.autoRunAppAfterInstall = true;

      updateMsg = 'CHECKING FOR UPDATES';

      autoUpdater.on('checking-for-update', () => {
        updateMsg = 'CHECKING FOR UPDATES';
        console.log('Checking for update...');
      })
      autoUpdater.on('update-available', (info) => {
        updateMsg = 'UPDATE AVAILABLE';
        console.log('Update available.');
      })
      autoUpdater.on('update-not-available', (info) => {
        updateMsg = 'UPDATE NOT AVAILABLE';
        console.log('Update not available.');
      })
      autoUpdater.on('error', (err) => {
        updateMsg = 'ERROR IN UPDATING' + err;
        console.log('Error in auto-updater. ' + err);
      })
      autoUpdater.on('download-progress', (progressObj) => {
        let log_message = "Download speed: " + progressObj.bytesPerSecond;
        log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
        log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
        updateMsg = log_message;
        console.log(log_message);
      })
      autoUpdater.on('update-downloaded', (info) => {
        updateMsg = 'UPDATE DOWNLOADED';
        autoUpdater.quitAndInstall();
        console.log('Update downloaded');
      });

      updateCheck = true;
    }
    return updateMsg;
  })
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
