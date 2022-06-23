const fs = require('fs');
const cron = require('node-cron');
const mysqldump = require('mysqldump');
const moment = require('moment');
const zlib = require('minizlib');

if (!fs.existsSync('config.json')) {
    fs.writeFileSync('config.json', JSON.stringify({
        "servers": [
            {
                "host": "localhost",
                "user": "ENTER MYSQL USER",
                "passwd": "ENTER MYSQL PASSWD",
                "scheduler": "0 2 * * *",
                "backup_path": "C:/MySQL_Backups/",
                "store_days": 14,
                "compress": true,
                "schemas": [
                    {
                        "schema": "ENTER_SCHEMA_NAME"
                    },
                    {
                        "schema": "ENTER_SCHEMA2_NAME"
                    }
                ]
            }
        ]
    }, null, 4));
    console.log("There was no config.json file for this server.\nconfig.json created.\n\nPlease open up the config.json and add the servers to ensure backups.");

    process.exit(1);
}


const config = JSON.parse(fs.readFileSync('config.json', `utf8`));
if (config.servers) {
    for (const server of config.servers) {
        cron.schedule(server.scheduler, () => makeBackup(server));
    }
}

async function makeBackup (server) {
    const userBackupPath = server.backup_path.endsWith('/') ? server.backup_path : `${server.backup_path}/`;

    for(const schema of server.schemas) {
        let backupPath = `${userBackupPath}${schema.schema}/${moment().format(`YYYY-MM-DD`)}`;
        if (!fs.existsSync(backupPath)){
            fs.mkdirSync(backupPath, {recursive: true}, err => {
                console.log(`Error while creating the directory ${backupPath}`)});
        }

        const fileName = `${backupPath}/${moment().format(`YYYY-MM-DD_hh-mm`)}-${schema.schema}.sql`;

        await mysqldump({
            connection: {
                host: server.host,
                user: server.user,
                password: server.passwd,
                database:schema.schema,
            },
            dumpToFile: fileName,
            compressFile: false,
        });
    }

    for(const schema of server.schemas) {
        if(parseInt(server.store_days) > 0) {
            // clean up old data
            const backupFolders = fs.readdirSync(`${userBackupPath}${schema.schema}`);
            for (const backupFolder of backupFolders) {
                // try parse backup folder into date
                if(moment(backupFolder).diff(moment(), 'days') + server.store_days < 0) {
                    console.log(`found old log that is not needed anymore: ${schema.schema}/${backupFolder}`);
                    fs.rmdirSync(`${userBackupPath}${schema.schema}/${backupFolder}`, { recursive: true });
                }
            }
        }
    }
}


