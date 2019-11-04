const MongoClient = require('mongodb').MongoClient;
const secret = require("../../.secret");

//const url = "mongodb://" + secret.db.host + ":" + secret.db.port + "/" + secret.db.name;
const url = secret.db.url;

const dbName = secret.db.name;
const collectionKey = 'replays';

module.exports = class ReplayDao {

    /**
     * Inserts a replay into the database
     * @param {*} replay 
     */
    static insert(replay) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(url, function(err, db) {
                if (err) 
                    reject(err);
                else {
                    db.db(dbName).collection(collectionKey).insertOne(replay, function(err, res) {
                        if (err)
                            reject(err);
                        else  
                            resolve(res);
                    });
                }
                if (db !== null) 
                    db.close();
            });
        });
    }
    
    /**
     * Queries the database for a replay with a matching replay id. 
     * @param {*} gameId replay id
     */
    static getReplayByGameId(gameId) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(url, function(err, db) {
                if (err) 
                    reject(err);
                else {
                    db.db(dbName).collection(collectionKey).findOne({id: gameId}, function (err, res) {
                        if (err)
                            reject(err);
                        else  
                            resolve(res);
                    });
                }
                if (db !== null) 
                    db.close();
            });
        });
    }

    /**
     * Updates a replays ranked status to the provided flag
     * @param {*} gameId the replay id
     * @param {*} flag boolean flag for if the match was ranked or not 
     */
    static updateRankedById(gameId, flag) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(url, function(err, db) {
                if (err) 
                    reject(err);
                else {
                    db.db(dbName).collection(collectionKey).updateOne({id: gameId}, 
                        {
                            $set: { rankedMatch: flag },
                        },
                        {upsert: true}
                    );
                    resolve(true);
                }
            });
        });
    }

    /**
     * Drop table
     */
    static dropTable() {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(url, function(err, db) {
                if (err) 
                    reject(err);
                else {
                    db.db(dbName).collection(collectionKey).drop(function (err, res) {
                        if (err)
                            reject(err);
                        else  
                            resolve(res);
                    });
                }
                if (db !== null) 
                    db.close();
            });
        });
    }


/**
 * Queries replays from a players history up to a given limit.
 * @param {*} search 
 * @param {*} gameLimit 
 */
    static searchPlayerHistory(search, gameLimit) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(url, function(err, db) {
                if (err) 
                    reject(err);
                else {
                    db.db(dbName).collection(collectionKey).find({ players: {
                        $elemMatch: {name : {$regex: new RegExp('^'+ search + '$', "i") }} 
                    }
                    }).limit(gameLimit).toArray(function (err, res) {
                        if (err) {
                            console.log(err);
                            resolve([]);
                        }                       
                        resolve(res);
                    });
                }
            });
        });
    }

    /**
     * Queries for all replays by a given player name 
     * @param {*} name 
     */
    static getPlayerReplays(name) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(url, function(err, db) {
                if (err) 
                    reject(err);
                else {
                    db.db(dbName).collection(collectionKey).find({ players: {$elemMatch: {name : {$regex: new RegExp('^'+ name + '$', "i")} } }
                    }).toArray(function (err, res) {
                        if (err) {
                            console.log(err);
                            resolve([]);
                        }                       
                        resolve(res);
                    });
                }
            });
        });
    }
    
}