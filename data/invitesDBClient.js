async function updateInviteStatus(userId, eventId, isInviteAccepted) {
  try {
    if (isInviteAccepted) {
      await db
        .child(`users/${userId}/events/${eventId}`)
        .set({ isInviteAccepted: true });
    } else {
      await db
        .child(`users/${userId}/events/${eventId}`)
        .set({ isInviteRejected: true });
    }

    // update the event's invitation status, which is just a boolean
    // representing attending status
    await db.child(`events/${eventId}/users/${userId}`).set(isInviteAccepted);

    // return the updated value of the invite
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
  let inviteResponse;
  try {
    await db
      .child(`users/${userId}/events/${eventId}`)
      .once("value")
      .then((invite) => {
        inviteResponse = invite.val();
      });
  } catch (e) {
    return { error: e };
  }
  return inviteResponse;
}

module.exports = { updateInviteStatus, getInviteStatus, resetInviteStatus };
