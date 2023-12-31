'use strict';

const Homey = require('homey');
const querystring = require('querystring');
const { URLSearchParams } = require('url');
const { fetch, OAuth2Client, OAuth2Token } = require('homey-oauth2app');

class ToonOAuth2Client extends OAuth2Client {

  async onInit(){
    this.toonTenantId = "eneco";
    this.toonClientId = Homey.env.TOON_KEY;
    this.webhookCallback = `https://webhooks.athom.com/webhook/${Homey.env.WEBHOOK_ID}/`;
    this.oAuthRedirectUrl = 'https://callback.athom.com/oauth2/callback';
    this.issuer = 'identity.toon.eu';
  }

  /**
   * Method that exchanges a code for a token with the ToonAPI. Important is that the
   * redirect_uri property contains an
   * uri that ends with a slash, otherwise the request will fail with 401 for unknown reasons.
   * @param code
   * @returns {Promise<*>}
   */
  async onGetTokenByCode({ code }) {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', this._clientId);
    params.append('client_secret', this._clientSecret);
    params.append('redirect_uri', this.oAuthRedirectUrl); // the trailing slash does not work anymore and returns a code 500!
    params.append('code', code);
    params.append('tenant_id', this.toonTenantId);

    // Exchange code for token
    const res = await fetch(this._tokenUrl, {
      method: 'POST',
      body: params,
      headers: {
        issuer: this.issuer,
      },
    });
    const body = await res.json();
    return new OAuth2Token(body);
  }

  /**
   * Method that handles the creation of the authorization url. The ToonAPI expects a tenant_id
   * property to be added as query parameter.
   * @param scopes
   * @param state
   * @returns {string}
   */
  onHandleAuthorizationURL({ scopes, state } = {}) {
    const query = {
      state,
      tenant_id: this.toonTenantId,
      client_id: this._clientId,
      issuer: this.issuer, // feature flag for new authentication flow
      response_type: 'code',
      scope: this.onHandleAuthorizationURLScopes({ scopes }),
      redirect_uri: this._redirectUrl,
    };

    return `${this._authorizationUrl}?${querystring.stringify(query)}`;
  }

  /**
   * Get all agreements (registered Toon devices) for this user account.
   * @returns {Promise<*>}
   */
  async getAgreements() {
    this.log('getAgreements()');
    return this.get({
      path: 'agreements',
    });
  }

  /**
   * Method that checks if a webhook subscription is already registered, if not it will register
   * a new subscription with the ToonAPI.
   * @param {string} id - agreementId
   * @returns {Promise<*>}
   */
  async registerWebhookSubscription({ id }) {
    this.log('registerWebhookSubscription()');

    // Unregister webhook before registering new, prevents piling up subscriptions
    try {
      await this.delete({ path: `${id}/webhooks/${this.toonClientId}` });
      this.log('registerWebhookSubscription() -> webhook subscription was cancelled');
    } catch (err) {
      this.error('failed to unregister webhook before starting new subscription', err);
    }

    // Start new subscription
    return this.post({
      path: `${id}/webhooks`,
      json: {
        applicationId: this.toonClientId,
        callbackUrl: this.webhookCallback,
        subscribedActions: ['Thermostat', 'PowerUsage'],
      },
    });
  }

  /**
   * Method that checks if a webhook subscription is registered, in that case it will request to
   * end the subscription with the ToonAPI.
   * @param {string} id - agreementId
   * @returns {Promise<*>}
   */
  async unregisterWebhookSubscription({ id }) {
    this.log('unregisterWebhookSubscription()');
    return this.delete({
      path: `${id}/webhooks/${this.toonClientId}`,
    });
  }

  /**
   * Method that returns the currently registered webhook subscriptions.
   * @param {string} id - agreementId
   * @returns {Promise<*>}
   */
  async getRegisteredWebhookSubscriptions({ id }) {
    this.log('getRegisteredWebhookSubscriptions()');
    return this.get({
      path: `${id}/webhooks`,
    });
  }

  /**
   * Method that fetches a status object from the ToonAPI containing all necessary
   * device/capability information.
   * @param {string} id - agreementId
   * @returns {Promise<*>}
   */
  async getStatus({ id }) {
    return this.get({ path: `${id}/status` });
  }

  /**
   * Method that updates the thermostat state with the ToonAPI. Used for changing target
   * temperature and temperature states.
   * @param {string} id - agreementId
   * @param {object} data - new state object
   * @returns {Promise<*>}
   */
  async updateState({ id, data }) {
    return this.put({ path: `${id}/thermostat`, json: data });
  }

}

module.exports = ToonOAuth2Client;
