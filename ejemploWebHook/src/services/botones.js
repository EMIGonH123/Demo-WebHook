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

module.exports.getBtnsOnlyOneType = getBtnsOnlyOneType;
module.exports.getBtnsURL = getBtnsURL;
module.exports.getBtnURL = getBtnURL;
module.exports.getBtnsPhone = getBtnsPhone;
module.exports.getBtnPhone = getBtnPhone;
module.exports.getBtnsPostback = getBtnsPostback;
module.exports.getBtnPostback = getBtnPostback;