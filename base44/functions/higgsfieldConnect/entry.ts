import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import {
  registerClient,
  buildAuthorizeUrl,
  createPkce,
  createState,
  getAuthRecord,
  clearSession,
  getMcpUrl,
} from "../../shared/higgsfield.ts";

const FALLBACK_ORIGIN = "https://terrestrial-vibe-clone-studio.base44.app";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || "status";
    const auth = await getAuthRecord(base44, user.id);
    const connected = Boolean(auth && auth.access_token);

    if (action === "status") {
      return Response.json({
        connected,
        account: connected ? auth.account || "" : "",
        mcp_url: getMcpUrl(),
      });
    }

    if (action === "disconnect") {
      await clearSession(base44, user.id);
      return Response.json({ connected: false });
    }

    // Action "start" : prépare l'autorisation et renvoie l'URL Higgsfield.
    const origin = req.headers.get("X-Base44-App-Url") || FALLBACK_ORIGIN;
    const redirectUri = `${origin.replace(/\/$/, "")}/functions/higgsfieldOAuthCallback`;

    const clientId = auth && auth.client_id ? auth.client_id : await registerClient(redirectUri);
    const { verifier, challenge } = await createPkce();
    const state = createState();

    await base44.asServiceRole.entities.HiggsfieldOAuth.create({
      user_id: user.id,
      state,
      code_verifier: verifier,
      client_id: clientId,
      redirect_uri: redirectUri,
    });

    return Response.json({
      authorize_url: buildAuthorizeUrl({ clientId, redirectUri, challenge, state }),
      redirect_uri: redirectUri,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}