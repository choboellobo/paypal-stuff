import fetch from 'node-fetch';
export class PayPalAccessTokenManager {
  constructor(clientId, secret) {
    this.clientId = clientId;
    this.secret = secret;
    this.token = null;
    this.expiresAt = null;
  }

  async getAccessToken() {

    if (this.token && this.expiresAt && Date.now() < this.expiresAt) {
      return this.token;
    }

    const response = await fetch('https://api.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.secret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve PayPal access token');
    }

    const data = await response.json();
    this.token = data.access_token;
    this.expiresAt = Date.now() + data.expires_in * 1000; // Convert expires_in to milliseconds

    return this.token;
  }
}