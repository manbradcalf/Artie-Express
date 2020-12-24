async function getEvents() {
  let events;
  await db
    .child("events")
    .once("value")
    .then((eventsData) => {
      events = eventsData.val();
    });
  console.log(`events in the client is ${events}`);
  return events;
}

async function getEvent(eventId) {
  let eventResponse;
  try {
    await db
      .child(`events/${eventId}`)
      .once("value")
      .then(
        (eventData) => {
          if (eventData.val()) {
            eventResponse = eventData.val();
          } else {
            eventResponse = {
              error: `No event exists for the requested event id ${eventId}`,
              status: 404,
            };
          }
        },
        (error) => {
          eventResponse = { error: error, status: 500 };
        }
      );
  } catch (e) {
    console.log(`e is ${e}`);
    eventResponse = { error: e.message, status: 500 };
  }
  return eventResponse;
}

module.exports = { getEvent, getEvents };
