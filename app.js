'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();

const tokenSolatiDev = "EAAImOHWdddUBAHEJY1AYRCNTAsves1kbjW5pICTJOYgwBpk3AbZAiPYMm6EwybjjSELZCeUN0ci0LjOQwIyGDfv4ZCFLh2x8FIPH2OUKEW2gMS0c3VZC2ZCGI97Tu6VxLovQ8VngUUX2B82k121kSoCOvT7ZB0sEE8FsfSG7nQ5QZDZD";

app.set('port', 5000);
app.use(bodyParser.json());

app.get('/', function (req, response) {
    response.send('Hola Mundo!');
})

app.get('/webhook', function (req, response) {
    if (req.query['hub.verify_token'] === 'chatcobranzas') {
        response.send(req.query['hub.challenge']);
    } else {
        response.send('Chat Cobranzas no tienes permisos.')
    }
})
//Recibe mediante post del api de FB el json
app.post('/webhook/', function (req, response) {
    const data = req.body.originalDetectIntentRequest.payload.data;
    console.log(JSON.stringify(data));
    handleEvent(data.sender.id, data);
    response.sendStatus(200);
})

//Manejo de eventos si es postback o message y su tipo
function handleEvent(senderId, event) {
    if (event.message) {
        if (event.message.attachments) {
            handleAttachments(senderId, event.message);
        } else if (event.message.quick_reply) {
            handlePostback(senderId, event.message.quick_reply.payload);
        } else {
            handleQuickReplies(senderId, event.message);
        }
    } else if (event.postback) {
        handlePostback(senderId, event.postback.payload);
    }
}
// Manejo de Attachments
function handleAttachments(senderId, message) {
    let attachments_type = message.attachments[0].type;

    switch (attachments_type) {
        case "image":
            console.log(attachments_type);
            break;
        case "video":
            console.log(attachments_type);
            break;
        case "audio":
            console.log(attachments_type);
            break;
        case "file":
            console.log(attachments_type);
            break;
        case "location":
            console.log(JSON.stringify(message));
            break;
        default:
            console.log("default" + attachments_type);
            break;
    }
}

//Manejo para los Postback
function handlePostback(senderId, payload) {
    switch (payload) {
        case "postback_welcome":
            const messageText = " Hola, soy Sofía que gusto charlar contigo, antes de poder continuar necesito validar tu identidad me puedes dar tu número de cédula. No te preocupes estoy para ayudarte tus datos serán tratados de forma segura.";
            handleMessage(senderId, messageText);
            break;

        case "consultaCuenta":
            messageContactSupport(senderId);
            showLocations(senderId);
            console.log("1" + payload);
            break;

        case "acuerdoPago":
            console.log("2" + payload);
            showOptions(senderId);
            showListOptions(senderId);
            break;

        case "renegociarAcuerdo":
            console.log("3" + payload);
            getLocation(senderId);
            break;

        case "actualizarDatos":
            console.log("4" + payload);
            messageImage(senderId);
            receipt(senderId);
            break;

        default:
            console.log(payload);
            break;
    }
}

//Encargado de enviar mensajes a un usuario especifico
function handleMessage(senderId, message) {
    const messageData = {
        recipient: {
            id: senderId
        },
        message: {
            text: message
        }
    }
    callSendApi(messageData);
}

//Sugerir respuestas rápidas al usuario
function handleQuickReplies(senderId, message) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "text": message.text,
            "quick_replies": [{
                "content_type": "text",
                "title": "Ver Estado de Cuenta",
                "payload": "consultaCuenta"
            },
            {
                "content_type": "text",
                "title": "Acuerdo de Pago",
                "payload": "acuerdoPago"
            }
            ]
        }
    }
    senderActions(senderId);
    callSendApi(messageData);
}
//Enviar Mensaje
function callSendApi(response) {
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages/",
        "qs": {
            "access_token": tokenSolatiDev
        },
        "method": "POST",
        "json": response
    },
        function (err) {
            if (err) {
                console.log('Ha ocurrido un error')
            } else {
                console.log('Mensaje Enviado')
            }
        }
    )
}

//Enviar Acciones
function senderActions(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "sender_action": "typing_on"
    }
    callSendApi(messageData);
}

//Template genérico: lista de tarjetas horizontales
function showOptions(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Estado de Cuenta",
                        "subtitle": "<Nombre cliente>, tu crédito número <numero crédito> tiene un valor de <monto crédito>, a la fecha has pagado <cuotas pagadas> cuotas de <valor cuota>. El saldo a pagar es de  <saldo> y tus días de pago son los <dia de pago> de cada mes.",
                        "image_url": "https://www.solati.com.co/wp-content/uploads/2018/12/Logo-SOLATI.png",
                        "buttons": [{
                            "type": "postback",
                            "title": "Pactar Acuerdo de Pago",
                            "payload": "acuerdoPago"
                        }]
                    },
                    {
                        "title": "Tus Obligaciones",
                        "subtitle": `<estado> son las siguientes: 
                            1. Obligación 1
                            2. Obligación 2
                            3. Obligación N`,
                        "image_url": "https://www.solati.com.co/wp-content/uploads/2018/12/Logo-SOLATI.png",
                        "buttons": [{
                            "type": "postback",
                            "title": "Gestionar Obligaciones",
                            "payload": "acuerdoPago"
                        }]

                    }
                    ]
                }
            }
        }
    }
    callSendApi(messageData);
}
//Template lista: lista de tarjetas verticales
function showListOptions(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "list",
                    "top_element_style": "large",
                    "elements": [{
                        "title": "Obligación 1",
                        "subtitle": "Crédito Hogar",
                        "image_url": "https://www.solati.com.co/wp-content/uploads/2018/12/Logo-SOLATI.png",
                        "buttons": [{
                            "type": "postback",
                            "title": "Gestionar 1",
                            "payload": "renegociarAcuerdo"
                        }]
                    },
                    {
                        "title": "Obligación 2",
                        "subtitle": "Crédito Carro",
                        "image_url": "https://www.solati.com.co/wp-content/uploads/2018/12/Logo-SOLATI.png",
                        "buttons": [{
                            "type": "postback",
                            "title": "Gestionar 2",
                            "|": "renegociarAcuerdo"
                        }]
                    },
                    {
                        "title": "Obligación 3",
                        "subtitle": "Crédito Celular",
                        "image_url": "https://www.solati.com.co/wp-content/uploads/2018/12/Logo-SOLATI.png",
                        "buttons": [{
                            "type": "postback",
                            "title": "Gestionar 3",
                            "payload": "renegociarAcuerdo"
                        }]
                    },
                    {
                        "title": "Obligación 4",
                        "subtitle": "Crédito avion",
                        "image_url": "https://www.solati.com.co/wp-content/uploads/2018/12/Logo-SOLATI.png",
                        "buttons": [{
                            "type": "postback",
                            "title": "Gestionar 4",
                            "payload": "renegociarAcuerdo"
                        }]
                    }
                    ]
                }
            }
        }
    }
    callSendApi(messageData);
}
//Enviar archivos adjuntos
function messageImage(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "attachment": {
                "type": "image",
                "payload": {
                    "url": "https://www.solati.com.co/wp-content/uploads/2018/12/Logo-SOLATI.png"
                }
            }
        }
    }
    callSendApi(messageData);
}
//Enviar Template tipo botón con contacto
function messageContactSupport(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": "Hola este es el canal de soporte, ¿quieres llamarnos?",
                    "buttons": [{
                        "type": "phone_number",
                        "title": "Llamar a un asesor",
                        "payload": "+573008251246"
                    }]
                }
            }
        }
    }
    callSendApi(messageData);
}
//Template de lista con botones para webview
function showLocations(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "list",
                    "top_element_style": "compact",
                    "elements": [{
                        "title": "Sede Medellín",
                        "image_url": "https://d500.epimg.net/cincodias/imagenes/2015/06/02/lifestyle/1433256140_617326_1433256417_noticia_normal.jpg",
                        "subtitle": "Carrera 43 A # 1 sur 220 Of. 701",
                        "buttons": [{
                            "title": "Ver en el mapa",
                            "type": "web_url",
                            "url": "https://goo.gl/maps/euHUCbGpvo2bE7m99",
                            "webview_height_ratio": "tall"
                        }]
                    },
                    {
                        "title": "Sede Medellín",
                        "image_url": "https://d500.epimg.net/cincodias/imagenes/2015/06/02/lifestyle/1433256140_617326_1433256417_noticia_normal.jpg",
                        "subtitle": "Carrera 43 A # 1 sur 220 Of. 701",
                        "buttons": [{
                            "title": "Ver en el mapa",
                            "type": "web_url",
                            "url": "https://goo.gl/maps/euHUCbGpvo2bE7m99",
                            "webview_height_ratio": "compact"
                        }]
                    }
                    ]
                }
            }
        }
    }
    callSendApi(messageData);
}
//Template de Recibo de Compra
function receipt(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "receipt",
                    "recipient_name": "Ramiro Verbel",
                    "order_number": "123123",
                    "currency": "COP",
                    "payment_method": "Efectivo",
                    "order_url": "https://www.solati.com.co/",
                    "timestamp": "123123123",
                    "address": {
                        "street_1": "Solati SAS",
                        "street_2": "Carrera 43 A # 1 sur 220 Of. 701",
                        "city": "Medellín",
                        "postal_code": "050021",
                        "state": "Colombia",
                        "country": "America del Sur"
                    },
                    "summary": {
                        "subtotal": 120000.00,
                        "shipping_cost": 12000.00,
                        "total_tax": 17920.00,
                        "total_cost": 129920.00
                    },
                    "adjustments": [{
                        "name": "Descuento frecuente",
                        "amount": 20000.00
                    }],
                    "elements": [{
                        "title": "Crédito Carro",
                        "subtitle": "paga tu carro",
                        "quantity": 1,
                        "price": 50000,
                        "currency": "COP",
                        "image_url": "https://cdn-3.expansion.mx/dims4/default/2495ad0/2147483647/strip/true/crop/2121x1414+0+0/resize/800x533!/quality/90/?url=https%3A%2F%2Fcherry-brightspot.s3.amazonaws.com%2Fac%2F7a%2Fdbd676fb46e7b4b9535df0d52bba%2Fistock-637692094.jpg"
                    },
                    {
                        "title": "Crédito Casa",
                        "subtitle": "paga tu casa",
                        "quantity": 1,
                        "price": 70000,
                        "currency": "COP",
                        "image_url": "https://www.elitebrokers.com.co/wp-content/uploads/2017/04/credito-hipotecario.jpg"
                    }
                    ]
                }
            }
        }
    }
    callSendApi(messageData);
}
//Pedir la Ubicación al usuario
function getLocation(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "text": "Ahora ¿Puedes proporcionarnos tu ubicación?",
            "quick_replies": [{
                "content_type": "location"
            }]
        }
    }
    callSendApi(messageData);
}

app.listen(app.get('port'), function () {
    console.log('Nuestro servidor esta funcionando en el puerto', app.get('port'));
})