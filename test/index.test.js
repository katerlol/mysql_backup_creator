const BackupCleanup = require('./../backup_cleanup');
const moment = require('moment');
const assert = require('assert');

const backupDays = [
    "2022-03-31",
    "2022-04-28",
    "2022-04-29",
    "2022-04-30",
    "2022-05-01",
    "2022-05-02",
    "2022-05-03",
    "2022-05-04",
    "2022-05-05",
    "2022-05-06",
    "2022-05-07",
    "2022-05-08",
    "2022-05-09",
    "2022-05-10",
    "2022-05-11",
    "2022-05-12",
    "2022-05-13",
    "2022-05-14",
    "2022-05-15",
    "2022-05-16",
];

describe(`BackupCleanup`, () => {
    it(`7/0/0 Backup keeps only 7 days`, () => {
        assert.deepEqual(BackupCleanup.getBackupsToDelete(backupDays, {
            "daily": 7,
        }, moment("2022-05-16")), [
            "2022-03-31",
            "2022-04-28",
            "2022-04-29",
            "2022-04-30",
            "2022-05-01",
            "2022-05-02",
            "2022-05-03",
            "2022-05-04",
            "2022-05-05",
            "2022-05-06",
            "2022-05-07",
            "2022-05-08",])
    });

    it(`4/2/0 Backup keeps only 4 days + each 2 wednesdays`, () => {
        assert.deepEqual(BackupCleanup.getBackupsToDelete(backupDays, {
            "daily": 4,
            "weekly": {
                "weeks": 2,
                "storage_day": 3 // wednesday
            },
        }, moment("2022-05-16")), [
            "2022-03-31",
            '2022-04-28',
            '2022-04-29',
            '2022-04-30',
            '2022-05-01',
            '2022-05-02',
            '2022-05-03',
            '2022-05-05',
            '2022-05-06',
            '2022-05-07',
            '2022-05-08',
            "2022-05-09",
            "2022-05-10"])
    });

    it(`4/0/6 Backup keep every last day for 6 months and 4 days`, () => {
        assert.deepEqual(Object.keys(BackupCleanup.getValidBackups(backupDays, {
            "daily": 4,
            "monthly": {
                "months": 6,
                "storage_day": 31
            }
        }, moment("2022-05-16"))), [
            "2022-03-31",
            "2022-04-30",
            "2022-05-12",
            "2022-05-13",
            "2022-05-14",
            "2022-05-15",
            "2022-05-16",])
    });

    it(`3/0/12 Backup for 1 year every month on the first plus last 3 days`, () => {
        assert.deepEqual(Object.keys(BackupCleanup.getValidBackups([
            "2020-03-01",
            "2021-04-01",
            "2021-05-01",
            "2021-06-01",
            "2021-07-02",
            "2021-08-01",
            "2022-05-15",
        ], {
            "daily": 3,
            "monthly": {
                "months": 12,
                "storage_day": 1
            }
        }, moment("2022-05-16"))), [
            "2021-05-01",
            "2021-06-01",
            "2021-08-01",
            "2022-05-15",])
    });
});