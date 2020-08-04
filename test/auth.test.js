const request = require('supertest');
const app = require('../app');

const BASE_PATH = '/auth';
/*
    Testiranje autentifikacionog kontrolera
*/
describe('Testing GET requests for Auth Controller', () => {    
    it('should display login page', (done) => {
        request(app)
            .get(BASE_PATH + '/login')
            .expect(200)
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end(done);
    });

    it('should display register page', (done) => {
        request(app)
            .get(BASE_PATH + '/register')
            .expect(200)
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end(done)
    });
});

