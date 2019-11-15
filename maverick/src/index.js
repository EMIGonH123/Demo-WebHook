const express = require("express");
const morgan = require("morgan");
const request = require('request');
const path = require("path");
const fetch = require('node-fetch');

const {
  getTemplateBtnsWhitImg,
  getTemplateBtnsWhitoutImg,
  getTemplateQuickReplies
} = require("./services/templates");

const {
  getResponseFromBotMarketeer
} = require("./services/marketeer");

const {
  getBtnPhone,
  getBtnPostback,
  getBtnURL
} = require("./services/botones");

const {
  getBtnQuickReplies
} = require("./services/respuestasRapidas");

const app = express();

// ---> Definimos las variables de entorno para nuestro proyecto en Heroku
// heroku config:set APP_ID=2466055157055554 -a webhook-maverick
// heroku config:set APP_SECRET=a436be53595bab8e99488cef7c0f14e0 -a webhook-maverick
// heroku config:set APP_URL=https://webhook-maverick.herokuapp.com/ -a webhook-maverick
// heroku config:set PAGE_ID=124755254316876 -a webhook-maverick
// heroku config:set PAGE_ACCESS_TOKEN=EAAjC3TWiAEIBAMfUxPSH3flSz44Og7G0ciHzhqLZAPyGGRwIg2WyMPU6NjDOxztjp6CHZCRbzY4CMaGvDdbzQZB3nbIMMzyNYfhOEsI4W94KuS2OczsWieay1SwqdiU2njnc14HfxDwq3a8J4SN7unjIHz46M5Wth9LaqouZBXyZBZBWRXl8QC -a webhook-maverick
// heroku config:set VERIFY_TOKEN=webhookmaverick2019 -a webhook-maverick
// heroku config:set SHOP_URL=https://webhook-maverick.herokuapp.com/ -a webhook-maverick
// heroku config: set PERSON_ID = 1424935877661714 -a webhook-maverick

// Configuraciones para una APP en facebook
// URL de las Condiciones del servicio: https://marketeer.co/es/terminos-y-condiciones/
// URL de la política de privacidad: https://marketeer.co/es/acuerdo-de-politica-de-privacidad-en-linea/

//Importando las variables de entorno del Heroku
const APP_ID = process.env.APP_ID;
const APP_SECRET = process.env.APP_SECRET;
const APP_URL = process.env.APP_URL;
const PAGE_ID = process.env.PAGE_ID;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const SHOP_URL = process.env.SHOP_URL;
// const PERSON_ID = process.env.PERSON_ID;

//Imprimiendo las variables de entorno del 
console.log("----------------------------");
console.log("--- Variables de entorno ---");
console.log("----------------------------");
console.log("---> APP_ID: " + APP_ID);
console.log("---> APP_SECRET: " + APP_SECRET);
console.log("---> APP_URL: " + APP_URL);
console.log("---> PAGE_ID " + PAGE_ID);
console.log("---> PAGE_ACCESS_TOKEN: " + PAGE_ACCESS_TOKEN);
console.log("---> VERIFY_TOKEN: " + VERIFY_TOKEN);
console.log("---> SHOP_URL: " + SHOP_URL);
// console.log("---> PERSON_ID: " + PERSON_ID);

//URLs de las imagenes de Maverick
const urlsServicios = [
  `${APP_URL}Maverick/Imgs/Logos/Branding.png`,
  `${APP_URL}Maverick/Imgs/Logos/ProduccionGrafica.png`,
  `${APP_URL}Maverick/Imgs/Logos/ProduccionAudiovisual.png`,
  `${APP_URL}Maverick/Imgs/Logos/MarketingDigital.png`,
  `${APP_URL}Maverick/Imgs/Logos/MaverickSala.png`,
  `${APP_URL}Maverick/Imgs/Logos/MaverickAgency.png`
];

console.log("-------------------------");
console.log("--- URLs de servicios ---");
console.log("-------------------------");
console.log(`---> URLs servicios: ${urlsServicios}`);

//Acciones por defecto en el template
const default_action = {
  type: "web_url",
  url: "https://www.instagram.com/maverick_agency/",
  fallback_url: "https://www.instagram.com/maverick_agency/"
};

// Configuracion
app.set("port", process.env.PORT || 1337);
app.set("view engine", "jade");

//Midlewares del servidor 
app.use(express.static(path.join(path.resolve(), "public")));
app.use(morgan("dev"));
app.use(express.json());

// Funcion para quitar el HTML
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

// Funcion para generar numeros enteros random
async function getRandomInt(min, max) {
  let num = await Math.floor(Math.random() * (max - min)) + min; 
  return num;
}

async function getResponseByPlainTextWithBotMktr(text) {
  let data,
    respuestaBot,
    cadenaLimpia,
    btns = [],
    image_url,
    respuesta;

  if (text == "Hola" || text == "Empezar" || text == "Iniciar" || text == "Start") {
    data = await getResponseFromBotMarketeer("Hola");
    respuestaBot = data[0]["respuesta"];
    cadenaLimpia = limpiarCadena(respuestaBot);
    btns.push(getBtnPostback("Contactos", "Contactos"));
    btns.push(getBtnPostback("Servicios", "Servicios"));
    btns.push(getBtnPostback("Más info", "Bienvenido"));
    image_url = urlsServicios[4];
    console.log(`---> Image_url: ${image_url}`);
    respuesta = getTemplateBtnsWhitImg(default_action, btns, "Maverick", cadenaLimpia, image_url);
  } else if (text == "Salir" || text == "Adios" || text == "Adiós" || text == "Exit" || text == "❌" || text == "Bye" || text == "Bay") {
    btns.push(getBtnQuickReplies("text", "👍🏻", "👍🏻"));
    btns.push(getBtnQuickReplies("text", "👎🏻", "👎🏻"));
    data = await getResponseFromBotMarketeer("Adios");
    respuestaBot = data[0]["respuesta"];
    cadenaLimpia = limpiarCadena(respuestaBot);
    console.log("---> Cadena limpia: " + cadenaLimpia);
    cadenaLimpia = `${cadenaLimpia}\n\nMe gustaría que me dieras el Feedback de la interaccion con Mavermate Adriana.`;
    respuesta = getTemplateQuickReplies(cadenaLimpia, btns);
  } else if (text == "Tengo una duda" || text == "Preguntas frecuentes" || text == "Preguntas" || text == "❓" || text == "Dudas") {
    btns.push(getBtnPostback("¿Que servicios tienen?", "¿Que servicios tienen?"));
    btns.push(getBtnPostback("Ubicación", "Ubicación"));
    btns.push(getBtnPostback("Info de paquetes", "Info de paquetes"));
    respuesta = getTemplateBtnsWhitoutImg("Estas son algunas preguntas frecuentes (Tambien puede escribir su pregunta y trataré de darle mi mejor respuesta).", btns);
  } else if (text == "😮" || text == "😯" || text == "😱" || text == "😃" || text == "🙂" || text == "😀") {
    btns.push(getBtnQuickReplies("text", "👍🏻", "👍🏻"));
    btns.push(getBtnQuickReplies("text", "👎🏻", "👎🏻"));
    data = await getResponseFromBotMarketeer("Me gusta");
    respuestaBot = data[0]["respuesta"];
    cadenaLimpia = limpiarCadena(respuestaBot);
    console.log("---> Cadena limpia: " + cadenaLimpia);
    cadenaLimpia = `${cadenaLimpia}\n\nMe gustaría que me dieras el Feedback de la interaccion con Mavermate Adriana.`;
    respuesta = getTemplateQuickReplies(cadenaLimpia, btns);
  } else if (text == "🤕" || text == "😦" || text == "🙁" || text == "😔" || text == "😕" || text == "😒" || text == "🤨" || text == "😫" || text == "😩" || text == "😐" || text == "😧") {
    btns.push(getBtnQuickReplies("text", "👍🏻", "👍🏻"));
    btns.push(getBtnQuickReplies("text", "👎🏻", "👎🏻"));
    data = await getResponseFromBotMarketeer("Te has equivocado");
    respuestaBot = data[0]["respuesta"];
    cadenaLimpia = limpiarCadena(respuestaBot);
    console.log("---> Cadena limpia: " + cadenaLimpia);
    cadenaLimpia = `${cadenaLimpia}\n\nMe gustaría que me dieras el Feedback de la interaccion con Mavermate Adriana.`;
    respuesta = getTemplateQuickReplies(cadenaLimpia, btns);
  } else {
    data = await getResponseFromBotMarketeer(text);
    respuestaBot = data[0]["respuesta"];
    cadenaLimpia = limpiarCadena(respuestaBot);
    console.log("---> Cadena limpia: " + cadenaLimpia);
    respuesta = {
      "text": `${cadenaLimpia}`
    }
  }
  return respuesta;
}

// Funciones para el manejo de los mensajes
async function handleMessage(sender_psid, received_message) {
  console.log("---> Entrando al handleMessage");
  let response, data, respuestaBot, cadenaLimpia, btns = [], image_url;

  // Check if the message contains text
  if (received_message.text) {

    console.log("---> Mensaje de texto en el handleMessage");
    console.log(received_message.text);

    switch (received_message.text) {
      case "Hola":
        console.log("---> Case Hola")
        btns.push(getBtnPostback("Contactos", "Contactos"));
        btns.push(getBtnPostback("Servicios", "Servicios"));
        btns.push(getBtnPostback("Más info", "Bienvenido"));
        image_url = urlsServicios[3];
        console.log(`---> Image_url: ${image_url}`);
        response = getTemplateBtnsWhitImg(default_action, btns, "Maverick", "Estrategas especializados en desarrollar experiencias de marca", image_url);
        break;

      case "👍🏻":
        response = {
          "text": "¡Gracias por el FeedBack!\n\nQue bueno que cumplí mi objetivo 😃."
        }
        break;

      case "👎🏻":
        response = {
          "text": "¡Gracias por el FeedBack!\n\nLamento no cumplir con mi objetivo 😕."
        }
        break;

      case "Preguntas/Dudas":
        console.log("---> Case Preguntas/Dudas")
        btns.push(getBtnPostback("¿Que servicios tienen?", "¿Que servicios tienen?"));
        btns.push(getBtnPostback("Ubicación", "Ubicación"));
        btns.push(getBtnPostback("Info de paquetes", "Info de paquetes"));
        // btns.push(getBtnPostback("Horarios de atención", "Horarios"));
        // btns.push(getBtnPostback("Vacantes de trabajo", "Vacantes de trabajo"));
        response = getTemplateBtnsWhitoutImg("Estas son algunas preguntas frecuentes (Tambien puede escribir su pregunta y trataré de darle mi mejor respuesta).", btns);
        break;

      case "¿Quienes somos?":
        response = {
          "text": "¡Somos la agencia que construirá el nuevo rumbo de tu marca!\n\nCompártenos la visión que tienes para tu negocio al correo:\n   hola@maverick.com.mx."
        }
        break;

      default:
        response = await getResponseByPlainTextWithBotMktr(received_message.text);
        break;
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
  // Enviando la respuesta
  callSendAPI(sender_psid, response);
}

// Funcion para procesar los Payload
async function getResponseByPayload(payload) {
  let data, respuestaBot, cadenaLimpia, respuesta, image_url, btns = [];

  console.log("---> Payload del postback");
  console.log(payload);

  switch (payload) {
    case "Empezar":
      console.log("---> Case Empezar")
      btns.push(getBtnPostback("Contactos", "Contactos"));
      btns.push(getBtnPostback("Servicios", "Servicios"));
      btns.push(getBtnPostback("Más info", "Bienvenido"));
      image_url = urlsServicios[4];
      console.log(`---> Image_url: ${image_url}`);
      respuesta = getTemplateBtnsWhitImg(default_action, btns, "Maverick", "Estrategas especializados en desarrollar experiencias de marca", image_url);
      break;

    case "Contactos":
      console.log("---> Case Contactos");
      //data = await getResponseFromBotMarketeer("Hola");
      btns.push(getBtnURL("https://www.maverick.com.mx", "Sitio web"));
      btns.push(getBtnURL("https://www.instagram.com/maverick_agency/", "Instagram"));
      btns.push(getBtnPhone("Llamar a Maverick", 52, 5587166297));
      image_url = urlsServicios[5];
      console.log(`---> Image_url: ${image_url}`);
      respuesta = getTemplateBtnsWhitImg(default_action, btns, "Contactos Maverick", "¡Ponte en contacto y conocenos!", image_url);
      break;

    case "Servicios":
      console.log("---> Case Servicios");
      btns.push(getBtnURL("https://www.maverick.com.mx/#servicios", "Marketing Experiencial"));
      btns.push(getBtnURL("https://www.maverick.com.mx/#servicios", "Producción Audiovisual"));
      btns.push(getBtnURL("https://www.maverick.com.mx/#servicios", "Producción Gráfica"));
      let i = await getRandomInt(0,4);
      image_url = urlsServicios[i];
      console.log(`---> Image_url: ${image_url}`);
      respuesta = getTemplateBtnsWhitImg(default_action, btns, "Servicios Maverick", "¡Conoce nuestros servicios!", image_url);
      break;

    case "Bienvenido":
      console.log("---> Case Bienvenido");
      btns.push(getBtnQuickReplies("text", "¿Quienes somos?", "¿Quienes somos?"));
      btns.push(getBtnQuickReplies("text", "Preguntas/Dudas", "Preguntas/Dudas"));
      btns.push(getBtnQuickReplies("text", "❌", "❌"));
      data = await getResponseFromBotMarketeer("Hola");
      respuestaBot = data[0]["respuesta"];
      cadenaLimpia = limpiarCadena(respuestaBot);
      respuesta = getTemplateQuickReplies(cadenaLimpia, btns);
      break;

    default:
      data = await getResponseFromBotMarketeer(payload);
      respuestaBot = data[0]["respuesta"];
      cadenaLimpia = limpiarCadena(respuestaBot);
      respuesta = {
        "text": cadenaLimpia
      }
      break;
  }

  console.log("---> JSON del template:");
  console.log(respuesta);

  return respuesta;
}

// Manejador de eventos postback
async function handlePostback(sender_psid, received_postback) {
  let response;

  // Obtenemos el payload del postback
  let payload = received_postback.payload;

  //Obtenemos la respuesta por medio del payload
  response = await getResponseByPayload(payload);

  // Enviamos la respuesta
  callSendAPI(sender_psid, response);
}

// Funcion en cargada de mandar la respuesta al usuario
function callSendAPI(sender_psid, response) {

  // Definimos el JSON que se va a mandar
  // let request_body = {
  //   "recipient": {
  //     "id": sender_psid
  //   },
  //   "message": response,
  //   "persona_id": PERSON_ID
  // }

  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Enviar la peticion HTTP a la plataforma de Messenger
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
}

// Ruta de prueba para el Servidor Local
app.get("/", (req, res) => {
  res.send("Hola mundo con  NODEJS");
});

// Ruta para las peticiones GET
app.get('/webhook', (req, res) => {

  // El token es un String random
  let VERIFY_TOKEN = "webhookmaverick2019";

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

// Ruta para las peticiones POST
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

// Ponemos a correr el servidor
app.listen(app.get("port"), () => {
  console.log("------------------------");
  console.log("--- WebHook Maverick ---");
  console.log("------------------------");
  console.log(`---> Servidor en el puerto: ${app.get("port")}`);
});

