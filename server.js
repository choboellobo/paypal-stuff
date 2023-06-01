import express from 'express';
import paypal from '@paypal/checkout-server-sdk';
const clientId = "AcbFzkkCmAGdpmx2UAEQ5P5LmP84GEKxNtPVdN8Af8kRWTf_25hD29BxYOZn-x4uDpnfRG1A1PJBHpBl"
const clientSecret = "EGfz4GGXBFnx-Yn75k6E7Bgr1OfjoimlHjh2GNMBMhUkFIG9qxpDizd-sAaWHeeN9qZ3AF-KBzH1IZA1"

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
    console.log(req.body);
    res.sendStatus(200);
})

app.get('/create', async (req, res) => {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        "intent": "AUTHORIZE",
        "purchase_units": [
            {
                custom_id: "mi-id-custom",
                soft_descriptor: "mi-descriptor",
                custom_id: 'mi-id-custom',
                description: 'Recarga de 20 € en la cuenta de usuario',
                "amount": {
                    "currency_code": "EUR",
                    "value": "20"
                }
            }
         ]
    });
    try {
        console.log(request)
        const response = await client.execute(request);
        res.json(response);
    } catch (error) {
        res.status(500).json(error);
    }
})

app.get('/:id', async (req, res) => {
    const orderId = req.params.id;
    const request = new paypal.orders.OrdersGetRequest(orderId);
    console.log(request)

    try {
        const response = await client.execute(request);
        res.json(response);
    } catch (error) {
        res.status(500).json(error);
    }
})

app.get('/authorize/:id', async (req, res) => {
    const orderId = req.params.id;
    const request = new paypal.orders.OrdersAuthorizeRequest(orderId);
    request.requestBody({});
    console.log(request)    
    try {
        const response = await client.execute(request);
        res.json(response);
    } catch (error) {
        res.status(500).json(error);
    }
})

app.get('/capture/:id', async (req, res) => {
    const authorizationId = req.params.id;
    console.log(authorizationId)
    const request = new paypal.payments.AuthorizationsCaptureRequest(authorizationId);
    request.requestBody({
        amount: {
        currency_code: 'EUR',
        value: '5.00'
        }
    });
    console.log(request)
    try {
        const response = await client.execute(request);
        res.json(response);
    } catch (error) {
        res.status(500).json(error);
    }   
})



app.listen(3000);