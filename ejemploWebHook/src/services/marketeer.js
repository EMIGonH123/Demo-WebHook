const fetch = require('node-fetch');

/**********************************************
 *  API que se conecta con el bot de Marketeer 
 **********************************************/
async function getResponseFromBotMarketeer(question) {
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

module.exports.getResponseFromBotMarketeer = getResponseFromBotMarketeer;