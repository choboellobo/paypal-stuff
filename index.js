
import express from 'express';
import bodyParser from 'body-parser';
import paypal from '@paypal/checkout-server-sdk';
import { createSetupToken, createPaymentToken, setupToken, paymentToken } from './customer.js'
const app = express();
app.use(bodyParser.json());

const clientId = "AcbFzkkCmAGdpmx2UAEQ5P5LmP84GEKxNtPVdN8Af8kRWTf_25hD29BxYOZn-x4uDpnfRG1A1PJBHpBl"
const clientSecret = "EGfz4GGXBFnx-Yn75k6E7Bgr1OfjoimlHjh2GNMBMhUkFIG9qxpDizd-sAaWHeeN9qZ3AF-KBzH1IZA1"

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);


// CUSTOMER
app.get('/customer/create-setup-token', async (req, res) => {
    try {
        const response = await createToken();
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
    try {
        const response = await createPaymentToken(req.params.setupToken);
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


app.listen(3000, () => {
    console.log('Server listening on port 3000');
});