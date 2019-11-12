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

function getTemplateBtnsWhitImg(default_action, btns, titulo = "Titulo", subtitle = "Subtitulo", image_url = "https://webhook-demo-bot1.herokuapp.com/personas/Mavermate.jpg") {
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
                        "buttons": btns,
                    }
                ]
            }
        }
    }
}

function getTemplateQuickReplies(text, quick_replies) {
    return {
        "text": `${text}`,
        "quick_replies": quick_replies
    }
}

module.exports.getTemplateBtnsWhitImg = getTemplateBtnsWhitImg;
module.exports.getTemplateBtnsWhitoutImg = getTemplateBtnsWhitoutImg;
module.exports.getTemplateQuickReplies = getTemplateQuickReplies;