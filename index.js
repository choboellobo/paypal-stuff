import PayPal from 'paypal-rest-sdk';
import express from 'express';

const app = express();

PayPal.configure({
    mode: 'sandbox', // Sandbox or live
    client_id: 'AcbFzkkCmAGdpmx2UAEQ5P5LmP84GEKxNtPVdN8Af8kRWTf_25hD29BxYOZn-x4uDpnfRG1A1PJBHpBl',
    client_secret: 'EGfz4GGXBFnx-Yn75k6E7Bgr1OfjoimlHjh2GNMBMhUkFIG9qxpDizd-sAaWHeeN9qZ3AF-KBzH1IZA1'
});


app.get('/create', (req, res) => {
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://return.url",
            "cancel_url": "http://cancel.url"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "item",
                    "sku": "xxx",
                    "price": "5.00",
                    "currency": "EUR",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "EUR",
                "total": "5.00"
            },
            "description": "Recarga de 5 € en la cuenta de usuario"
        }]
    };
    PayPal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            res.status(500).json(error);
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            res.json(payment);
        }
    });
})

app.get('/execute/:paymentId/:payerId', (req, res) => {
    var paymentId = req.params.paymentId;
    var payerId = req.params.payerId;
    var execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "EUR",
                "total": "5.00"
            }
        }]
    };
    PayPal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            res.status(500).json(error);
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.json(payment);
        }
    });
})
app.get('/details/:id', (req, res) => {
    var paymentId = req.params.id;
    PayPal.payment.get(paymentId, function (error, payment) {
        if (error) {
            res.status(500).json(error);
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.json(payment);
        }
    });
})


app.listen(3000, () => console.log('Server Started'))