async function getUsers() {
  let users;
  await db
    .child("users")
    .once("value")
    .then((usersData) => {
      users = usersData.val();
    });
  console.log(`users in the client is ${users}`);
  return users;
}

async function getUser(userId) {
  console.log(`userId requested is ${userId}`);
  let userResponse;
  try {
    await db
      .child(`users/${userId}`)
      .once("value")
      .then(
        (userData) => {
          console.log(
            `user data in client is ${JSON.stringify(userData.val())}`
          );
          if (userData.val()) {
            userResponse = userData.val();
          } else {
            userResponse = {
              error: `No user exists with userId ${userId}`,
              status: 404,
            };
          }
        },
        (error) => {
          userResponse = { error: error, status: 500 };
        }
      );
  } catch (e) {
    userResponse = { error: error, status: 500 };
  }
  return userResponse;
}

module.exports = { getUser, getUsers };
