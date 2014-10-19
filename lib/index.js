module.exports = function (session) {
    var mongoose = require('mongoose');
    var config = require('config');

    var self = this;

    mongoose.connect(config.Mongo.Session);

    // Get database connection setup
    self.database = mongoose.connection;
    self.database.on('error', console.error.bind(console, 'connection error:'));

    // SCHEMAS
    var sessionSchema = mongoose.Schema({
        sid: String,
        session: String,
        created: { type: Date, default: Date.now },
        expires: Date
    });

    var Session = mongoose.model('Session', sessionSchema);
    var Store = session.Store;

    function MongoStore(options) {
        var self = this;

        options = options || {};
        Store.call(this, options);
    }

    MongoStore.prototype.__proto__ = Store.prototype;

    MongoStore.prototype.get = function (sessionId, callback) {
        Session.findOne({sid: sessionId}, function (err, data) {
            if (err) {
                return callback(err, null);
            }

            if (data === null) {
                return callback();
            }

            return callback(err, JSON.parse(data.session));
        });
    };

    MongoStore.prototype.set = function (sessionId, session, callback) {
        if (session && session.cookie && session.cookie.expires) {
            session.expires = new Date(session.cookie.expires);
        } else {
            // If there's no expiration date specified, it is
            // browser-session cookie or there is no cookie at all,
            // as per the connect docs.
            //
            // So we set the expiration to two-weeks from now
            // - as is common practice in the industry (e.g Django) -
            // or the default specified in the options.
            var today = new Date();
            session.expires = new Date(today.getTime() + (1000 * 60 * 60 * 24 * 14));
        }

        Session.findOne({sid: sessionId}, function (err, data) {
            if (err) {
                return callback(err);
            }

            // if empty, do an insert, otherwise update the session part of the entity
            if (data === null) {
                var entity = new Session({
                    sid: sessionId,
                    session: JSON.stringify(session)
                });

                entity.save(function (saveErr, saveData) {
                    return callback(saveErr, session);
                });
            } else {
                Session.update({sid: sessionId}, {session: JSON.stringify(session)}, function () {
                    return callback(null, session);
                });
            }

        });
    };

    MongoStore.prototype.destroy = function (sessionId, callback) {
        Session.remove({sid: sessionId}, function (err) {
            callback(err);
        });
    };

    return MongoStore;
};
