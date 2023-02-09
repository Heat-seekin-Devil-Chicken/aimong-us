const db = require('../models/chatroomModels.js');

//this controller will be responsible for the middleWare that controls CRUD to the DB;
const dbController = {};

const createErr = (errObj) => {
  const { method, type, err } = errObj;
  return {
    log: `dbController.${method} ${type}: ERROR: ${
      typeof err === 'object' ? JSON.stringify(err) : err
    }`,
    message: {
      err: `Error occurred in dbController.${method}. Check server logs for more details.`,
    },
  };
};

dbController.getMessages = async (req, res, next) => {
  try {
    const query =
      'SELECT m.*, users.username FROM messages AS m INNER JOIN users ON users.user_id = m.sender_id';
    const data = await db.query(query);
    res.locals.messages = data.rows;
    return next();
  } catch (err) {
    return next(
      createErr({
        method: 'getMessages',
        type: 'catch all block getting messages',
        err: err,
      })
    );
  }
};

dbController.postMessages = async (req, res, next) => {
  try {
    // const { sender_id, message } = req.body;
    const { sender_id, message } = res.locals.message ?? req.body;
    const time = Date.now(); // will return the ms ***** come back here for date time *** issues
    //will this leave us vulnerable to SQL Inj? if so, how fix?
    const query = `INSERT INTO messages(sender_id, message) VALUES($1, $2) RETURNING *`;
    const values = [sender_id, message];

    const data = await db.query(query, values);
    res.locals.newMessage = data.rows;

    return next();
  } catch (err) {
    return next(
      createErr({
        method: 'postMessages',
        type: 'catch all block posting messages',
        err: err,
      })
    );
  }
};

dbController.getUsers = async (req, res, next) => {
  try {
    const query = 'SELECT * FROM users';
    const data = await db.query(query);

    res.locals.users = data.rows;
    return next();
  } catch (err) {
    return next(
      createErr({
        method: 'dbController.getUsers',
        type: 'catch all block getting messages',
        err: err,
      })
    );
  }
};

dbController.getUserByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    const query = 'SELECT * FROM users WHERE username = $1';
    const data = await db.query(query, [username]);
    res.locals.user = data.rows[0];
    return next();
  } catch (err) {
    return next(
      createErr({
        method: 'dbController.getUserByUsername',
        type: 'catch all block getting messages',
        err: err,
      })
    );
  }
};

dbController.getUserBySsid = async (req, res, next) => {
  try {
    const { ssid } = res.locals;
    const query = 'SELECT * FROM users WHERE ssid = $1';
    const data = await db.query(query, [ssid]);

    res.locals.user_id = data.rows[0].user_id;
    return next();
  } catch (err) {
    return next(
      createErr({
        method: 'dbController.getUserBySsid',
        type: 'catch all block getting getting by ssid',
        err: err,
      })
    );
  }
};

dbController.postUser = async (req, res, next) => {
  try {
    const { username, password, email } = res.locals;
    console.log(username, password, email);

    const query = `
    INSERT INTO users(username, password, email)
    VALUES($1, $2, $3)
    RETURNING *`;
    const values = [username, password, email];

    const data = await db.query(query, values);
    console.log(data.rows);

    res.locals.username = data.rows[0].username;
    res.locals.validUser = true;
    res.locals.validPassword = true;

    return next();
  } catch (err) {
    return next(
      createErr({
        method: 'postUser',
        type: 'catch all block posting messages',
        err: err,
      })
    );
  }
};

dbController.storeSsid = async (req, res, next) => {
  try {
    console.log('storing ssid in the database...');

    const { username, ssid } = res.locals;

    const query = `
    UPDATE users
    SET ssid = $1
    WHERE username = $2
    RETURNING ssid`;
    const values = [ssid, username];

    let updatedUser = await db.query(query, values);

    return next();
  } catch (err) {
    return next(
      createErr({
        method: 'dbController.storeSsid',
        type: 'problem storing the ssid in the database',
        err: err,
      })
    );
  }
};

dbController.sendMessageFromSocket = async (body) => {
  console.log(body);
  try {
    const { sender_id, message } = body;
    const time = Date.now(); // will return the ms ***** come back here for date time *** issues
    //will this leave us vulnerable to SQL Inj? if so, how fix?
    const query = `INSERT INTO messages(sender_id, message) VALUES($1, $2) RETURNING *`;
    const values = [sender_id, message];

    const data = await db.query(query, values);

    const query2 = `SELECT username FROM users WHERE user_id = $1`;
    const data2 = await db.query(query2, [sender_id]);
    const username = data2.rows[0].username;

    return { ...data.rows[0], username };
  } catch (err) {
    console.error(err.message);
  }
};

// dbController.sendMessageFromAi = async (body) => {
//   try {
//     const { sender_id, message } = body;
//     const time = Date.now(); // will return the ms ***** come back here for date time *** issues
//     //will this leave us vulnerable to SQL Inj? if so, how fix?
//     const query = `INSERT INTO messages(sender_id, message) VALUES($1, $2) RETURNING *`;
//     const values = [sender_id, message];


//     const data = await db.query(query, values);
//     res.locals.newMessage = data.rows;

//   }
// }

module.exports = dbController;
