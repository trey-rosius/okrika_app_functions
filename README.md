# Sending Okrika Notifications with Cloud Functions

Type of notifications being sent currenly are :

- [x] Chat notifications
- [x] Subscription notifications(When a user subscribes to another user)
- [x] Notifications in the notifications node

## Functions Code

See file [functions/index.js](functions/index.js) for the notification code.

The dependencies are listed in [functions/package.json](functions/package.json).

## Database Structure for chats

When 2 users are chatting

```
/okrika-project
    /chats
        /$uid
            /chatThread
                      /$chatId
                       senderId:#########
                       receiverId:#########
                       message:###########


```

the receiverId is used to get the push notification token from the users collection for the respective user

## Trigger rules

The function triggers on changes to `/chats/$usersId/chatThread/$chatId`
The function triggers on changes to `/notifications/$notificationsId`
The function triggers on changes to `/allProducts/$productId`

## Setting up the sample

1.  Create a Firebase Project using the [Firebase Console](https://console.firebase.google.com).
1.  Enable the **Google** Provider in the **Auth** section.
1.  Clone or download this repo and open the `okrika_app_functions` directory.
1.  You must have the Firebase CLI installed. If you don't have it install it with `npm install -g firebase-tools` and then configure it with `firebase login`.
1.  Configure the CLI locally by using `firebase use --add` and select your project in the list.
1.  Install dependencies locally by running: `cd functions; npm install; cd -`
1.  To be able to send emails with your Gmail account: enable access to [Less Secure Apps](https://www.google.com/settings/security/lesssecureapps) and [Display Unlock Captcha](https://accounts.google.com/DisplayUnlockCaptcha). For accounts with 2-step verification enabled [Generate an App Password](https://support.google.com/accounts/answer/185833).
1.  Set the `gmail.email` and `gmail.password` Google Cloud environment variables to match the email and password of the Gmail account used to send emails (or the app password if your account has 2-step verification enabled). For this use:
    ```bash
    firebase functions:config:set gmail.email="myusername@gmail.com" gmail.password="secretpassword"
    ```

## Deploy and test

This sample comes with a web-based UI for testing the function. To test it out:

1.  Deploy your project using `firebase deploy`
1.  Open the app using `firebase open hosting:site`, this will open a browser.
1.  Sign in the web app in the browser using Google Sign-In and delete your account using the button on the web app. You should receive email confirmations for each actions.
