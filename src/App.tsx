import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ManifestRail } from "./components/ManifestRail";
import { SectionFrame } from "./components/SectionFrame";
import { HtmlCodeField } from "./components/HtmlCodeField";
import { ContactsUploader } from "./components/ContactsUploader";
import { VariableChecklist } from "./components/VariableChecklist";
import { EmailPreview } from "./components/EmailPreview";
import { DispatchSummary } from "./components/DispatchSummary";
import { parseContactsFile, extractTemplateVariables } from "./lib/contacts";
import { sendCampaignToWebhook, WEBHOOK_URL_PLACEHOLDER } from "./lib/webhook";
import type { ContactsParseResult, DispatchStatus } from "./types/campaign";

interface FormValues {
  campaignName: string;
  subject: string;
  htmlTemplate: string;
  scheduledDate: string;
  scheduledTime: string;
  webhookUrl: string;
}

const SECTIONS = [
  { index: "01", label: "Основная информация" },
  { index: "02", label: "Шаблон письма" },
  { index: "03", label: "Контакты" },
  { index: "04", label: "Планирование" },
  { index: "05", label: "Webhook n8n" },
];

export default function App() {
  const {
    register,
    control,
    watch,
    formState: { errors, touchedFields },
    trigger,
  } = useForm<FormValues>({
    mode: "onBlur",
    defaultValues: {
      campaignName: "",
      subject: "",
      htmlTemplate: "",
      scheduledDate: "",
      scheduledTime: "",
      webhookUrl: "",
    },
  });

  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ContactsParseResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [contactsTouched, setContactsTouched] = useState(false);
  const [status, setStatus] = useState<DispatchStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const campaignName = watch("campaignName");
  const subject = watch("subject");
  const htmlTemplate = watch("htmlTemplate");
  const scheduledDate = watch("scheduledDate");
  const scheduledTime = watch("scheduledTime");
  const webhookUrl = watch("webhookUrl");

  const templateVariables = useMemo(() => extractTemplateVariables(htmlTemplate), [htmlTemplate]);

  const availableColumns = useMemo(() => {
    if (!parseResult || parseResult.contacts.length === 0) return [];
    return Object.keys(parseResult.contacts[0]);
  }, [parseResult]);

  async function handleFileSelected(file: File) {
    setExcelFile(file);
    setContactsTouched(true);
    setIsParsing(true);
    try {
      const result = await parseContactsFile(file);
      setParseResult(result);
    } catch {
      setParseResult({
        contacts: [],
        missingFields: ["email", "name", "company"],
        rowErrors: [{ row: 0, reason: "не удалось прочитать файл" }],
        totalRows: 0,
      });
    } finally {
      setIsParsing(false);
    }
  }

  function handleClearFile() {
    setExcelFile(null);
    setParseResult(null);
  }

  const contactsReady =
    !!parseResult && parseResult.missingFields.length === 0 && parseResult.contacts.length > 0;

  const scheduledAt =
    scheduledDate && scheduledTime ? `${scheduledDate}T${scheduledTime}` : scheduledDate || "";

  const summaryRows = [
    { label: "Название", value: campaignName || "—", ok: !!campaignName.trim() },
    { label: "Тема письма", value: subject || "—", ok: !!subject.trim() },
    {
      label: "Шаблон",
      value: htmlTemplate.trim() ? `${htmlTemplate.trim().length} симв.` : "—",
      ok: !!htmlTemplate.trim(),
    },
    {
      label: "Контакты",
      value: parseResult ? `${parseResult.contacts.length} адресов` : "—",
      ok: contactsReady,
    },
    {
      label: "Запуск",
      value: scheduledAt ? new Date(scheduledAt).toLocaleString("ru-RU") : "—",
      ok: !!scheduledDate,
    },
    {
      label: "Webhook",
      value: webhookUrl || WEBHOOK_URL_PLACEHOLDER,
      ok: !!webhookUrl.trim(),
    },
  ];

  const allReady = summaryRows.every((row) => row.ok);

  const [activeSection, setActiveSection] = useState("01");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("section-", "");
            setActiveSection(id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    SECTIONS.forEach((section) => {
      const el = document.getElementById(`section-${section.index}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  async function handleLaunch() {
    if (!excelFile) return;
    setStatus("validating");
    setStatusMessage(null);

    const valid = await trigger();
    if (!valid || !contactsReady) {
      setStatus("error");
      setStatusMessage("Проверьте поля манифеста — есть незаполненные или некорректные значения.");
      return;
    }

    setStatus("sending");
    const result = await sendCampaignToWebhook(webhookUrl, {
      campaignName,
      subject,
      htmlTemplate,
      scheduledAt,
      excelFile,
    });

    if (result.ok) {
      setStatus("success");
      setStatusMessage(result.message);
    } else {
      setStatus("error");
      setStatusMessage(result.message);
    }
  }

  const railSections = SECTIONS.map((section) => ({
    ...section,
    complete:
      (section.index === "01" && !!campaignName.trim() && !!subject.trim()) ||
      (section.index === "02" && !!htmlTemplate.trim()) ||
      (section.index === "03" && contactsReady) ||
      (section.index === "04" && !!scheduledDate) ||
      (section.index === "05" && !!webhookUrl.trim()),
  }));

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <header className="border-b border-[var(--color-line)] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--color-stamp)]">
              Диспетчер рассылок
            </p>
            <h1 className="font-[var(--font-display)] text-2xl font-bold tracking-tight text-[var(--color-ink)]">
              Манифест новой рассылки
            </h1>
          </div>
          <p className="hidden max-w-xs text-right text-xs text-[var(--color-muted)] sm:block">
            Заполните манифест — он уйдёт в n8n, который сам отправит письма по графику.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[160px_1fr_300px]">
          <ManifestRail sections={railSections} activeIndex={activeSection} />

          <form className="min-w-0" onSubmit={(event) => event.preventDefault()}>
            <SectionFrame
              id="section-01"
              index="01"
              title="Основная информация"
              description="Название служит для внутреннего учёта, тема увидят получатели в почте."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label mb-1.5 block" htmlFor="campaignName">
                    Название рассылки
                  </label>
                  <input
                    id="campaignName"
                    className={`manifest-input ${errors.campaignName ? "has-error" : ""}`}
                    placeholder="Например, Летняя акция — июнь"
                    {...register("campaignName", { required: true })}
                  />
                  {touchedFields.campaignName && errors.campaignName && (
                    <p className="mt-1 text-xs text-[var(--color-err)]">Укажите название рассылки</p>
                  )}
                </div>
                <div>
                  <label className="field-label mb-1.5 block" htmlFor="subject">
                    Тема письма
                  </label>
                  <input
                    id="subject"
                    className={`manifest-input ${errors.subject ? "has-error" : ""}`}
                    placeholder="Например, {{name}}, для вас особое предложение"
                    {...register("subject", { required: true })}
                  />
                  {touchedFields.subject && errors.subject && (
                    <p className="mt-1 text-xs text-[var(--color-err)]">Укажите тему письма</p>
                  )}
                </div>
              </div>
            </SectionFrame>

            <SectionFrame
              id="section-02"
              index="02"
              title="Шаблон письма"
              description="Вставьте HTML письма. Переменные {{name}}, {{company}}, {{email}} будут заменены данными из Excel при отправке."
            >
              <Controller
                control={control}
                name="htmlTemplate"
                rules={{ required: true }}
                render={({ field }) => (
                  <HtmlCodeField
                    value={field.value}
                    onChange={field.onChange}
                    hasError={!!errors.htmlTemplate}
                    placeholder={"<p>Здравствуйте, {{name}}.</p>\n<p>Предложение для {{company}}.</p>"}
                  />
                )}
              />
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="field-label mb-1.5">Переменные в шаблоне</p>
                  <VariableChecklist
                    variables={templateVariables}
                    availableColumns={availableColumns}
                  />
                </div>
                <div>
                  <p className="field-label mb-1.5">Предпросмотр</p>
                  <EmailPreview
                    html={htmlTemplate}
                    subject={subject}
                    sampleContact={parseResult?.contacts[0] ?? null}
                  />
                </div>
              </div>
            </SectionFrame>

            <SectionFrame
              id="section-03"
              index="03"
              title="Контакты"
              description="Загрузите XLSX с колонками email, name, company. Дополнительные колонки можно использовать в шаблоне."
            >
              <ContactsUploader
                fileName={excelFile?.name ?? null}
                parseResult={parseResult}
                isParsing={isParsing}
                hasError={contactsTouched && !excelFile}
                onFileSelected={handleFileSelected}
                onClear={handleClearFile}
              />
            </SectionFrame>

            <SectionFrame
              id="section-04"
              index="04"
              title="Планирование"
              description="Укажите, когда n8n должен запустить отправку писем."
            >
              <div className="grid gap-4 sm:grid-cols-2 sm:max-w-md">
                <div>
                  <label className="field-label mb-1.5 block" htmlFor="scheduledDate">
                    Дата запуска
                  </label>
                  <input
                    id="scheduledDate"
                    type="date"
                    className={`manifest-input ${errors.scheduledDate ? "has-error" : ""}`}
                    {...register("scheduledDate", { required: true })}
                  />
                </div>
                <div>
                  <label className="field-label mb-1.5 block" htmlFor="scheduledTime">
                    Время
                  </label>
                  <input
                    id="scheduledTime"
                    type="time"
                    className="manifest-input"
                    {...register("scheduledTime")}
                  />
                </div>
              </div>
            </SectionFrame>

            <SectionFrame
              id="section-05"
              index="05"
              title="Webhook n8n"
              description="URL вебхука, который запускает workflow в n8n. Получите его в узле Webhook Trigger вашего сценария."
            >
              <label className="field-label mb-1.5 block" htmlFor="webhookUrl">
                URL webhook
              </label>
              <input
                id="webhookUrl"
                className={`manifest-input font-mono text-sm ${errors.webhookUrl ? "has-error" : ""}`}
                placeholder={WEBHOOK_URL_PLACEHOLDER}
                {...register("webhookUrl", { required: true })}
              />
              <p className="mt-1.5 text-xs text-[var(--color-muted)]">
                Webhook ещё не подключён — это место для адреса вашего n8n-сценария.
              </p>
            </SectionFrame>
          </form>

          <aside>
            <DispatchSummary
              rows={summaryRows}
              allReady={allReady}
              status={status}
              statusMessage={statusMessage}
              onLaunch={handleLaunch}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
