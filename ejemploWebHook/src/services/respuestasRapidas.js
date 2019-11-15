function getBtnQuickReplies(type, titulo, payload) {
    if (type == "text") {
        return {
            "content_type": type,
            "title": titulo,
            "payload": payload
        }
    } else {
        return {
            "content_type": type
        }
    }
}

function getBtnsQuickReplies(...args) {
    let arregloBtns = [];
    args.forEach(btn => {
        arregloBtns.push(getBtnQuickReplies(btn.type, btn.titulo, btn.payload));
    });
    return arregloBtns;
}

module.exports.getBtnQuickReplies = getBtnQuickReplies;
module.exports.getBtnsQuickReplies = getBtnsQuickReplies;