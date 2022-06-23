#MySQL Backup Creator

This is an approach to make easy MySQL Backups on servers.

The configuration is done in a config.json file. 


##1. Installation:

Install all the missing packages by running:

``
npm install
``

- "fs": "^0.0.1-security",
- "minizlib": "^2.1.2",
- "moment": "^2.29.3",
- "mysqldump": "^3.2.0",
- "node-cron": "^3.0.1",
- "uuid": "^8.3.2"

##2. Configuration

Run the app once to generate a template `config.json`:

````json
{
  "servers": [
    {
      "host": "localhost",
      "user": "YOUR_USER",
      "passwd": "YOUR_PASSWORD",
      "scheduler": "* * * * *",
      "backup_path": "C:/MySQLBackups/",
      "compress": false,
      "store_days": 14,
      "schemas": [
        {
          "schema": "YOUR_DATABASE"
        },
        {
          "schema": "ANOTHER_DATABASE_ON_THE_SAME_SERVER"
        }
      ]
    }
  ]
}
````

##3. Start the application

```
npm run start
```

##4. Features
Following features will to be added:
- [x] Automatic cleanup on old database logs
- [ ] Dynamic mode for MySQL backups
- [ ] Compress MySQL backups
- [ ] Notify user on failed backups

