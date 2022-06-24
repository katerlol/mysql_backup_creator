const fs = require('fs');
const moment = require('moment');

module.exports = {
    handleCleanup(type, server, schema) {
        const userBackupPath = server.backup_path.endsWith('/') ? server.backup_path : `${server.backup_path}/`;

        switch (type) {
            case "period":
            case "periodic":
                this.cleanupByPeriodic(server, schema, userBackupPath);
                break;
            case "amount":
                this.cleanupByAmount(server, schema, userBackupPath);
                break;
        }
    },

    cleanupByPeriodic(server, schema, userBackupPath) {
        const backupsToDelete = this.getBackupsToDelete(fs.readdirSync(`${userBackupPath}${schema.schema}`), server.storage_period, moment());

        for (const backupFolder of backupsToDelete) {
            // try parse backup folder into date
            console.log(`found old log that is not needed anymore: ${schema.schema}/${backupFolder}`);
            fs.rmdirSync(`${userBackupPath}${schema.schema}/${backupFolder}`, {recursive: true});
        }
    },

    getBackupsToDelete(backupDates, storage_period, now) {
        const keepDaily = parseInt(storage_period.daily) > 0;
        const keepWeekly = parseInt(storage_period.weekly) > 0;
        const keepMonthly = parseInt(storage_period.monthly) > 0;


        const backupsToDelete = [];

        if (keepDaily || keepWeekly || keepMonthly) {
            for (const backupDate of backupDates) {
                const backupFolderDate = moment(backupDate);
                // check if it's a daily store
                if (backupFolderDate.diff(now, 'days') + storage_period.daily < 0) {
                    // further check if it is a weekly store
                    if (backupFolderDate.diff(now, 'weeks') + storage_period.weekly <= 0) {
                        // further check if it is a monthly store
                        if (backupFolderDate.diff(now, 'months') + storage_period.weekly <= 0) {
                            backupsToDelete.push(backupDate);
                        } else if (backupFolderDate.month() !== 1) {
                            // keep, otherwise delete
                            backupsToDelete.push(backupDate);
                        }
                    } else if (backupFolderDate.weekday() !== 3) {
                        // keep, otherwise delete
                        backupsToDelete.push(backupDate);
                    }
                }
            }
        }

        return backupsToDelete;
    },

    cleanupByAmount(server, schema, userBackupPath) {
    },
}