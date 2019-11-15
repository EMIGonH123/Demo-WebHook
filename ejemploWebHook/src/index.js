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

// Funciones para el manejo de los mensajes
async function handleMessage(sender_psid, received_message) {
  console.log("---> Entrando al handleMessage");
  let response, data, respuestaBot, cadenaLimpia, btns = [], image_url;

  //Boton para instagram
  let default_action = {
    type: "web_url",
    url: "https://www.instagram.com/maverick_agency/",
    fallback_url: "https://www.instagram.com/maverick_agency/"
  };

  let urlsServicios = [
    "https://webhook-demo-bot1.herokuapp.com/Maverick/Imgs/Logos/Branding.png",
    "https://webhook-demo-bot1.herokuapp.com/Maverick/Imgs/Logos/MarketingDigital.png",
    "https://webhook-demo-bot1.herokuapp.com/Maverick/Imgs/Logos/ProduccionAudiovisual.png",
    "https://webhook-demo-bot1.herokuapp.com/Maverick/Imgs/Logos/ProduccionGrafica.png"
  ];

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
        image_url = "https://webhook-demo-bot1.herokuapp.com/Maverick/Imgs/Logos/MaverickSala.png";
        response = getTemplateBtnsWhitImg(default_action, btns, "Maverick","Estrategas especializados en desarrollar experiencias de marca",image_url);
      break;

      case "❌":     
        console.log("---> Case Finalizar");
        btns.push( getBtnQuickReplies("text","👍🏻","👍🏻"));
        // btns.push( getBtnQuickReplies("text","2/3","leve"));
        btns.push( getBtnQuickReplies("text","👎🏻","👎🏻"));
        cadenaLimpia = "Hola, me gustaría que me dieras el FeedBack de la interaccion con Mavermate Adriana";
        response = getTemplateQuickReplies(cadenaLimpia, btns);
      break;

      case "👍🏻":
        response = {
          "text" : "¡Gracias por el FeedBack!\n\nQue bueno que cumplí mi objetivo."
        }
      break;

      case "👎🏻'":
        response = {
          "text" : "¡Gracias por el FeedBack!\n\nLamento no cumplir con mi objetivo."
        }
      break;

      case "Preguntas / Dudas":
        response = {
          "text" : "Estas son algunas preguntas frecuentes.\n\n \
                    ¿Que servicios tienen?\n\n \
                    Ubicación de la empresa\n \
                    Paquetes que ofrecen\n \
                    Horarios de atención\n \
                    Vacantes de trabajo\n\n \
                    ...o también escriba su pregunta y trataré de darle mi mejor respuesta.\n \
                  "
        }
      break;

      case "¿Quienes somos?":
        response = {
          "text" : "¡Somos la agencia que construirá el nuevo rumbo de tu marca!\n \
                    Compártenos la visión que tienes para tu negocio al correo:\n \
                    hola@maverick.com.mx.\n \
                  "
        }
      break;
      
      default:
        //API del Bot
        data = await getResponseFromBotMarketeer(received_message.text);
        respuestaBot = data[0]["respuesta"];
        cadenaLimpia = limpiarCadena(respuestaBot);
        console.log("---> Cadena limpia: " + cadenaLimpia);
        response = {
          "text": `${cadenaLimpia}`
        }
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

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// Funcion para
async function getResponseByPayload(payload) {
  let data, respuestaBot, cadenaLimpia, respuesta, image_url, btns = [];

  //Boton para instagram
  let default_action = {
    type: "web_url",
    url: "https://www.instagram.com/maverick_agency/",
    fallback_url: "https://www.instagram.com/maverick_agency/"
  };

  let urlsServicios = [
    "https://webhook-demo-bot1.herokuapp.com/Maverick/Imgs/Logos/Branding.png",
    "https://webhook-demo-bot1.herokuapp.com/Maverick/Imgs/Logos/MarketingDigital.png",
    "https://webhook-demo-bot1.herokuapp.com/Maverick/Imgs/Logos/ProduccionAudiovisual.png",
    "https://webhook-demo-bot1.herokuapp.com/Maverick/Imgs/Logos/ProduccionGrafica.png"
  ];
  console.log("---> Payload del postback");
  console.log(payload);
  switch (payload) {
    case "Empezar":
      console.log("---> Case Empezar")
      btns.push(getBtnPostback("Contactos", "Contactos"));
      btns.push(getBtnPostback("Servicios", "Servicios"));
      btns.push(getBtnPostback("Más info", "Bienvenido"));
      image_url = "https://webhook-demo-bot1.herokuapp.com/Maverick/Imgs/Logos/MaverickSala.png";
      respuesta = getTemplateBtnsWhitImg(default_action, btns, "Maverick","Estrategas especializados en desarrollar experiencias de marca",image_url);
    break;

    case "Contactos":
      console.log("---> Case Contacto");
      //data = await getResponseFromBotMarketeer("Hola");
      btns.push(getBtnURL("https://www.maverick.com.mx", "Sitio web"));
      btns.push(getBtnURL("https://www.instagram.com/maverick_agency/", "Instagram"));
      btns.push(getBtnPhone("Llamar a Maverick", 52, 5587166297));
      image_url = "https://webhook-demo-bot1.herokuapp.com/Maverick/Imgs/Logos/MaverickAgency.png";
      respuesta = getTemplateBtnsWhitImg(default_action, btns, "Contactos Maverick","¡Ponte en contacto y conocenos!",image_url);
    break;

    case "Servicios":
      console.log("---> Case Servicios");
      btns.push(getBtnURL("https://www.maverick.com.mx/#servicios", "Marketing Experiencial"));
      btns.push(getBtnURL("https://www.maverick.com.mx/#servicios", "Producción Audiovisual"));
      btns.push(getBtnURL("https://www.maverick.com.mx/#servicios", "Producción Gráfica"));
      // let i = getRandomInt(0, urlsServicios.length );
      // image_url = urlsServicios[0];
      image_url = "https://webhook-demo-bot1.herokuapp.com/Maverick/Imgs/Logos/MarketingDigital.png";
      respuesta = getTemplateBtnsWhitImg(default_action, btns, "Servicios Maverick","¡Conoce nuestros servicios!",image_url);
    break;

    case "Bienvenido":
      console.log("---> Case Hola");
      btns.push(getBtnQuickReplies("text","¿Quienes somos?","¿Quienes somos?"));
      btns.push(getBtnQuickReplies("text","Preguntas / Dudas","Preguntas / Dudas"));
      btns.push(getBtnQuickReplies("text","❌","❌"));
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
        "text" : cadenaLimpia
      }
    break;
  }

  // console.log("---> Botones:");
  // console.log(btns);

  console.log("---> JSON del template:");
  console.log(respuesta);

  // console.log("---> JSON de los elementos del payload en el template:");
  // console.log(respuesta.attachment.payload.elements);

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
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response,
    "persona_id": PERSON_ID
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
  console.log("--------------------------");
  console.log("--- Ejemplo de WebHook ---");
  console.log("--------------------------");
  console.log(`---> Servidor en el puerto: ${app.get("port")}`);
});

