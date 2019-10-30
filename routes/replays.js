var express = require('express');
var router = express.Router();

const Wc3StatsController = require("../controllers/wc3stats-controller");
const ParseReplay = require("../utils/parsereplay");
const ReplayDao = require("../controllers/db/replay-dao");
const UsersDao = require("../controllers/db/users-dao");

router.get('/', function(req, res, next) {
  res.send('resource');
});

// WORK IN PROGRESS:
// HOW TO CREATE REST-API 
// https://www.robinwieruch.de/node-express-server-rest-api


/**
 * Get All
 */
router.get('/all', function(req, res, next) {
  res.send({
    replays: [ {
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

function sendResponseObject(res, statusCode, object) {
  res.writeHead(statusCode, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(object));
}

/**
 * Receives a id from the client and attempts to fetch the replay file from wc3stats.com 
 * If the replay is managed by the server a match result is returned. 
 */
router.post('/submit', (req, res) => {
  (async () => {  

    var id = req.body.id;
    var wc3gameJson = await Wc3StatsController.fetchReplayById(id);

    if (wc3gameJson == null || wc3gameJson == "No results found.") {

      // No such replay exists at wc3stats.com/games
      //
      sendResponseObject(res, 404, {"body": "No result found."});
      return;
    } 

    // Game was found at wc3stats.com/games so we try to parse it
    //
    var replay = null;
    try {
      replay = ParseReplay.parseRisk(wc3gameJson);
      console.log(replay.toString());
    } catch (e) {
      sendResponseObject(res, 404, { "body": "Failed to parse replay properly." });
      return;
    }
    var maps = req.body.maps;
    var foundMatchingMap = false;
    var foundMatchingVer = false;
    try {
      if (maps != null && maps != undefined) {
        for (var i = 0; i < maps.length; i++) {
          if (maps[i].map === replay.map) {
            foundMatchingMap = true;
            var foundMap = maps[i];
            if (foundMap.versions != undefined && foundMap.versions.includes(replay.version)) {
              foundMatchingVer = true;
            }
            break;
          }
        }
      }
    } catch (e) {
      console.log(e);
      sendResponseObject(res, 200, {  "body": "Something went wrong when trying to verify the map and version."});
      return;
    }
    /*
    if (!foundMatchingMap) {
      sendResponseObject(res, 200, {  "body": "This bot does not support map " + replay.map + " (#" + replay.id + ")"});
      return;
    }
    if (!foundMatchingVer) {
      sendResponseObject(res, 200, {  "body": "This bot does not support version " + replay.version + " (#" + replay.id + ")"});
      return;
    }
    */
    try {
      var result = await ReplayDao.getReplayByGameId(replay.id);
      if (result == null) {
        await ReplayDao.insert(replay);
        await UsersDao.increaseStats(replay, 1);
        const SocketController = require("../controllers/socket-controller");
        // Update scoreboard
        var scoreboard = { "map": replay.map, "gameType": replay.gameType };
        switch (replay.gameType) {
          case "ffa": 
            scoreboard.users = await UsersDao.getFFARankedUsersSorted(); 
            break;
          case "solo": 
            scoreboard.users = await UsersDao.getSoloRankedUsersSorted(); 
            break;
          case "team": 
            scoreboard.users = await UsersDao.getTeamRankedUsersSorted(); 
            break;
          default: scoreboard.users = [];
        }
        // Transmit valid scoreboard changes 
        if (scoreboard.users.length > 0) {
            SocketController.broadcast("scoreboard", scoreboard);
        }
        sendResponseObject(res, 200, {  "body": replay });
        return;
      }
      sendResponseObject(res, 200, {  "body": "Replay already submitted " + " (#" + replay.id + ")" });
    } catch (e) {
      console.log(e);
      sendResponseObject(res, 500, {  "body": "Database exception." });
      return;
    }
  })();
});

module.exports = router;
