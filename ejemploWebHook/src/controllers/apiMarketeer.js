let fetch = require('node-fetch');

//Consumo del bot de marketeer
module.exports = async function obtenerRespuestaBotMarketeer(question) {
    const usu = ' 0x1d3592714';
    const room = '974deac3-175d-9f6f-87db-ff357cb199fd-d0e1f';
    const lang = 'es';
    const repeat = 'true';

    let default_responses = {
        404: {
            es: "No hay sugerencias del bot",
            en: "There's no bot suggestions",
        }
    };

    const bot_api = encodeURI(`https://my.marketeer.co/controlador_marketeer/pregunta/?codigo=${room}&datos=${question}&lang=${lang}&usu=${usu}&repetir=${repeat}`);

    const request = await fetch(bot_api);
    const bot_reply = await request.json();

    //console.log("---> En el consumo de la API JSON (FAQS):\n");

    if (bot_reply.faqs.length > 0) {
        console.log("---> Respuesta en texto plano: \n");
        console.log(bot_reply.faqs[0]["respuesta_plain_text"]);
        console.log("---> Respuesta en texto HTML: \n");
        console.log(bot_reply.faqs[0]["respuesta"]);
        return bot_reply;
    } else {
        return [{ respuesta: default_responses[404][lang] }];
    }
}