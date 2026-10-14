import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import {
  getCredentials,
  checkCredentials,
  getRequestStatus,
  mapRequestState,
  MOTION_TRANSFER_ENDPOINT,
  ENGINE_LABEL,
} from "../../shared/higgsfield.ts";

const API_BASE = "https://api.higgsfield.ai";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || "status";
    const { configured, keyId } = getCredentials();

    // Rafraîchit une création en cours depuis l'API Higgsfield.
    if (action === "sync_creation") {
      if (!body.creation_id) return Response.json({ error: "creation_id requis" }, { status: 400 });
      if (!configured) return Response.json({ error: "Identifiants Higgsfield non configurés." }, { status: 400 });

      const page = await base44.entities.Creation.filter({ id: body.creation_id }, { limit: 1 });
      const creation = (page.items || [])[0];
      if (!creation) return Response.json({ error: "Création introuvable" }, { status: 404 });
      if (!creation.higgsfield_job_id) return Response.json({ status: creation.status });

      const request = await getRequestStatus(creation.higgsfield_job_id);
      const mapped = mapRequestState(request);
      if (mapped.status !== creation.status || (mapped.videoUrl && mapped.videoUrl !== creation.result_video_url)) {
        await base44.entities.Creation.update(creation.id, {
          status: mapped.status,
          result_video_url: mapped.videoUrl || creation.result_video_url || "",
          error: mapped.error || "",
        });
      }
      return Response.json({ status: mapped.status, video_url: mapped.videoUrl });
    }

    if (!configured) {
      return Response.json({
        connected: false,
        api_base: API_BASE,
        engine: ENGINE_LABEL,
        endpoint: MOTION_TRANSFER_ENDPOINT,
        message: "Identifiants Higgsfield non configurés. Ajoutez HIGGSFIELD_API_KEY_ID et HIGGSFIELD_API_KEY_SECRET dans la page Secrets de l'application (tableau de bord).",
      });
    }

    const check = await checkCredentials();
    return Response.json({
      connected: check.ok,
      api_base: API_BASE,
      engine: ENGINE_LABEL,
      endpoint: MOTION_TRANSFER_ENDPOINT,
      key_id: keyId,
      message: check.ok
        ? `${check.message} Clé utilisée : ${keyId}.`
        : `${check.message} Clé utilisée : ${keyId}.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}