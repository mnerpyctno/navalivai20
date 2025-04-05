const chokidar = require('chokidar');
const { exec } = require('child_process');

// Игнорируемые директории и файлы
const ignored = [
    /node_modules/,
    /\.git/,
    /backup/,
    /\.next/,
    /out/,
    /build/,
    /coverage/,
    /.*\.log$/,
    /.*\.zip$/,
    /backup\/.*/  // Добавляем все содержимое папки backup
];

// Создаем наблюдатель
const watcher = chokidar.watch('.', {
    ignored: ignored,
    persistent: true,
    ignoreInitial: true,
    ignorePermissionErrors: true
});

// Функция для создания бэкапа
function createBackup() {
    console.log('Creating backup...');
    exec('npm run backup', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error creating backup: ${error}`);
            return;
        }
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
    });
}

// Обработчики событий
watcher
    .on('add', path => {
        if (!path.startsWith('backup/')) {
            console.log(`File ${path} has been added`);
            createBackup();
        }
    })
    .on('change', path => {
        if (!path.startsWith('backup/')) {
            console.log(`File ${path} has been changed`);
            createBackup();
        }
    })
    .on('unlink', path => {
        if (!path.startsWith('backup/')) {
            console.log(`File ${path} has been removed`);
            createBackup();
        }
    });

console.log('Watching for file changes...'); 