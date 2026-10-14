import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getAccessToken, listTools, getMcpUrl } from "../../shared/higgsfield.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });

    const token = await getAccessToken(base44);
    if (!token) {
      return Response.json({
        connected: false,
        mcp_url: getMcpUrl(),
        tools: [],
        message: "Compte Higgsfield non connecté. Utilisez le bouton « Connecter mon compte Higgsfield » sur cette page.",
      });
    }

    try {
      const tools = await listTools(token);
      return Response.json({
        connected: true,
        mcp_url: getMcpUrl(),
        tools,
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