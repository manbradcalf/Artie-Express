let express = require('express');
let router = express.Router();

/**
 * GET EVENT DATA
 */
router.get('/:eventId', function (req, res) {
    db.child(`events/${req.params.eventId}`)
        .once('value')
        .then((eventData) => {
                if (eventData.val() != null) {
                    res.send(eventData.val())
                }
                // TODO: Make a reusable error model
                else {
                    res.status(404).send({"message": `No event exists with request eventId ${req.params.eventId}`})
                }
            },
            (error) => {
                console.log(error);
                res.status(500).send(error);
            })
});

/**
 * GET EVENT USERS
 */
router.get('/:eventId/users', function (req, res) {
    db.child(`events/${req.params.eventId}`)
        .once('value')
        .then((eventData) => {
                if (eventData == null) {
                    res.status(404).send({"message": `Unable to find eventId ${req.params.eventsId}`})
                } else {
                    // We got an event, build response object and grab userIds to iterate thru
                    let responseBody = {"host": {}, "attendees": []};
                    let inviteeIds = Object.keys(eventData.val().users);

                    // Set host
                    responseBody.host = eventData.val().host;

                    // Set attendees
                    for (let i = 0; i < inviteeIds.length; i++) {

                        let userId = inviteeIds[i];
                        db.child(`/users/${userId}`)
                            .once('value')
                            .then(function (userInfo) {
                                responseBody.attendees.push(userInfo.val());

                                // We have all the users now
                                if (i === inviteeIds.length - 1) {
                                    res.send(responseBody)
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                                res.status(500).send(error);
                            });
                    }
                }
            },
            (error) => {
                console.log(error)
            })
});

module.exports = router;
