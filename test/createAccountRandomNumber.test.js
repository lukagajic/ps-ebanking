const createAccountRandomNumber = require('../helpers/createAccountRandomNumber');
const { expect } = require('chai');

describe('Testing random account number generator function', () => {
    it('should generate 13 digit random account number and 2 digit random control number separated with -', (done) => {
        const randomAccountNumber = createAccountRandomNumber();
        expect(randomAccountNumber).to.match(/^[0-9]{13}\-[0-9]{2}$/);
        done();
    })
});