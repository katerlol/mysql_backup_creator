const BackupCleanup = require('./../backup_cleanup');
const moment = require('moment');
const assert = require('assert');

const backupDays = [
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
            "weekly": 0,
            "monthly": 0
        }, moment("2022-05-16")), [
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
            "weekly": 2,
            "monthly": 0
        }, moment("2022-05-16")), [
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
});