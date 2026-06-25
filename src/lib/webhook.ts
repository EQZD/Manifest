export const WEBHOOK_URL_PLACEHOLDER = "https://YOUR_N8N_HOST/webhook/launch-campaign";

export interface DispatchPayload {
  campaignName: string;
  subject: string;
  htmlTemplate: string;
  scheduledAt: string;
  contacts: Array<{ email: string; name: string; company: string }>;
  senderEmail: string;
}

export interface DispatchResult {
  ok: boolean;
  statusCode?: number;
  message: string;
}

export async function sendCampaignToWebhook(
  webhookUrl: string,
  payload: DispatchPayload,
): Promise<DispatchResult> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignName: payload.campaignName,
        subject: payload.subject,
        htmlTemplate: payload.htmlTemplate,
        scheduledDate: payload.scheduledAt,
        contacts: payload.contacts,
        senderEmail: payload.senderEmail,
      }),
    });

    if (!response.ok) {
      return {
        ok: false,
        statusCode: response.status,
        message: `n8n ответил с ошибкой ${response.status}.`,
      };
    }

    return { ok: true, statusCode: response.status, message: "Рассылка передана в n8n." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error
        ? `Не удалось связаться с webhook: ${error.message}`
        : "Не удалось связаться с webhook.",
    };
  }
}