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
            expect(res.body.first_place).toBeDefined();
            expect(res.body.second_place).toBeDefined();
            expect(res.body.third_place).toBeDefined();
          })
          .expect(200));
    });
    describe('POST', () => {
      it('increments users points column when sender_id is 1', async () => {
        const query = 'SELECT points FROM users WHERE user_id = 2;';
        const pointsBefore = await db.query(query);
        if (pointsBefore >= 9) pointsBefore = -1;
        return request(server)
          .post('/check')
          .send({
            user_id: 2,
            sender_id: 1,
          })
          .expect(async (res) => {
            const query = 'SELECT points FROM users WHERE user_id = 2;';
            const pointsAfter = await db.query(query);
            // console.log('points!!!', pointsBefore.rows, pointsAfter.rows);
            expect(pointsAfter.rows[0].points).toBe(
              pointsBefore.rows[0].points + 1
            );
          })
          .expect('Content-Type', /application\/json/)
          .expect(201);
      });
      it('increments senders column when sender_id isnt 1', async () => {
        const query = 'SELECT points FROM users WHERE user_id = 3;';
        let pointsBefore = await db.query(query);
        if (pointsBefore >= 9) pointsBefore = -1;
        return request(server)
          .post('/check')
          .send({
            user_id: 3,
            sender_id: 2,
          })
          .expect(async (res) => {
            const query = 'SELECT points FROM users WHERE user_id = 3;';
            const pointsAfter = await db.query(query);
            expect(pointsAfter).toBe(pointsBefore + 1);
          })
          .expect('Content-Type', /application\/json/)
          .expect(201);
      });
      it('responds with leaderboard and current user', async () => {
        const query = '';
        const username = await db.query(query);
        return request(server).post('/check')
          .send({
          user_id: 3,
          sender_id: 2,
        }).expect((res) => {
          expect(res.body.first_place).toBeDefined();
          expect(res.body.second_place).toBeDefined();
          expect(res.body.third_place).toBeDefined();
          expect(res.body.current_user[0]).toBe(username.rows[0].username)
        });
      });
    });
  });
});
