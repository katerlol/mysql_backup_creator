# MySQL Backup Creator

This is an approach to make easy MySQL Backups on servers.

The configuration is done in a config.json file. 


## 1. Installation:

Install all the missing packages by running:

``
npm install
``

- "fs": "^0.0.1-security",
- "moment": "^2.29.3",
- "mysqldump": "^3.2.0",
- "node-cron": "^3.0.1",
- "uuid": "^8.3.2",

## 2. Configuration

Run the app once to generate a template `config.json`:

````json
{
  "servers": [{
    "host": "localhost",
    "user": "YOUR_USER",
    "passwd": "YOUR_PASSWORD",
    "scheduler": "* * * * *",
    "backup_path": "C:/MySQLBackups/",
    "compress": false,
    "encrypt": false,
    "encrypt_passwd": "ENTER ENCRYPTION PASSWD",
    "backup_type": "periodic",
    "storage_period": {
      "daily": 4,
      "weekly": {
        "weeks": 4,
        "storage_day": 6
      },
      "monthly": {
        "months": 6,
        "storage_day": 31
      }
    },
    "schemas": [{
      "schema": "YOUR_DATABASE"
    },
      {
        "schema": "ANOTHER_DATABASE_ON_THE_SAME_SERVER"
      }
    ]
  }]
}
````
| Config-Key  | Options                    |                                                                                                                                                                                                                                                                                                               | Value options          |
|-------------|----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|
| **Servers** |                            | A list of servers that can be backed up.                                                                                                                                                                                                                                                                      | Array of Servers       |
|             | **user**                   | Your server address. e.h. localhost.                                                                                                                                                                                                                                                                          | String                 |
|             | **passwd**                 | Password to the MySQL server.                                                                                                                                                                                                                                                                                 | String                 |
|             | **scheduler**              | Scheduler, when the back should be done. Follows the Cron schedule expressions.                                                                                                                                                                                                                               | Cron Schedule          |
|             | **backup_path**            | The path where the backups can be found. If the path doesn't exist, it will be created, if possible.                                                                                                                                                                                                          | String                 |
|             | **compress**               | Determines, wether the data should be compressed.                                                                                                                                                                                                                                                             | boolean                |
|             | **encrypt**                | Determines, wether the data should be encrypted. The encryption will be done in AES-256                                                                                                                                                                                                                       | boolean                |
|             | **encrypt_passwd**         | The password that is used for encryption.                                                                                                                                                                                                                                                                     | String                 |
|             | **backup_type**            | Determines, wether the data should be compressed.                                                                                                                                                                                                                                                             | "periodic", "amount"   |
|             | **storage_period**         | consists out of the following three options. <br/>**daily**, **weekly**, **monthly**                                                                                                                                                                                                                          | Object                 |
|             | **storage_period.daily**   | Determines, how many days a backup is kept                                                                                                                                                                                                                                                                    | integer, 0 if infinite |
|             | **storage_period.weekly**  | Determines, how many weeks a weekly backups is kept, and on which weekday a backups is kept:<br/>**weeks**: Amount of weeks<br/>**storage_day**: Day when the backup should be stored 0 = Sunday, ...,  6 = Saturday                                                                                          | integers               |
|             | **storage_period.monthly** | Determines, how many months a monthly backups is kept, and on which day in month a backups is kept:<br/>**months**: Amount of months<br/>**storage_day**: Day when the backup should be stored. If the number is larger than the day has months, the backup of the last day of the month will be kept instead | integers          |
|             | **backup_amount**          | *This is only used, if the **backup_type** is set to **amount**.*<br/>Amount of backups, that should be stored.                                                                                                                                                                                               | integer, 0 if infinite |
|             | **schemas**                | A list of databases/schemas that should be saved from this server.                                                                                                                                                                                                                                            | Array of Schemas       |


## 3. Start the application

```
npm run start
```

## 4. Features
Following features will to be added:
- [x] Automatic cleanup on old database logs
- [x] Dynamic mode for MySQL backups
- [x] Compress MySQL backups
- [x] Add encryption to MySQL backups
- [ ] Notify user on failed backups
- [ ] Add FTP Servers to upload
- [ ] Support MS SQL Databases aswell
- [ ] Build a UI in order to make it easier
- [ ] Add heartbeat service in order to check backups

