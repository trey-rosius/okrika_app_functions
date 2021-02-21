const functions = require("firebase-functions");
// For the default version
const algoliasearch = require('algoliasearch');
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

const firestore = admin.firestore();
const settings = { timestampsInSnapshots: true };
firestore.settings(settings);
// App ID and API Key are stored in functions config variables
const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key;
const ALGOLIA_SEARCH_KEY = functions.config().algolia.search_key;


exports.chats = functions.firestore
  .document("chats/{usersId}/chatThread/{chatId}")
  .onCreate((change, context) => {
    // Note the syntax has change to Cloud Function v1.+ version (see https://firebase.google.com/docs/functions/beta-v1-diff?0#cloud-firestore)
    //const followerUid = context.params.followerUid;
    // const followedUid = context.params.followedUid;
    // const messageId = context.params.messageId;
    const promises = [];
    let fromUserName = "";
    let fromUserId = "";
    let productId = "";
    let productType = "";
    //  console.log("message text" + change.data().message);
    console.log("receiver Id" + change.data().receiverId);
    console.log("sender Id" + change.data().senderId);
    console.log("product Id" + change.data().productId);
    
    productId = change.data().productId;
    productType = change.data().productType;

    var senderDetails = admin
      .firestore()
      .collection("users")
      .doc(change.data().senderId)

      .get()
      .then((doc) => {
        if (doc.exists) {
          console.log("Document data:", doc.data());
          fromUserName = doc.data().fullNames;
          fromUserId = doc.id;
          console.log("user name is" + fromUserName);
          return admin
            .firestore()
            .collection("users")
            .doc(change.data().receiverId)
            .get()
            .then((doc) => {
              if (doc.exists) {
                console.log(doc.id, "=>", doc.data());
                const tokenId = doc.data().notificationToken;

                console.log("fcm token" + tokenId);

                const payload = {
                  notification: {
                    title: "Okrika",
                    sound: "default",
                    body: fromUserName + " sent a message",
                  },
                  data: {
               
                    click_action: "FLUTTER_NOTIFICATION_CLICK",
                    notificationType: "chats",
                    message: fromUserName + " sent a message",
                    senderId: change.data().senderId,
                    receiverId: change.data().receiverId,
                    productId: productId,
                 
                  },
                };

                // promises.push(admin.messaging().sendToDevice(tokenId, payload));

                return admin.messaging().sendToDevice(tokenId, payload);
              } else {
                throw new Error("No receiver document!");
              }
            });
        } else {
          throw new Error("No sender document!");
          //the error is goinf to be catched by the catch method at the end of the promise chaining
        }
      })

      .then((results) => {
        console.log("All notifications sent!");
        return true;
      })
      .catch((error) => {
        console.log(error);
        return false;
      });
  });
exports.notifications = functions.firestore
  .document("notifications/{notificationsId}")
  .onCreate((change, context) => {
    // Note the syntax has change to Cloud Function v1.+ version (see https://firebase.google.com/docs/functions/beta-v1-diff?0#cloud-firestore)

    const promises = [];
    let fromUserName = "";
    let fromUserId = "";
    console.log("receiver user Id" + change.data().receiverId);
    console.log("Sender user Id" + change.data().senderId);
    console.log("notification text" + change.data().notificationText);
    let notificationText = change.data().notificationText;

    var senderDetails = admin
      .firestore()
      .collection("users")
      .doc(change.data().senderId)

      .get()
      .then((doc) => {
        if (doc.exists) {
          console.log("user Document data:", doc.data());
          fromUserName = doc.data().fullNames;
          fromUserId = doc.id;
          return admin
            .firestore()
            .collection("users")
            .doc(change.data().receiverId)
            .get()
            .then((doc) => {
              console.log("receiver Document data:", doc.data());
              const tokenId = doc.data().notificationToken;
              console.log("fcm token" + tokenId);

              const payload = {
                notification: {
                  title: fromUserName,
                  sound: "default",
                  body: fromUserName + notificationText,
                },
                data: {
                  click_action: "FLUTTER_NOTIFICATION_CLICK",
                  notificationType: "notifications",
                  message: fromUserName + notificationText,
                },
              };

              // promises.push(admin.messaging().sendToDevice(tokenId, payload));

              return admin.messaging().sendToDevice(tokenId, payload);

              // return Promise.all(promises);
            });
        } else {
          throw new Error("No sender document!");
          //the error is goinf to be catched by the catch method at the end of the promise chaining
        }
      })

      .then((results) => {
        console.log("All notifications sent!");
        return true;
      })
      .catch((error) => {
        console.log(error);
        return false;
      });
  });

exports.productsSubs = functions.firestore
  .document("allProducts/{productId}")
  .onCreate((change, context) => {
    // Note the syntax has change to Cloud Function v1.+ version (see https://firebase.google.com/docs/functions/beta-v1-diff?0#cloud-firestore)
 
    const promises = [];
    let fromUserName = "";
    let fromUserId = "";
    let productId = "";
    //  console.log("message text" + change.data().message);
    console.log("receiver Id" + change.data().userId);
    productId = change.data().productId;

    var senderDetails = admin
      .firestore()
      .collection("users")
      .doc(change.data().userId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          console.log("Document data:", doc.data());
          fromUserName = doc.data().fullNames;
          fromUserId = doc.id;
          console.log("user name is" + fromUserName);
          console.log(doc.id, "=>", doc.data());
          const tokenId = doc.data().notificationToken;
          console.log("fcm token" + tokenId);
          const payload = {
            notification: {
              title: "Okrika",
              sound: "default",
              body: fromUserName + " just put up a new item.Check it out Now",
            },
            data: {
              // username: fromUserName,
              click_action: "FLUTTER_NOTIFICATION_CLICK",
              notificationType: "subscribers",
              message:
                fromUserName + " just put up a new item.Check it out Now",
              userId: change.data().userId,
            },
          };

          // promises.push(admin.messaging().sendToDevice(tokenId, payload));

          return admin.messaging().sendToTopic(change.data().userId, payload);
        } else {
          throw new Error("No sender document!");
          //the error is goinf to be catched by the catch method at the end of the promise chaining
        }
      })

      .then((results) => {
        console.log("All notifications sent!");
        return true;
      })
      .catch((error) => {
        console.log(error);
        return false;
      });
  });

  const ALGOLIA_INDEX_NAME = 'allProducts';
  //const client = algoliasearch('#########', '########');
  const client = algoliasearch('T7FYZXZ6C2', '180adb3f5b2be3cef1a526a16bc2ad72');
 // const client = algoliasearch(ALGOLIA_ID,ALGOLIA_ADMIN_KEY);
// [END init_algolia]

// [START update_index_function]
// Update the search index every time a blog post is written.
exports.onProductCreated = functions.firestore.document("allProducts/{productId}").onCreate((snap, context) => {
  // Get the product document
  const product = snap.data();

  console.log("product is",product.toString());
  console.log("product id is",product.productId);

  // Add an 'objectID' field which Algolia requires
  product.objectID = context.params.productId;
  console.log("Pushed everything to Algolia");
  // Write to the algolia index
  const index = client.initIndex(ALGOLIA_INDEX_NAME);
  return index.saveObject(product);
});

exports.feedbackNotification = functions.firestore
  .document("feedback/{feedbackId}")
  .onCreate((change, context) => {
    // Note the syntax has change to Cloud Function v1.+ version (see https://firebase.google.com/docs/functions/beta-v1-diff?0#cloud-firestore)
 
    const promises = [];
    let fromUserId =""
    let fromUserName ="";
        let feedback = "";
    let feedbackAdminId = "";
    let productId = "";
    let productAdminId = ""
    //  console.log("message text" + change.data().message);
    console.log("product Admin id" + change.data().productAdmin);
    productId = change.data().productId;

    var senderDetails = admin
      .firestore()
      .collection("users")
      .doc(change.data().feedbackAdmin)
      .get()
      .then((doc) => {
        if (doc.exists) {
          console.log("Document data:", doc.data());
          fromUserName = doc.data().fullNames;
          fromUserId = doc.id;
          console.log("user name is" + fromUserName);
          console.log(doc.id, "=>", doc.data());
          const tokenId = doc.data().notificationToken;
          console.log("fcm token" + tokenId);
          const payload = {
            notification: {
              title: "Okrika",
              sound: "default",
              body: fromUserName + " has left a feedback on your product",
            },
            data: {
              // username: fromUserName,
              click_action: "FLUTTER_NOTIFICATION_CLICK",
              notificationType: "feedback",
              message:
                fromUserName + " has left a feedback on your product",
             
              productId:change.data().productId
            },
          };

          // promises.push(admin.messaging().sendToDevice(tokenId, payload));

          return admin.messaging().sendToDevice(tokenId, payload);
 } else {
          throw new Error("No sender document!");
          //the error is goinf to be catched by the catch method at the end of the promise chaining
        }
      })

      .then((results) => {
        console.log("All notifications sent!");
        return true;
      })
      .catch((error) => {
        console.log(error);
        return false;
      });
  });
