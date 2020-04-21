let express = require('express');
let router = express.Router();

/**
 * GET USER DATA
 */
router.get('/:userId', function (req, res) {
    console.log("Getting user")
    db.child('users')
        .child(req.params.userId)
        .once('value')
        .then(function (snapshot) {
            let response = snapshot.val();

            response.events = Object.entries(response.events)
                .map(function (event) {
                    return {
                        "eventId": event[0],
                        "attendingStatus": event[1]
                    }
                });

            response.contacts = Object.keys(response.contacts);
            response.unavailable_dates = Object.keys(response.unavailable_dates);
            res.send(response)
        })
});

/**
 * GET ALL EVENTS FOR USER
 */
router.get('/:userId/events', function (req, res) {
    // get event Ids from users events node in firebase
    db.child(`/users/${req.params.userId}/events`)
        .once('value')
        .then((userData) => {
            if (userData == null) {
                res.status(404).send({"message": "unable to find user"})
            } else {
                // we got user data, get the events and build a response
                let responseBody = {"events": []};
                let eventIds = Object.keys(userData.val());

                // get event details for each eventId in user details
                for (let i = 0; i < eventIds.length; i++) {
                    db.child(`/events/${eventIds[i]}`)
                        .once('value')
                        .then(function (eventInfo) {
                            responseBody.events.push(eventInfo.val());

                            if (i === eventIds.length - 1) {
                                res.send(responseBody)
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(500).send(error);
                        });
                }
            }
        });
});
/**
 * GET ALL EVENTS PENDING INVITATION REPLY FOR USER
 */
router.get('/:userId/events/pending', function (req, res) {
    let data = {
        title: "Events pending invitation response",
        eventIds: []
    };

    db.child('users')
        .child(req.params.userId)
        .child('events')
        .once('value')
        .then(function (snapshot) {
            snapshot.forEach(function (event) {
                if (!event.val().isAttending) {
                    data.eventIds.push(event.key.toString())
                }
            });
            console.log("Pending response " + data.eventIds);
            res.send(data)
        });
});

/**
 * GET ALL EVENTS USER IS ATTENDING
 */
router.get('/:userId/events/attending', function (req, res) {
    let data = {
        title: "Events user is attending",
        eventIds: []
    };

    db.child('users')
        .child(req.params.userId)
        .child('events')
        .once('value')
        .then(function (snapshot) {
            snapshot.forEach(function (event) {
                if (event.val().isHosting || event.val().isAttending) {
                    console.log("Attending event" + " " + event.key + JSON.stringify(event));
                    data.eventIds.push(event.key)
                }
            });
            res.send(data);
        });
});

module.exports = router;
