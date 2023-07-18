# peepl-app-sails

The [Sails v1](https://sailsjs.com) application that powers the backend for the Peepl mobile app.

### Running locally

The [Sails docs](https://sailsjs.com/get-started) recommend you install sails.js globally:

    npm install -g sails
    npm install
    sails lift

But if you don’t want to install sails.js globally, you can skip that step, and use the shortcut script we define in our `package.json`:

    npm install
    npm run lift

We’ve also set up a shortcut that handles [any arguments you want to send to sails](https://sailsjs.com/documentation/reference/command-line-interface), you just need to include a `--`, eg:

    npm run sails -- inspect
    npm run sails -- console

The web frontend will be visible at <http://localhost:1337>.

### Production Dependencies

Some of these are interchangeable (for example, by using a different storage adapter for [Waterline](https://waterlinejs.org/))

+ [Node.js](https://nodejs.org/en/)
+ [Nginx](https://nginx.org/)
+ [Redis](https://redis.io/)
+ [MySQL/MariaDB](https://mariadb.org/)

### Links

+ [Sails framework documentation](https://sailsjs.com/get-started)
+ [Version notes / upgrading](https://sailsjs.com/documentation/upgrading)
+ [Deployment tips](https://sailsjs.com/documentation/concepts/deployment)
### Version info

This app was originally generated on Tue Oct 20 2020 09:54:07 GMT+0100 (British Summer Time) using Sails v1.4.0.

<!-- Internally, Sails used [`sails-generate@2.0.0`](https://github.com/balderdashy/sails-generate/tree/v2.0.0/lib/core-generators/new). -->



<!--
Note:  Generators are usually run using the globally-installed `sails` CLI (command-line interface).  This CLI version is _environment-specific_ rather than app-specific, thus over time, as a project's dependencies are upgraded or the project is worked on by different developers on different computers using different versions of Node.js, the Sails dependency in its package.json file may differ from the globally-installed Sails CLI release it was originally generated with.  (Be sure to always check out the relevant [upgrading guides](https://sailsjs.com/upgrading) before upgrading the version of Sails used by your app.  If you're stuck, [get help here](https://sailsjs.com/support).)
-->

## Fuse Community Administration
See the [fuseCommunity.md](./fuseCommunity.md) for additional admin details for fuse administration.

For example we can set the webhooks using:
## Update the webhook for *Production*:

See [docs]()

```shell
curl -L -X PUT 'https://api.fuse.io/api/v0/notifications/webhook?apiKey=<fuse_public_key>' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'API-SECRET: <fuse_secret_key>' \
--data-raw '{
  "webhookId": "<GUID>",
  "webhookUrl": "https://vegi.vegiapp.co.uk/api/v1/payments/fuse-event-webhook",
  "eventType": "ALL"
}'
```

## Scripts to run
secrets_relative_paths=config/local.js,config/aws.json,config/vegiliverpool-firebase-adminsdk-4dfpz-8f01f888b3.json,config/stripe.json,config/test_stripe.json NODE_ENV=production-script node ./node_modules/sails/bin/sails run secrets-to-env