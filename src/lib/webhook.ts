export const WEBHOOK_URL_PLACEHOLDER = "https://YOUR_N8N_HOST/webhook/launch-campaign";

export interface DispatchPayload {
  campaignName: string;
  subject: string;
  htmlTemplate: string;
  scheduledAt: string;
  excelFile: File;
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
  const formData = new FormData();
  formData.append("campaignName", payload.campaignName);
  formData.append("subject", payload.subject);
  formData.append("htmlTemplate", payload.htmlTemplate);
  formData.append("scheduledDate", payload.scheduledAt);
  formData.append("excelFile", payload.excelFile, payload.excelFile.name);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return {
        ok: false,
        statusCode: response.status,
        message: `n8n ответил с ошибкой ${response.status}. Проверьте webhook и попробуйте снова.`,
      };
    }

    return {
      ok: true,
      statusCode: response.status,
      message: "Рассылка передана в n8n.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? `Не удалось связаться с webhook: ${error.message}`
          : "Не удалось связаться с webhook.",
    };
  }
}
