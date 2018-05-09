const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function() {
    // create a new window
    mainWindow = new BrowserWindow({});
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true,
    }));

    // Quit app when mainWindow is closed
    mainWindow.on('closed', function() {
        app.quit();
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu into application
    Menu.setApplicationMenu(mainMenu);
});

// Handle create add item window
function createAddWindow() {
    addWindow = new BrowserWindow({
        width:  300,
        height: 200,
        title:  'Add Shipping List Item'
    });
    // Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true,
    }));
    // Garbage Collection Handle (Prevent memory leak by freeing the addWindow variable for GC)
    addWindow.on('closed', function() {
        addWindow = null;
    });
}

// Catch item:add from addWindow
ipcMain.on('item:add', function(e, item){
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
    {
        label: "File",
        submenu: [
            {
                label: 'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

//  if Mac add empty ohject to menu to prevent default "Electron" label from appearing
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

// Add Developer Tools if we are not in production
if (process.env.NODE_ENV != 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools(); //focusedWindow is the currently active window.  Call chromiums built in toggleDevTools function
                }
            },
            {
                role: 'reload' // Setting this enables a "relaod" option to refresh the page
            }
        ]
    });
}
