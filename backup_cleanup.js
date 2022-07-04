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
        const backupsToKeep = this.getValidBackups(backupDates, storage_period, now);
        return backupDates.filter(e => backupsToKeep[e] == null);
    },

    getValidBackups(backupDates, storage_period, now) {
        const keepDaily = storage_period.daily ? parseInt(storage_period.daily) > 0 : false;
        const keepWeekly = storage_period.weekly ? parseInt(storage_period.weekly.weeks) > 0 : false;
        const keepMonthly = storage_period.monthly ? parseInt(storage_period.monthly.months) > 0 : false;

        const backupsToKeep = [];

        // keep or destroy?
        for (const backupDate of backupDates) {
            const date = moment(backupDate);

            // if applies for monthly check if the date of the back up is the first of the month
            if (keepMonthly) {

                // check if this day is available in this month
                const storageMonthDay =
                    date.daysInMonth() > storage_period.monthly.storage_day
                        ? storage_period.monthly.storage_day
                        : date.daysInMonth();

                // check if backup should be kept for monthly
                if (date.diff(now, 'months') + storage_period.monthly.months >= 0) {
                    // check if the backup is from the proper day
                    if (date.date() === storageMonthDay) {
                        backupsToKeep[backupDate] = backupDate;
                    }
                }
            }

            // if backup applies for weekly, check if its on the proper weekday
            if (keepWeekly) {

                // check if storage day is on the proper day
                const storageWeekDay = storage_period.weekly.storage_day;

                // check if the week should be kept
                if (date.diff(now, 'weeks') + storage_period.weekly.weeks >= 0) {

                    // check if it's the proper weekday
                    if (date.weekday() === storageWeekDay) {
                        backupsToKeep[backupDate] = backupDate;
                    }
                }
            }

            // check if applies for a daily backup
            if (keepDaily) {

                if (date.diff(now, 'days') + storage_period.daily >= 0) {
                    backupsToKeep[backupDate] = backupDate;
                }
            }
        }

        return backupsToKeep;
    },

    cleanupByAmount(server, schema, userBackupPath) {
    },
}