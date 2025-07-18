"use strict";
const jwt = require('jsonwebtoken');
test('hello world!', () => {
    const userId = 'testUserId';
    const JWT_SECRET = 'testSecret';
    const JWT_EXPIRE = '1h';
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
    expect(typeof token).toBe('string');
});
