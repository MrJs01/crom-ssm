const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { registerIpcHandlers } = require('./ipc/handlers');
const logger = require('./utils/logger');

logger.info('Iniciando aplicação Crom-SSM...');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    show: false, // Don't show the window until the welcome screen is ready
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the welcome screen first
  // path.join with __dirname is crucial for asar packaging
  mainWindow.loadFile(path.join(__dirname, '..', '..', 'dist', 'welcome.html'));
  logger.info('Janela principal criada, carregando a tela de boas-vindas.');
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // mainWindow.webContents.openDevTools();
}

ipcMain.on('navigate:to:main', () => {
    logger.info("Recebido evento para navegar para a aplicação principal.");
    if (mainWindow) {
        mainWindow.loadFile(path.join(__dirname, '..', '..', 'dist', 'index.html'));
    }
});


app.whenReady().then(() => {
  logger.info('App pronto. Registrando handlers IPC e criando janela.');
  registerIpcHandlers();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      logger.info('App ativado, criando nova janela.');
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  logger.info('Todas as janelas foram fechadas.');
  if (process.platform !== 'darwin') {
    logger.info('Plataforma não é macOS, encerrando aplicação.');
    app.quit();
  }
});

app.on('quit', () => {
  logger.info('Aplicação encerrada.');
});