import axios from 'axios';
import express from 'express';


// Configura las credenciales y la URL base de la API de PayPal
const clientId = "AcbFzkkCmAGdpmx2UAEQ5P5LmP84GEKxNtPVdN8Af8kRWTf_25hD29BxYOZn-x4uDpnfRG1A1PJBHpBl"
const clientSecret = "EGfz4GGXBFnx-Yn75k6E7Bgr1OfjoimlHjh2GNMBMhUkFIG9qxpDizd-sAaWHeeN9qZ3AF-KBzH1IZA1"
const baseUrl = 'https://api.sandbox.paypal.com';

const app = express();

const getAccessToken = async () => {
    return new Promise(async (resolve, reject) => {
        const url = `${baseUrl}/v1/oauth2/token`;
        const headers = {
            'Accept': 'application/json',
            'Accept-Language': 'es_ES',
            'content-type': 'application/x-www-form-urlencoded'
        };
        const data = {
            grant_type: 'client_credentials'
        };

        try {
            const response = await axios.post(url, data, {
                auth: {
                username: clientId,
                password: clientSecret
                },
                headers: headers
            });
            resolve(response.data.access_token);
        } catch (error) {
            reject(error);
        }
    });
}

app.get('/test', async (req, res) => {
    const url = `${baseUrl}/v3/vault/payment-tokens?customer_id=${req.query.customer_id}`;
    const accessToken = await getAccessToken();
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    };
    try {
        const response = await axios.get(url, { params: req.query,  headers: headers });
        res.json(response.data);
    }catch (error) {     
        res.status(500).json(error);
    }
});

export const createSetupToken = () => {
    return new Promise(async (resolve, reject) => {

    const url = `${baseUrl}/v3/vault/setup-tokens`;
    const accessToken = await getAccessToken();
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    };
    const payload = {
        payment_source: {
            paypal: {
                description: 'Mi paypal preferido',
                "usage_type": "MERCHANT",
                "customer_type": "CONSUMER",
                "experience_context": {
                    "shipping_preference": "SET_PROVIDED_ADDRESS",
                    "payment_method_preference":  "IMMEDIATE_PAYMENT_REQUIRED",
                    "brand_name": "SmartParking",
                    "locale": "es-ES",
                    "return_url": "https://example.com/returnUrl",
                    "cancel_url": "https://example.com/cancelUrl"
                }
            }
        }
    };
    try {
        const response = await axios.post(url, payload, { headers: headers });
       resolve(response.data);
    }catch (error) {
        reject(error);
    }

    });
}
export const setupToken = (token) => {
    return new Promise(async (resolve, reject) => {
        const url = `${baseUrl}/v3/vault/setup-tokens/${token}`;
        const accessToken = await getAccessToken();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        };
        try {
            const response = await axios.get(url, { headers: headers });
            resolve(response.data);
        }catch (error) {
            reject(error);
        }
    });
}

export const createPaymentToken = (token) => {
    return new Promise(async (resolve, reject) => {
        const url = `${baseUrl}/v3/vault/payment-tokens`;
        const accessToken = await getAccessToken();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        };
        const payload = {
            "payment_source": {
                "token": {
                    "id": token,
                    "type": "SETUP_TOKEN"
                }
            }
        };
        try {
            const response = await axios.post(url, payload, { headers: headers });
            resolve(response.data);
        }catch (error) {
            reject(error);
        }
    });
};

export const paymentToken = (token) => {
    return new Promise(async (resolve, reject) => {
        const url = `${baseUrl}/v3/vault/payment-tokens/${token}`;
        const accessToken = await getAccessToken();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        };
        try {
            const response = await axios.get(url, { headers: headers });
            resolve(response.data);
        }catch (error) {
            reject(error);
        }
    });
};
