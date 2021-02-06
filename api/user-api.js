let express = require("express");
let router = express.Router();
let usersDBClient = require("../data/usersDBClient.js");
let eventsDBClient = require("../data/eventsDBClient.js");
let invitesDBClient = require("../data/invitesDBClient.js");
let axios = require("axios");
const fbUsersAPI = axios.create({
  baseURL: "https://bookyrself-staging.firebaseio.com/users",
});

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
  console.log(`getting user for userId something else now`);
  try {
    let user = await usersDBClient.getUser(req.params.userId);
    if (user) {
      if (user.events) {
        for (event in user.events) {
          // TODO: should i get all event data here?
          let eventData = await eventsDBClient.getEvent(event);
          user.events[event].eventname = eventData.eventname;
          user.events[event].date = eventData.date;
          user.events[event].citystate = eventData.citystate;
        }
      }
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
  let userDBResponse = await usersDBClient.getUser(req.params.userId);
  if (userDBResponse.error) {
    res.sendStatus(userDBResponse.status);
  } else if (userDBResponse.events) {
    let response = { events: {} };
    let events = Object.entries(userDBResponse.events);
    if (events) {
      for await (const event of events) {
        eventId = event[0];
        inviteInfo = event[1];
        console.log(`invite info: ${JSON.stringify(inviteInfo)}`);
        if (
          !inviteInfo.isInviteAccepted &&
          !inviteInfo.isHost &&
          !inviteInfo.isInviteRejected
        ) {
          response.events[eventsId] = await eventsDBClient.getEvent(eventId);
        }
      }
      res.send(response);
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(404);
  }
});

/**
 * GET ALL EVENTS USER IS ATTENDING
 */
router.get("/:userId/events/attending", async (req, res) => {
  let userDBResponse = await usersDBClient.getUser(req.params.userId);
  if (userDBResponse.error) {
    res.sendStatus(userDBResponse.status);
  } else {
    let events = Object.entries(userDBResponse.events);
    let response = { events: {} };

    for await (const event of events) {
      eventId = event[0];
      inviteInfo = event[1];
      if (inviteInfo.isInviteAccepted || inviteInfo.isHost) {
        response.events[eventId] = await eventsDBClient.getEvent(eventId);
      }
    }
    res.send(response);
  }
});

router.get("/:userId/contacts", async (req, res) => {
  let userDBResponse = await usersDBClient.getUser(req.params.userId);
  if (userDBResponse.error) {
    res.sendStatus(userDBResponse.status);
  } else {
    let response = { contacts: {} };
    for await (const contactUserId of Object.keys(userDBResponse.contacts)) {
      let userInfo = await usersDBClient.getUser(contactUserId);
      response.contacts[contactUserId] = userInfo;
    }
    res.send(response);
  }
});

// Patch user
// This is essentially a wrapper of the fb db endpoint
router.patch(`/:userId`, async (req, res) => {
  let path = req.params.userId;
  if (req.body.dBPath) {
    path += req.body.dBPath;
  }
  path += ".json";
  let fbresponse = await fbUsersAPI.patch(path, req.body.data);
  res.status(fbresponse.status).send(fbresponse.data);
});

// Update user
router.put("/:userId", async (req, res) => {
  if (req.body) {
    let response = await usersDBClient.updateUser(req.params.userId, req.body);
    res.send(response);
  } else {
    res.send({ error: "Please provide a request body for the user update" });
  }
});

// Accept Invite
router.put("/:userId/events/:eventId/acceptInvite", async (req, res) => {
  let originalInviteStatus = await invitesDBClient.getInviteStatus(
    req.params.userId,
    req.params.eventId
  );

  let updateInviteStatus = await invitesDBClient.updateInviteStatus(
    req.params.userId,
    req.params.eventId,
    req.body.inviteResponse
  );
  if (!updateInviteStatus.error) {
    res.send(updateInviteStatus);
  } else {
    // reset invite status
    invitesDBClient.resetInviteStatus(
      req.params.userId,
      req.params.eventId,
      originalInviteStatus
    );
    res.status(500).send({ error: "Something went wrong, woopsie!" });
  }
});

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
