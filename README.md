# serverlessChat

serverless Chat using AWS IoT endpoint

 1.npm install aws-iot-device-sdk

2.En el folder 
 
 Path/To/Project/node_modules/aws-iot-device-sdk
        
        npm run-script browserize
 
 3.El script index js puede estar en donde sea. En este script programas toda la aplicacion
     una vez que tienes todo el código creas el  bundle.js que será el script en el navegador
     
     En  Path/To/Project/node_modules/aws-iot-device-sdk
        
        npm run-script browserize Path/to/index.js
 
 4. El script anterior crea los archivo aws-iot-sdk-browser-bundle.js y bundle.js
        en el directorio de index.js ya solo que agregar el código en el index.html
        
        <script src="aws-iot-sdk-browser-bundle.js"></script>
        <script src="bundle.js"></script>
