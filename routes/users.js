var express = require('express');
var router = express.Router();
const UsersDao = require("../controllers/db/users-dao");

router.get('/', function(req, res, next) {
  res.send('resource');
});

function sendResponseObject(res, statusCode, object) {
  res.writeHead(statusCode, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(object));
}

/**
 * Returns all users, excluding their rank
 */
router.get('/all', function(req, res, next) {
  (async () => {  
    const users = await UsersDao.getAll();
    sendResponseObject(res, 200, users);
  })();
});

/**
 * Returns the number of users
 */
router.get('/count', function(req, res, next) {
  (async () => {  
    const users = await UsersDao.getAll();
    sendResponseObject(res, 200, await users.length);
  })();
});

/**
 * Queries for a user by a certain name includes ranking.
 * Example query: { "name": "pinzu"}
 */
router.get('/name', function(req, res, next) {
  var name = req.body.name.toLowerCase();
  var includeRank = true; // default
  (async () => {  
    const user = await UsersDao.getUserByName(name);
    if (includeRank !== undefined && includeRank) {
        const [teamRank, soloRank, ffaRank] = await Promise.all([ 
        UsersDao.getUserTeamRank(name), 
        UsersDao.getUserSoloRank(name), 
        UsersDao.getUserFFARank(name) ]) 
        user.teamRank = teamRank;
        user.soloRank = soloRank;
        user.ffaRank = ffaRank;
    }
    if (user != null) 
      sendResponseObject(res, 200, user);
    else 
      sendResponseObject(res, 404, user);
    })();
});

/**
 * Gets a limited amount of users sorted by their ffa rank
 */
router.get('/sort/ffa', function(req, res, next) {
  (async () => {  
    var users = await UsersDao.getFFARankedUsersSorted();
    users.sort(function (u1, u2) {
      if (u1.ffaWins == u2.ffaWins) 
         return u1.ffaLosses - u2.ffaLosses;
      return u2.ffaWins - u1.ffaWins;
    });
    sendResponseObject(res, 200, users);
  })();
});

/**
 * Gets a limited amount of users sorted by their solo rank
 */
router.get('/sort/solo', function(req, res, next) {
  (async () => {  
    var users = await UsersDao.getSoloRankedUsersSorted();
    users.sort(function (u1, u2) {
      if (u1.soloWins == u2.soloWins) 
         return u1.soloLosses - u2.soloLosses;
      return u2.soloWins - u1.soloWins;
    });
    sendResponseObject(res, 200, users);
  })();
});

/**
 * Gets a limited amount of users sorted by their team rank
 */
router.get('/sort/team', function(req, res, next) {
  (async () => {  
    var users = await UsersDao.getUserTeamRank();
    users.sort(function (u1, u2) {
      if (u1.teamWins == u2.teamWins) 
         return u1.teamLosses - u2.teamLosses;
      return u2.teamWins - u1.teamWins;
    });
    sendResponseObject(res, 200, users);
  })();
});

module.exports = router;
