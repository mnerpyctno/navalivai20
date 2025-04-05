const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const archiver = require('archiver');

const BACKUP_DIR = path.join(__dirname, 'backup');
const MAX_BACKUPS = 10;

// Создаем директорию для бэкапов, если её нет
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
}

function getCurrentDateTime() {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-');
}

function getGitChanges() {
    return new Promise((resolve, reject) => {
        // Получаем список измененных файлов и их статус
        exec('git status -s', (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            
            const changes = stdout.trim().split('\n').filter(Boolean);
            const files = changes.map(line => {
                const status = line.substring(0, 2).trim();
                const filePath = line.substring(3);
                return { status, path: filePath };
            }).filter(file => !file.path.startsWith('backup/')); // Исключаем файлы из папки backup
            
            resolve(files);
        });
    });
}

function getFileContent(filePath) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            reject(new Error(`File not found: ${filePath}`));
            return;
        }
        
        fs.readFile(filePath, 'utf8', (err, content) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(content);
        });
    });
}

function createBackup() {
    const timestamp = getCurrentDateTime();
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}.zip`);
    const output = fs.createWriteStream(backupPath);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    output.on('close', () => {
        console.log(`Backup created: ${backupPath}`);
        cleanupOldBackups();
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);

    getGitChanges().then(async (changes) => {
        if (changes.length === 0) {
            console.log('No changes detected, skipping backup');
            archive.finalize();
            return;
        }

        // Создаем prompt файл с описанием изменений
        let promptContent = `Backup created at: ${new Date().toISOString()}\n\n`;
        promptContent += 'Измененные файлы:\n\n';

        for (const change of changes) {
            const { status, path: filePath } = change;
            let statusText = '';
            
            switch (status) {
                case 'M': statusText = 'Изменен'; break;
                case 'A': statusText = 'Добавлен'; break;
                case 'D': statusText = 'Удален'; break;
                case '??': statusText = 'Новый файл'; break;
                default: statusText = 'Изменен';
            }

            promptContent += `${statusText}: ${filePath}\n`;
            
            if (status !== 'D' && status !== '??' && !filePath.startsWith('backup/')) {
                try {
                    const content = await getFileContent(filePath);
                    promptContent += `\nСодержимое файла ${filePath}:\n\`\`\`\n${content}\n\`\`\`\n\n`;
                } catch (err) {
                    console.warn(`Warning: Could not read file ${filePath}: ${err.message}`);
                    promptContent += `\n[Файл не удалось прочитать: ${err.message}]\n\n`;
                }
            }
        }

        promptContent += '\nИнструкция по восстановлению:\n';
        promptContent += '1. Распакуйте архив в корневую директорию проекта\n';
        promptContent += '2. Все файлы будут восстановлены в их оригинальные пути\n';
        promptContent += '3. Для удаленных файлов (статус "D") - удалите их вручную\n';
        promptContent += '4. Для новых файлов (статус "??") - создайте их вручную\n\n';
        promptContent += 'Примечание: Этот бэкап содержит только измененные файлы.';

        // Добавляем prompt файл в архив
        archive.append(promptContent, { name: 'prompt.txt' });

        // Добавляем измененные файлы в архив
        for (const change of changes) {
            const { status, path: filePath } = change;
            if (status !== 'D' && status !== '??' && !filePath.startsWith('backup/')) {
                try {
                    if (fs.existsSync(filePath)) {
                        archive.file(filePath, { name: filePath });
                    } else {
                        console.warn(`Warning: File ${filePath} does not exist, skipping`);
                    }
                } catch (err) {
                    console.error(`Error adding file ${filePath} to archive:`, err);
                }
            }
        }

        archive.finalize();
    }).catch(err => {
        console.error('Error getting git changes:', err);
        archive.finalize();
    });
}

function cleanupOldBackups() {
    fs.readdir(BACKUP_DIR, (err, files) => {
        if (err) {
            console.error('Error reading backup directory:', err);
            return;
        }

        const backupFiles = files
            .filter(file => file.startsWith('backup-') && file.endsWith('.zip'))
            .map(file => ({
                name: file,
                path: path.join(BACKUP_DIR, file),
                time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time);

        if (backupFiles.length > MAX_BACKUPS) {
            const filesToDelete = backupFiles.slice(MAX_BACKUPS);
            filesToDelete.forEach(file => {
                fs.unlink(file.path, err => {
                    if (err) {
                        console.error(`Error deleting old backup ${file.name}:`, err);
                    } else {
                        console.log(`Deleted old backup: ${file.name}`);
                    }
                });
            });
        }
    });
}

// Создаем бэкап при запуске скрипта
createBackup(); 