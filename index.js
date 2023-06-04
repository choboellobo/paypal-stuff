
import express from 'express';
import bodyParser from 'body-parser';
import paypal from '@paypal/checkout-server-sdk';
import { createSetupToken, createPaymentToken, setupToken, paymentToken, listPaymentTokens } from './customer.js'
const app = express();
app.use(bodyParser.json());

const clientId = "AcbFzkkCmAGdpmx2UAEQ5P5LmP84GEKxNtPVdN8Af8kRWTf_25hD29BxYOZn-x4uDpnfRG1A1PJBHpBl"
const clientSecret = "EGfz4GGXBFnx-Yn75k6E7Bgr1OfjoimlHjh2GNMBMhUkFIG9qxpDizd-sAaWHeeN9qZ3AF-KBzH1IZA1"

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);


// CUSTOMER
app.get('/customer/create-setup-token/:customer', async (req, res) => {
    const customer = req.params.customer;
    try {
        const response = await createSetupToken(customer);
        res.json(response);
    }catch (error) {
        res.status(500).json(error);
    }
});
app.get('/customer/setup-token/:setupToken', async (req, res) => {
    try {
        const response = await setupToken(req.params.setupToken);
        res.json(response);
    }catch (error) {
        res.status(500).json(error);
    }
});
app.get('/customer/create-payment-token/:setupToken', async (req, res) => {

    const setupTokenData = await setupToken(req.params.setupToken);
    try {
        const response = await createPaymentToken(req.params.setupToken, setupTokenData.customer.id);
        res.json(response);
    }catch (error) {
        res.status(500).json(error);
    }
});
app.get('/customer/payment-token/:paymentToken', async (req, res) => {
    try {
        const response = await paymentToken(req.params.paymentToken);
        res.json(response);
    }catch (error) {
        res.status(500).json(error);
    }
});
app.get('/customer/list-payment-tokens/:customer', async (req, res) => {
    try {
        const response = await listPaymentTokens(req.params.customer);
        res.json(response);
    }catch (error) {
        res.status(500).json(error);
    }
});

// ORDER
app.get('/order/create', async (req, res) => {
    const order = {
        intent: 'CAPTURE',
        purchase_units: [{
            custom_id: 'custom_id',
            description: 'description',
            items: [{
                name: 'Aparmiento',
                quantity: '1',
                tax: {
                    currency_code: 'EUR',
                    value: '1.00',
                },
                unit_amount: {
                    currency_code: 'EUR',
                    value: '9.00',
                }
            }],
            amount: {
                currency_code: 'EUR',
                value: '10.00',
                breakdown: {
                    tax_total: {
                        currency_code: 'EUR',
                        value: '1.00',
                    },
                    item_total: {
                        currency_code: 'EUR',
                        value: '9.00',
                    }
                }
            }
        }],
        application_context: {
            brand_name: 'Smart Parking',
            locale: 'es-ES',
            landing_page: 'NO_PREFERENCE',
            shipping_preference: 'NO_SHIPPING',
            return_url: 'http://return.ok',
            cancel_url: 'http://return.cancel',
        }
    }
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody(order);
    request.headers['PayPal-Request-Id'] = Date.now().toString();
    try {
        const response = await client.execute(request);
        res.json(response.result);
    }catch (error) {
        res.status(500).json(error);
    }
});
app.get('/order/:orderId', async (req, res) => {
    const orderId = req.params.orderId;
    const request = new paypal.orders.OrdersGetRequest(orderId);

    try {
        const response = await client.execute(request);
        res.json(response.result);
    }catch (error) {
        res.status(500).json(error);
    }
});
app.get('/order/:orderId/capture', async (req, res) => {
    const orderId = req.params.orderId;
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    try {
        const response = await client.execute(request);
        res.json(response.result);
    }catch (error) {
        res.status(500).json(error);
    }
});

// Authorization
app.get('/auth/create', async (req, res) => {
    
    const order = {
        intent: 'AUTHORIZE',
        purchase_units: [{
            reference_id: 'contract_id',
            custom_id: 'custom_id',
            description: 'description',
            items: [{
                name: 'Aparmiento',
                quantity: '1',
                unit_amount: {
                    currency_code: 'EUR',
                    value: '20.00',
                }
            }],
            amount: {
                currency_code: 'EUR',
                value: '20.00',
                breakdown: {
                    item_total: {
                        currency_code: 'EUR',
                        value: '20.00',
                    }
                }
            }
        }],
        application_context: {
            brand_name: 'Smart Parking',
            locale: 'es-ES',
            landing_page: 'NO_PREFERENCE',
            shipping_preference: 'NO_SHIPPING',
            return_url: 'http://return.ok',
            cancel_url: 'http://return.cancel',
        }
    }
    if( req.query.paymentMethod) {
        order['payment_source'] = {
            paypal: {
                vault_id: req.query.paymentMethod
            }
        }
    }
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody(order);
    request.headers['PayPal-Request-Id'] = Date.now().toString();
    try {
        const response = await client.execute(request);
        res.json(response.result);
    }catch (error) {
        res.status(500).json(error);
    }

})
app.get('/order/:id/auth', async (req, res) => {
    const orderId = req.params.id;
    const request = new paypal.orders.OrdersAuthorizeRequest(orderId);
    try {
        const response = await client.execute(request);
        res.json(response.result);
    }catch (error) {
        res.status(500).json(error);
    }

})
app.get('/auth/:id', async (req, res) => {
    const authId = req.params.id;
    const request = new paypal.payments.AuthorizationsGetRequest(authId)
    try {
        const response = await client.execute(request);
        res.json(response.result);
    }catch (error) {
        res.status(500).json(error);
    }
})
app.get('/auth/:id/capture', async (req, res) => {
    const authId = req.params.id;
    const body = { 
        "amount": { 
            "value": "3.65", 
            "currency_code": "EUR" 
        }, 
        "final_capture": true,
    }

    const request = new paypal.payments.AuthorizationsCaptureRequest(authId);
    request.requestBody(body)
    try {
        const response = await client.execute(request);
        res.json(response.result);
    }catch (error) {
        res.status(500).json(error);
    }

})
app.get('/capture/:id', async (req, res) => {
    const captureId = req.params.id;
    const request = new paypal.payments.CapturesGetRequest(captureId);
    try {
        const response = await client.execute(request);
        res.json(response.result);
    }catch (error) {
        res.status(500).json(error);
    }
})
app.get('/capture/:id/refund', async (req, res) => {
    const captureId = req.params.id;
    const body = { 
        "amount": { 
            "value": "4.65", 
            "currency_code": "EUR" 
        },
    }
    const request = new paypal.payments.CapturesRefundRequest(captureId);
    request.requestBody(body);
    try {
        const response = await client.execute(request);
        res.json(response.result);
    }catch (error) {
        res.status(500).json(error);
    }
    
})


app.post("/webhook", (req, res) => {
    console.log(JSON.stringify(req.body));
    res.status(204).end();
})


app.listen(3000, () => {
    console.log('Server listening on port 3000');
});