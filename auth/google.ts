import * as oauth from "oauth4webapi";
import { OIDC } from "./oidc.ts";
import type { AuthClient } from "./auth";

type GoogleOptions = {
	clientID: string;
	clientSecret: string
	// https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps
	scope: string;
	redirectURI?: string;
	accessType?: "offline" | "online"
};
// https://developers.google.com/identity/protocols/oauth2/web-server
const issuer = new URL("https://accounts.google.com");
const authzServer = await oauth.discoveryRequest(issuer, { algorithm: "oidc" })
	.then((response) => oauth.processDiscoveryResponse(issuer, response))

export function Google(options: GoogleOptions): AuthClient {

	const params: Record<string, string> = {};

	if (options.accessType) {
		params.access_type = options.accessType;
	}

	return OIDC({
		authorizationServer: authzServer,
		redirectURI: options.redirectURI,
		clientSecret: options.clientSecret,
		clientID: options.clientID,
		scope: options.scope,
		params
	})
}
