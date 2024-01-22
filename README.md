# Worker Cloudflare Telegram MongoDB

## Project Initialization Guide

To start with the project, follow these steps:

1. **Install Dependencies**

   Run the following command to install the necessary packages from the `package.json` file:

   ```bash
   npm install
   ```

2. **Set Environment Variables**

   Create a file named `.dev.vars` in the root directory of the project and set the following environment variables:

   ```env
   API_MONGO_TOKEN=YourMongoToken
   API_TELEGRAM=YourTelegramApiKey
   URL_API_MONGO=YourMongoUrl
   ```

   Replace `YourMongoToken`, `YourTelegramApiKey`, and `YourMongoUrl` with your specific information.
   
   `YourMongoToken` and `YourMongoUrl` get [here](https://www.mongodb.com/docs/atlas/app-services/data-api/generated-endpoints/).

   `YourTelegramApiKey` get [here](https://t.me/BotFather).

4. **Run the Application in Development Environment**

   Use the following command to run the application in the development environment:

   ```bash
   npm run dev
   ```

5. **Uploading Variables to Cloudflare Worker**
   
   To upload variables from the `.dev.vars` file to Cloudflare Worker using Wrangler, follow these steps:
   
   5.1. Open your terminal and navigate to the project directory.
   
   5.2. Use the following command to upload the variables from the `.dev.vars` file to Cloudflare Worker:
   
    ```bash
    wrangler secret put
    ```
   
   You will be prompted to interactively enter values for each variable. Enter the values corresponding to the variables in the `.dev.vars` file.
   
   5.3. To fill in information in the `wrangler.toml` file, open the file in a text editor and edit the following fields:
   
    ```toml
    name = "yourworkername"
    account_id = "yourcloudflareaccountid"
    ```
   
   Replace `"yourworkername"` and `"yourcloudflareaccountid"` with the desired name for your Worker and your Cloudflare account ID.
   
6. **Implement Additional Features**

   Now that you have set up the project and successfully run it in the development environment, you can start implementing additional features based on the project requirements and deploy it to Cloudflare worker by use the following command:
   
   ```bash
   npm run deploy
   ```
   
Note that you need to have Wrangler installed and be logged into your Cloudflare account before performing these steps.

## Telegram Functions

The project involves creating a Telegram bot with MongoDB as the database. The supported Telegram functions include:

- `getMe`
- `sendMessage`
- `sendMediaGroup`
- `sendSticker`
- `sendPhoto`
- `editMessage`
- `answerCallbackQuery`

Callback handling is implemented in the `callback.ts` file, command processing in `command.ts` and `self.ts`, and text message processing in `text_processor.ts`.

## MongoDB Functions

MongoDB functions are written based on the OpenAPI documented [here](https://www.mongodb.com/docs/atlas/app-services/data-api/openapi/).

Here is a demo of how to use MongoDB functions:

```typescript
const text = await this.database.db("").collection("").find();
```

## CPU Performance

The CPU performance of [that project](https://github.com/RuriMeiko/telegram-water-reminder) that base on this project is approximately 1.1ms. View the performance chart below:
<p align="center">
  <img src="https://i.ibb.co/d56y0g9/image.png" alt="CPU Performance Chart">
</p>


Feel free to customize and extend the project according to your needs.

## Contribution and Support

We encourage everyone to fork the project and consider giving it a star. Your contributions are highly appreciated!

## Thank you for using our project!
