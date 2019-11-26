
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