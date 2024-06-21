import * as oauth from "oauth4webapi";
import { OAuth, type OAuthClient } from "./oauth.js";

type GoogleOptions = {
  clientID: string;
  clientSecret: string;
  scope: string;
  redirectURI?: string;
};

const issuer = new URL("https://accounts.google.com");
const authzServer = await oauth
  .discoveryRequest(issuer, { algorithm: "oidc" })
  .then((response) => oauth.processDiscoveryResponse(issuer, response));

export function Google(options: GoogleOptions): OAuthClient {
  return OAuth({
    authorizationServer: authzServer,
    redirectURI: options.redirectURI,
    clientSecret: options.clientSecret,
    clientID: options.clientID,
    scope: options.scope,
  });
}
