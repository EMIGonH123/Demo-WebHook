const express = require("express");
const morgan = require("morgan");
const request = require('request');

const app = express();
//const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const PAGE_ACCESS_TOKEN= "EAAHeZAwIZASdgBAPwrw4kCJiF8ptZCNhxWZC5Tj8kie1VhcWps7nBdseFt2ktW2vZASd5s1qjFj9jAaKwvEQn7PcuqEqRcZCu5KsiRa33DkcOUscAtQJUgcyjumwQelfX7HoKeBCTZBS97jB7xPfPjiQAY7rFbpsy5edcBvpMPipQttZA7SeYhuT";

console.log("---> PAGE_ACCESS_TOKEN: "+PAGE_ACCESS_TOKEN);
app.set("port", process.env.PORT || 1337);
app.set("view engine", "jade");

app.use(morgan("dev"));
app.use(express.json());

//Funciones para el desarrollo del BOT
// Handles messages events
function handleMessage(sender_psid, received_message) {
  console.log("---> Entrando al handleMessage");
  let response;

  // Check if the message contains text
  if (received_message.text) {

    // Create the payload for a basic text message
    response = {
      "text": `Enviaste el siguiente mensaje: "${received_message.text}".`
    }
  }else if (received_message.attachments) {
  
    // Gets the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "¿Es tu imagen?",
            "subtitle": "Selecciona una opción",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Simon",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "Nel",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  } 

  // Sends the response message
  callSendAPI(sender_psid, response);

  console.log("---> Saliendo del handleMessage");
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response;
  
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Va que va, gracias!!" }
  } else if (payload === 'no') {
    response = { "text": "Lo lamento, perdí tu imagen :(" }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  console.log("---> Entrando al callSendAPI");
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  console.log("---> PAGE_ACCESS_TOKEN: "+PAGE_ACCESS_TOKEN);
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
  console.log("---> Saliendo del callSendAPI"); 
}


//Ruta de prueba para el Servidor
app.get("/", (req, res) => {
  res.send("Hola mundo con  NODEJS");
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  //let VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>";
  let VERIFY_TOKEN = "emiliano123";

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

app.post('/webhook', (req, res) => {

  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }

    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

app.listen(app.get("port"), () => {
  console.log("--------------------------");
  console.log("--- Ejemplo de WebHook ---");
  console.log("--------------------------");
  console.log(`---> Servidor en el puerto: ${app.get("port")}`);
});

