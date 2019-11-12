const express = require("express");
const morgan = require("morgan");
const request = require('request');
const path = require("path");
const fetch = require('node-fetch');
const app = express();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const PERSON_ID = process.env.PERSON_ID;

//const PAGE_ACCESS_TOKEN = "EAAHeZAwIZASdgBAPwrw4kCJiF8ptZCNhxWZC5Tj8kie1VhcWps7nBdseFt2ktW2vZASd5s1qjFj9jAaKwvEQn7PcuqEqRcZCu5KsiRa33DkcOUscAtQJUgcyjumwQelfX7HoKeBCTZBS97jB7xPfPjiQAY7rFbpsy5edcBvpMPipQttZA7SeYhuT";
// Mostramos el token de acceso
console.log("---> PAGE_ACCESS_TOKEN: " + PAGE_ACCESS_TOKEN);
console.log("---> PERSON_ID: " + PERSON_ID);

app.set("port", process.env.PORT || 1337);
app.set("view engine", "jade");

// Path para servir archivos estaticos
app.use(express.static(path.join(path.resolve(), "public")));
app.use(morgan("dev"));
app.use(express.json());

// Quitamos el texto HTML
function limpiarCadena(cadena) {
  let er = new RegExp("\\<.*?>");
  let er2 = new RegExp("\\s\\s+");
  while (er.test(cadena)) {
    cadena = cadena.replace(er, ' ');
  }
  while (er2.test(cadena)) {
    cadena = cadena.replace(er2, ' ');
  }
  return cadena;
}

//Funciones para el formato de plantillas de facebook
function agregarBoton1(cadenaLimpia, btn1) {
  return {
    "text": `${cadenaLimpia}`,
    "quick_replies": [
      {
        "content_type": "text",
        "title": `${btn1}`
      }
    ]
  }
}


function paginaWeb(titulo, subtitulo, imagen_url, default_action_url, fallback_url) {
  // https://webhook-demo-bot1.herokuapp.com/personas/Mavermate.jpg
  // https://www.facebook.com/appwebhook/
  return response = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [
          {
            "title": `${titulo}`,
            "image_url": `${imagen_url}`,
            "subtitle": `${subtitulo}`,
            "default_action": {
              "type": "web_url",
              "url": `${default_action_url}`,
              "messenger_extensions": true,
              "webview_height_ratio": "tall",
              "fallback_url": `${fallback_url}`
            },
            "buttons": [
              {
                "type": "web_url",
                "url": "https://www.togasoluciones.com/",
                "title": "TOGA"
              }, {
                "type": "postback",
                "title": "Start Chatting",
                "payload": "DEVELOPER_DEFINED_PAYLOAD"
              }
            ]
          }
        ]
      }
    }
  }
}

/*****************************
 * Funciones de configuracion 
 *****************************/
function createMessage(payload, data) {
  // Mensaje de bienvenida que se ve en el BOT de Messenger
  let text = `Hola {{user_first_name}} bienvenido a ${data.company}.\n${data.info}`;

  // Es el postback que se va a mandar cuando 
  // se presione "Empezar"
  let request_body = {
    "get_started": {
      "payload": `${payload}`
    },
    "greeting": [
      {
        "locale": "default",
        "text": text
      }, {
        "locale": "en_US",
        "text": "Timeless apparel for the masses."
      }
    ]
  };

  request({
    "uri": "https://graph.facebook.com/v2.6/me/messenger_profile",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('---> El mensaje de bienvenida se configuro exitosamente');
      console.log(res);
      return res;
    } else {
      console.error("---> El mensaje de bienvenida no se configuro bien:" + err);
      return {
        "error": `${err}`
      };
    }
  });
}



function createPerson(name, url_img) {

  let request_body = {
    "name": `${name}`,
    "profile_picture_url": `${url_img}`
  };

  request({
    "uri": "https://graph.facebook.com/me/personas",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('---> La persona fue creada exitosamente');
      console.log(res);
      return res;
    } else {
      console.error("---> La persona no se pudo crear:" + err);
      return {
        "error": `${err}`
      };
    }
  });
}

function getResource(fields) {
  /**
   * formato:
   * fields = ["recurso1", ..., "recursoN"]
   */
  let request_body = {
    "fields": fields
  };

  request({
    "uri": "https://graph.facebook.com/v2.6/me/messenger_profile",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "GET",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log("---> La solicitud de los recursos fue CORRECTA");
      console.log(res);
      return res;
    } else {
      console.error("---> La solicitud de los recursos fue INCORRECTA:" + err);
      return {
        "error": `${err}`
      };
    }
  });
}


/************************
 * Funciones de Botones 
 ***********************/
function getBtnPhone(titulo = "Llamar", country_code = "52", phone_number) {
  return {
    "type": "phone_number",
    "title": titulo,
    "payload": `+${country_code}${phone_number}`
  }
}

function getBtnsPhone(...args) {
  let arregloBtns = [];
  args.forEach(btn => {
    arregloBtns.push(getBtnPhone(btn.titulo, btn.country_code, btn.phone_number));
  });
  return arregloBtns;
}

function getBtnPostback(titulo = "¡Hola!", payload = "Hola") {
  return {
    "type": "postback",
    "title": titulo,
    "payload": payload
  }
}

function getBtnsPostback(...args) {
  let arregloBtns = [];
  args.forEach(btn => {
    arregloBtns.push(getBtnPostback(btn.titulo, btn.payload));
  });
  return arregloBtns;
}

function getBtnURL(url = "https://www.togasoluciones.com", titulo = "TOGA") {
  return {
    "type": "web_url",
    "url": url,
    "title": titulo
  }
}

function getBtnsURL(...args) {
  let arregloBtns = [];
  args.forEach(btn => {
    arregloBtns.push(getBtnURL(btn.url, btn.titulo));
  });
  return arregloBtns;
}

function getBtnsOnlyOneType(type, ...args) {
  /**
   *  El formato del arreglo args es:
   *  args = [
   *    {
   *      "url" : "www.facebook.com",
   *      "titulo" : "Btn URL"
   *    },
   *    {
   *      "title": "Btn payload",
   *       "payload": "Hola"
   *    },
   *    {
   *       "title": "Btn phone",
   *       "payload": `+${country_code}${phone_number}`
   *    }
   *  ] 
   */
  let btns;
  switch (type) {
    case "URL":
      btns = getBtnsURL(args);
      break;

    case "POSTBACK":
      btns = getBtnsPostback(args);
      break;

    case "PHONE_NUMBER":
      btns = getBtnsPhone(args);
      break;
    default:
      break;
  }
  return btns;
}

/*********************************
 * Funciones para las plantillas 
 *********************************/
function getTemplateBtnsWhitoutImg(text, btns) {
  return {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "button",
        "text": `${text}`,
        "buttons": btns
      }
    }
  }
}

function getTemplateBtnsWhitImg(
  titulo = "Titulo",
  subtitle = "Subtitulo",
  image_url = "https://webhook-demo-bot1.herokuapp.com/personas/Mavermate.jpg",
  default_action,
  btns
) {

  return {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [
          {
            "title": `${titulo}`,
            "image_url": `${image_url}`,
            "subtitle": `${subtitle}`,
            "default_action": {
              "type": `${default_action.type}`,
              "url": `${default_action.url}`,
              "messenger_extensions": true,
              "webview_height_ratio": "tall",
              "fallback_url": `${default_action.fallback_url}`
            },
            "buttons": btns
          }
        ]
      }
    }
  }
}
/**********************************************
 *  API que se conecta con el bot de Marketeer 
 **********************************************/
async function obtenerRespuestaBotMarketeer(question) {
  // const usu = ' 0x1d3592714'; //Appwebhook
  const usu = '0x1d3a9e1d6'; //Maverik
  //const usu = idusu;

  const room = '974deac3-175d-9f6f-87db-ff357cb199fd-d0e1f';
  const lang = 'es';
  const repeat = 'true';

  // En caso de que el bot de marketeer no sepa responder,
  // se lanza una respuesta por defecto
  let default_responses = {
    404: {
      es: "No hay sugerencias del bot",
      en: "There's no bot suggestions",
    }
  };

  const bot_api = encodeURI(`https://my.marketeer.co/controlador_marketeer/pregunta/?codigo=${room}&datos=${question}&lang=${lang}&usu=${usu}&repetir=${repeat}`);

  const request = await fetch(bot_api);
  const bot_reply = await request.json();

  console.log("---> En el consumo de la API JSON (Crudos):\n");
  console.log(bot_reply);

  if (bot_reply.faqs.length > 0) {
    return bot_reply.faqs;
  } else {
    return [{ respuesta: default_responses[404][lang] }];
  }
}

//Funciones para el desarrollo del BOT
// Handles messages events
async function handleMessage(sender_psid, received_message) {
  console.log("---> Entrando al handleMessage");
  let response, data, respuestaBot, cadenaLimpia;

  // Check if the message contains text
  if (received_message.text) {

    //API del Bot
    data = await obtenerRespuestaBotMarketeer(received_message.text);
    respuestaBot = data[0]["respuesta"];
    cadenaLimpia = limpiarCadena(respuestaBot);
    console.log("---> Cadena limpia: " + cadenaLimpia);
    // response = {
    //   "text": `${cadenaLimpia}`
    // }
    //response = agregarBoton2(cadenaLimpia, "Servicios", "Ubicacion");
    response = {
      "text": `${cadenaLimpia}`
    }
  } else if (received_message.attachments) {


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
  await callSendAPI(sender_psid, response);

  console.log("---> Saliendo del handleMessage");
}

async function getResponseByPayload(payload) {
  let data, respuestaBot, cadenaLimpia, btns = [];
  let default_action = {
    type:"web_url",
    url: "https://www.facebook.com/appwebhook/",
    fallback_url: "https://www.facebook.com/"
  };

  switch (payload) {
    case "Empezar":
      data = await obtenerRespuestaBotMarketeer("Hola");
      break;

    default:
      data = await obtenerRespuestaBotMarketeer(payload);
      break;
  }

  respuestaBot = data[0]["respuesta"];
  cadenaLimpia = limpiarCadena(respuestaBot);

  btns.push(getBtnURL("https://www.togasoliciones.com", "TOGA"));
  btns.push(getBtnPhone("Llamar a TOGA", 52, 5514505050));
  btns.push(getBtnPostback("Servicios", "Servicios"));


  return getTemplateBtnsWhitImg(titulo = "TOGA", subtitulo = cadenaLimpia, default_action, btns);
  //Regresamos el JSON del response que maneja el postback
  // return {
  //   "text": cadenaLimpia
  // }
}

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;

  //Obtenemos la respuesta por medio del payload
  response = await getResponseByPayload(payload);

  // Send the message to acknowledge the postback
  await callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  console.log("---> Entrando al callSendAPI");
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response,
    "persona_id": PERSON_ID
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('---> El mensaje fue enviado exitosamente')
    } else {
      console.error("---> No se pudo enviar el mensaje:" + err);
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
      console.log("---> Evento del webhook:");
      //Vamos a ver que tiene el evento del webhook
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('---> Sender PSID: ' + sender_psid);

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

