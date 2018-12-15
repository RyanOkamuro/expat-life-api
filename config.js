'use strict';
exports.DATABASE_URL = 
    process.env.DATABASE_URL || 
    global.DATABASE_URL || 
    'mongodb://localhost/expat-life-db';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-expat-life-db';
exports.PORT = process.env.PORT || 8080;