let express = require("express");
let router = express.Router();
let usersDBClient = require("../data/usersDBClient.js");
let eventsDBClient = require("../data/eventsDBClient.js");
/**
 * GET ALL USERS
 */
router.get("/", async (req, res) => {
  try {
    let users = await usersDBClient.getUsers();
    if (users) {
      res.send(users);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

/**
 * GET USER DATA
 */
router.get("/:userId", async (req, res) => {
  try {
    let user = await usersDBClient.getUser(req.params.userId);
    if (user) {
      res.send(user);
    } else {
      console.log(`user is ${JSON.stringify(user)}`);
      res.sendStatus(500);
    }
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

/**
 * GET ALL EVENTS FOR USER
 */
router.get("/:userId/events", async (req, res) => {
  let userResponse = await usersDBClient.getUser(req.params.userId);

  if (userResponse.events) {
    let userEventsResponse = {};
    let eventIds = Object.keys(userResponse.events);
    for await (const eventId of eventIds) {
      let event = await eventsDBClient.getEvent(eventId);
      userEventsResponse[eventId] = await eventsDBClient.getEvent(eventId);
    }
    res.send(userEventsResponse);
  } else if (userResponse.error.status == 404) {
    res.sendStatus(404);
  } else if (userResponse.status == 500) {
    res.status(500).send(userResponse.error);
  } else {
    res.sendStatus(500);
  }
});

/**
 * GET ALL EVENTS PENDING INVITATION REPLY FOR USER
 */
router.get("/:userId/events/pending", async (req, res) => {
  let response = {
    eventsIds: [],
  };

  let userDBResponse = await usersDBClient.getUser(req.params.userId);

  if (userDBResponse.error) {
    res.sendStatus(userDBResponse.status);
  } else {
  Object.entries(userDBResponse.events).forEach((event) => {
    eventId = event[0];
    inviteInfo = event[1];
    console.log(`invite info: ${JSON.stringify(inviteInfo)}`);
    if (
      !inviteInfo.isInviteAccepted &&
      !inviteInfo.isHost &&
      !inviteInfo.isInviteRejected
    ) {
      response.eventsIds.push(eventId);
    }
  });

  res.send(response);
  }

});

/**
 * GET ALL EVENTS USER IS ATTENDING
 */
router.get("/:userId/events/attending", async (req, res) => {
  let response = {
    eventIds: [],
  };

  let userDBResponse = await usersDBClient.getUser(req.params.userId);

  if (userDBResponse.error) {
    res.sendStatus(userDBResponse.status);
  } else {
    Object.entries(userDBResponse.events).forEach((event) => {
      eventId = event[0];
      inviteInfo = event[1];
      if (inviteInfo.isInviteAccepted || inviteInfo.isHost) {
        response.eventIds.push(eventId);
      }
    });
    res.send(response);
  }
});

//TODO: Get Contacts
//         @GET("/users/{id}/contacts.json")
//         getUserContacts(@Path("id") userId: String): Response<HashMap<String, Boolean>>

//TODO: Update user
//         @PUT("/users/{userId}.json")
//         updateUser(@Body user: User, @Path("userId") userId: String): Response<User>

//TODO: Reject Invite
//         @PUT("/users/{userId}/events/{eventId}/isInviteRejected.json")
//         rejectInvite(@Body bool: Boolean?, @Path("userId") userId: String, @Path("eventId") eventId: String): Response<Boolean>

//TODO: Accept Invite
//         @PUT("/users/{userId}/events/{eventId}/isInviteAccepted.json")
//         acceptInvite(@Body bool: Boolean?, @Path("userId") userId: String, @Path("eventId") eventId: String): Response<Boolean>

//         @PATCH("/users/{userId}.json")
//         patchUser(@Body user: User, @Path("userId") userId: String): Response<User>

//TODO: Add Contact
//         @PUT("/users/{userId}/contacts/{contactId}.json")
//         addContactToUserAsync(@Body isContact: Boolean, @Path("userId") userId: String, @Path("contactId") contactId: String): Response<Boolean>

//TODO: Add Event To User
//         @PUT("/users/{userId}/events/{eventId}.json")
//         addEventToUser(@Body eventInviteInfo: EventInviteInfo, @Path("userId") userId: String, @Path("eventId") eventId: String): Response<EventInviteInfo>

//         @DELETE("/events/{eventId}/users/{userId}.json")
//         removeUserFromEvent(@Path("eventId") eventId: String, @Path("userId") userId: String): Response<Response<Void>>

//         @PUT("/events/{eventId}/host.json")
//         updateEventHost(@Body host: Host, @Path("eventId") eventId: String): Response<Host>

//         @PUT("/users/{userId}/unavailable_dates/{date}.json")
//         setDateUnavailableForUser(@Body unavailable: Boolean?, @Path("userId") userId: String,
//                                               @Path("date") date: String): Response<Boolean>
//     }

module.exports = router;
