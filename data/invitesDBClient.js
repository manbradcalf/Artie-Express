async function updateInviteStatus(userId, eventId, isInviteAccepted) {
  try {
    // set both accept and reject to show the user has responded to the invite
    // as "false" for accepted or rejected could mean just not responded
    await db
      .child(`users/${userId}/events/${eventId}/isInviteAccepted`)
      .set(isInviteAccepted);

    await db
      .child(`events/${eventId}/events/${eventId}/isInviteRejected`)
      .set(!isInviteAccepted);

    // update the event's invitation status, which is just a boolean
    // representing attending status
    await db.child(`events/${eventId}/users/${userId}`).set(isInviteAccepted);

    return await getInviteStatus(userId, eventId);
  } catch (e) {
    return { error: e };
  }
}

//TODO: This is temporary until i can think of a better way to handle invites
async function resetInviteStatus(userId, eventId, inviteStatus) {
  return await db.child(`users/${userId}/events/${eventId}`).set(inviteStatus);
}

async function getInviteStatus(userId, eventId) {
  try {
    return await db.child(`users/${userId}/events/${eventId}}`).once("value");
  } catch (e) {
    return { error: e };
  }
}

module.exports = { updateInviteStatus, getInviteStatus, resetInviteStatus };
