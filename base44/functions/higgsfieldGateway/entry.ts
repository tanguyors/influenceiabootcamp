import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { isConfigured, getConfig, listTools, callTool } from "../../shared/higgsfield.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const { url } = getConfig();

    if (!isConfigured()) {
      return Response.json({
        connected: false,
        server_url: url,
        message: "Clé API Higgsfield non configurée. Ajoutez HIGGSFIELD_API_KEY dans la page Secrets de l'application (tableau de bord).",
        tools: [],
      });
    }

    if (action === "call_tool") {
      if (!body.name) return Response.json({ error: "name requis" }, { status: 400 });
      const result = await callTool(body.name, body.arguments || {});
      return Response.json({ result });
    }

    // default + "list_tools" + "status": discover tools
    try {
      const tools = await listTools();
      return Response.json({ connected: true, server_url: url, tools, message: `${tools.length} outil(s) découvert(s)` });
    } catch (e) {
      return Response.json({
        connected: false, server_url: url, tools: [],
        message: `Connexion impossible : ${e.message}. Vérifiez la clé API et l'URL du serveur MCP.`,
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}