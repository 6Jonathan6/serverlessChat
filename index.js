/*
    1.npm install aws-iot-device-sdk

    2.En el folder Path/To/Project/node_modules/aws-iot-device-sdk
        
        npm run-script bowserize

    3.El script index js puede esta en donde sea, en este script programas toda la aplicacion
     una ves que tiene todo el código creas bundle.js que sera els script en el navegador
     En  Path/To/Project/node_modules/aws-iot-device-sdk
        
        npm run-script bowserize Path/to/index.js

    4. El script anterior crea los archivo aws-iot-sdk-browser-bundle.js y bundle.js
        en el directorio de index.js ya solo que agregar el código en el index.html

        <script src="aws-iot-sdk-browser-bundle.js"></script>
        <script src="bundle.js"></script>
*/


const AWS = require('aws-sdk')
const awsIoTData = require('aws-iot-device-sdk')
const config = require('./aws-config.js')

console.log('Loaded AWS SDK for JS and AWS IoT SDK for Nodejs')
const form = document.getElementById('message-form')
const messageBox = document.getElementById('message-box')
const currentTopic = 'message'

let messageHistory = ''
//Debe ser unico
const clientId = ''

AWS.config.region = config.awsRegion

//Debes tener una identity pool en cognito que permita acceso a IoT sin Auth
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: config.identityPoolId
});

//Primer intento de conexión Fallará porque aun no tenemos credentias temporales
//Creamos el mqttClient  que se conectará con el protcolo websokcet
const mqttClient = awsIoTData.device({
    region: config.awsRegion,
    host: config.iotEndpoint,
    clientId: clientId,
    protocol:'wss',
    maximumReconnectTimeMs: 800,
    debug: true,
    accessKeyId:'',
    secretKey:'',
    sessionToken:''
    
})
//CognitoIdentity es el objecto que nos permi obtener credenciales temporales
const cognitoIdentity = new AWS.CognitoIdentity()

//Obtenemos la credenciales
AWS.config.credentials.get(function(err){

//Encaso de que no  haya error
    if(!err){
        console.log('retrieved identity: ' + AWS.config.credentials.identityId)
        clientId = AWS.config.credentials.identityId
        const params = {
            IdentityId: AWS.config.credentials.identityId,
        }
        
        //Este método nos da credentiales para un identityId  de cognito
        cognitoIdentity.getCredentialsForIdentity(params, function(err,data){
            
            if(!err){

                //Agregamos la credenciales de cognito  al  mqttClient con el Siguente metodo
                //Las credentiales estan en data.Credentials.<Keys>     
                mqttClient.updateWebSocketCredentials(
                    data.Credentials.AccessKeyId,
                    data.Credentials.SecretKey,
                    data.Credentials.SessionToken
                )

            //Encaso de que ocurra un error
            } else {
                console.log('Error retrieving credentials' + err)
                alert('Error retrieving credentials' + err)
            }
        })
    }
})

//callback para cuando se realice la conexion
window.mqttClientConnectHandler = function(){
    console.log('connect')
    document.getElementById('connecting-div').style.visibility = 'hidden'
    document.getElementById('connected-div').style.visibility = 'visible'
    document.getElementById('connected-div').innerHTML = '<p>Connected to AWS IoT platform</p>'
    mqttClient.subscribe(currentTopic)
}

//callback para cuando se realice un reconexion
window.mqttClientReconnectHandler = function(){
    console.log('reconnecting')
    document,getElementById('connecting-div').style.visibility = 'visible'
    document.getElementById('connected-div').style.visibility = 'hidden'
    document.getElementById('send-button').style.visibility='hidden'
}

//calback para manejar las mensajes
window.MessageHandler = function(topic,payload){
    const chatDiv = document.getElementById('chat')
    const message = JSON.parse(payload.toString()).message
    messageHistory += `<p>${message}<p>`
    chatDiv.innerHTML =  messageHistory
}

mqttClient.on('connect',window.mqttClientConnectHandler)
mqttClient.on('reconnect',window.mqttClientReconnectHandler)
mqttClient.on('message',MessageHandler)

//El evento que mandará en mensaje
form.addEventListener('submit', function(evt){
    evt.preventDefault()
    const message = messageBox.value
    mqttClient.publish(currentTopic,JSON.stringify({message:message}))
})
                