Welcome to unofficial whatsapp api 
How to use this app : 

**Install to your local machine**

make sure you already install node js 16 or newer

    git clone https://github.com/iniyusril/whatsapp_api_terminal_only.git
    cd whatsapp_api_terminal_only
    npm i 
    node app.js API_KEY=YourApiKey
then scan your qr code using whatsapp mobile phone 

> if you want to change api key just set environtment variable on API_KEY

**Api Docs**

 1. Send Message
`curl --location --request POST 'localhost:8000/api/v1/send-message' \
--header 'X-API-KEY: YourApiKey' \
--header 'Content-Type: application/json' \
--data-raw '{
    "number":"6282248090904",
    "message":"Message data"
}'`


