const fs = require('fs');
const cron = require('node-cron');
const mysqldump = require('mysqldump');
const moment = require('moment');
const Backup_cleanup = require("./backup_cleanup");
const encryption = require("./encryption");
const AppendInitVect = require('./AppendInitVector');
const zlib = require('zlib');

if (!fs.existsSync('config.json')) {
    fs.writeFileSync('config.json', JSON.stringify({
        "servers": [
            {
                "host": "localhost",
                "user": "ENTER MYSQL USER",
                "passwd": "ENTER MYSQL PASSWD",
                "scheduler": "0 2 * * *",
                "backup_path": "C:/MySQL_Backups/",
                "backup_type": "periodic",
                "storage_period": {
                    "daily": 7,
                    "weekly": {
                        "weeks": 4,
                        "storage_day": 6
                    },
                    "monthly": {
                        "months": 6,
                        "storage_day": 31
                    }
                },
                "compress": true,
                "encrypt": false,
                "encrypt_passwd": "ENTER_ENCRYPTION_PASSWD",
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
        let backupPath = `${userBackupPath}${server.host}/${schema.schema}/${moment().format(`YYYY-MM-DD`)}`;
        if (!fs.existsSync(backupPath)){
            fs.mkdirSync(backupPath, {recursive: true}, err => {
                console.log(`Error while creating the directory ${backupPath}`)});
        }

        const fileName = `${backupPath}/${moment().format(`YYYY-MM-DD_HH-mm`)}-${schema.schema}.sql`;

        await mysqldump({
            connection: {
                host: server.host,
                user: server.user,
                password: server.passwd,
                database:schema.schema,
            },
            dumpToFile: fileName,
        });

        // check if file has to be processed further
        if(server.compress || server.encrypt) {
            let newFileName = fileName;
            // make the readstream
            let pipedStream = fs.createReadStream(fileName);

            if(server.compress) {
                newFileName += '.gz';
                // add compression
                pipedStream = pipedStream.pipe(zlib.createGzip());
            }

            if(server.encrypt) {
                newFileName += '.enc';

                const key = encryption.getCipherKey(server.encrypt_passwd);
                const initVector = encryption.getInitVector();

                // add encryption (also for large files)
                pipedStream = pipedStream.pipe(encryption.getCryptoStream(key, initVector));
                pipedStream = pipedStream.pipe(new AppendInitVect(initVector));
            }

            // add a writer
            pipedStream = pipedStream.pipe(fs.createWriteStream(newFileName));

            // now delete old file
            pipedStream.on('finish', () => fs.unlinkSync(fileName));
        }
    }

    for(const schema of server.schemas) {
        Backup_cleanup.handleCleanup(server.backup_type, server, schema)
    }
}


