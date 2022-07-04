
const crypto = require('crypto');

module.exports = {
    getCipherKey(password) {
        return crypto.createHash('sha256').update(password).digest();
    },

    getInitVector(size = 16) {
        return crypto.randomBytes(size);
    },

    getCryptoStream(key, vector) {
        return crypto.createCipheriv('aes256', key, vector);
    },
}