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
 * Returns all users
 */
router.get('/all', function(req, res, next) {
  res.send({
    users: [ {
      name: "Tiago",
      wins: "100",
      losses: 5
    }, {
      name: "Julian",
      wins: "100",
      losses: 5
    }]
  });
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

module.exports = router;
