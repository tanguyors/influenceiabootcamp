import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getAccessToken, listTools, callTool, getMcpUrl } from "../../shared/higgsfield.ts";

// Solde de crédits Higgsfield : 0 crédit = aucune génération possible.
async function readBalance(token) {
  try {
    const res = await callTool(token, "balance", {});
    const sc = (res && res.structuredContent) || {};
    return { credits: Number(sc.credits) || 0, plan: sc.subscription_plan_type || "" };
  } catch {
    return null;
  }
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });

    const token = await getAccessToken(base44, user.id);
    if (!token) {
      return Response.json({
        connected: false,
        mcp_url: getMcpUrl(),
        tools: [],
        message: "Compte Higgsfield non connecté. Utilisez le bouton « Connecter mon compte Higgsfield » sur cette page.",
      });
    }

    try {
      const [tools, balance] = await Promise.all([listTools(token), readBalance(token)]);
      return Response.json({
        connected: true,
        mcp_url: getMcpUrl(),
        tools,
        balance,
        message: `${tools.length} outil(s) disponible(s) sur votre compte.`,
      });
    } catch (e) {
      return Response.json({
        connected: false,
        mcp_url: getMcpUrl(),
        tools: [],
        message: `Connexion au serveur MCP impossible : ${e.message}`,
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}