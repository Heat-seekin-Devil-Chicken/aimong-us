const request = require('supertest');
const db = require('../server/models/chatroomModels.js');

const server = 'http://localhost:3000';

// run the server while you are testing

describe('middleware tests', () => {
  describe('/check', () => {
    describe('GET', () => {
      it('responds with 200 status and current leaderboard', () =>
        request(server)
          .get('/check')
          .expect('Content-Type', /application\/json/)
          .expect((res) => {
            expect(res.body.first_place).toBeDefined()
            expect(res.body.second_place).toBeDefined()
            expect(res.body.third_place).toBeDefined()
          })
          .expect(200));
    });
  });
});
