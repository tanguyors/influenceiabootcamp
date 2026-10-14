import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { exchangeCode, saveSession, decodeIdTokenClaims } from "../../shared/higgsfield.ts";

const FALLBACK_ORIGIN = "https://terrestrial-vibe-clone-studio.base44.app";

function page(origin, query) {
  return new Response(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${origin}/connexion?${query}"></head><body></body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

// Retour du navigateur depuis Higgsfield : endpoint public, la valeur "state"
// est le contrôle de sécurité (elle est comparée à la demande enregistrée).
export default async function(req) {
  const url = new URL(req.url);
  const origin = req.headers.get("X-Base44-App-Url") || FALLBACK_ORIGIN;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const authError = url.searchParams.get("error");

  if (authError) {
    return page(origin, `higgsfield_error=${encodeURIComponent(url.searchParams.get("error_description") || authError)}`);
  }
  if (!code || !state) {
    return page(origin, "higgsfield_error=Reponse_incomplete");
  }

  try {
    const base44 = createClientFromRequest(req);
    const pendingPage = await base44.asServiceRole.entities.HiggsfieldOAuth.filter({ state }, { limit: 1 });
    const pending = (pendingPage.items || [])[0];
    if (!pending) {
      return page(origin, "higgsfield_error=Autorisation_introuvable_ou_expiree");
    }

    const tokens = await exchangeCode({
      clientId: pending.client_id,
      code,
      verifier: pending.code_verifier,
      redirectUri: pending.redirect_uri,
    });

    const claims = decodeIdTokenClaims(tokens.id_token);
    await saveSession(base44, {
      tokens,
      clientId: pending.client_id,
      account: (claims && (claims.email || claims.preferred_username)) || "",
    });
    await base44.asServiceRole.entities.HiggsfieldOAuth.delete(pending.id);

    return page(origin, "higgsfield=connected");
  } catch (error) {
    return page(origin, `higgsfield_error=${encodeURIComponent(error.message)}`);
  }
}