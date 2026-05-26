"use client";

import { Fragment, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiJobPlatformConfig } from "@/lib/api";
import {
  createPlatformConfigAction,
  deletePlatformConfigAction,
  PlatformConfigTestResult,
  testPlatformConfigAction,
  testPlatformConfigInlineAction,
  updatePlatformConfigAction,
} from "@/app/actions/jobs";

const REQUIRED_MAPPING_KEYS = ["title", "source_id"];
const OPTIONAL_MAPPING_KEYS = [
  "company",
  "url",
  "location",
  "jd_text",
  "posted_at",
  "apply_url",
];

const EMPTY_FORM = {
  code: "",
  base_url_template: "",
  http_method: "GET" as "GET" | "POST",
  response_path: "",
  field_mapping_title: "",
  field_mapping_source_id: "",
  field_mapping_company: "",
  field_mapping_url: "",
  field_mapping_location: "",
  field_mapping_jd_text: "",
  field_mapping_posted_at: "",
  field_mapping_apply_url: "",
  auth_header_name: "",
  auth_header_value_env: "",
  posted_at_format: "",
  pagination_type: "none" as "none" | "offset" | "cursor",
  pagination_page_size: "100",
  pagination_limit_param: "limit",
  pagination_offset_param: "offset",
  pagination_token_param: "pageToken",
  pagination_token_path: "nextPageToken",
};

type FormState = typeof EMPTY_FORM;

function buildPayload(form: FormState) {
  const field_mapping: Record<string, string> = {};
  if (form.field_mapping_title) field_mapping.title = form.field_mapping_title;
  if (form.field_mapping_source_id)
    field_mapping.source_id = form.field_mapping_source_id;
  if (form.field_mapping_company)
    field_mapping.company = form.field_mapping_company;
  if (form.field_mapping_url) field_mapping.url = form.field_mapping_url;
  if (form.field_mapping_location)
    field_mapping.location = form.field_mapping_location;
  if (form.field_mapping_jd_text)
    field_mapping.jd_text = form.field_mapping_jd_text;
  if (form.field_mapping_posted_at)
    field_mapping.posted_at = form.field_mapping_posted_at;
  if (form.field_mapping_apply_url)
    field_mapping.apply_url = form.field_mapping_apply_url;

  let pagination: Record<string, unknown> | null = null;
  if (form.pagination_type === "offset") {
    pagination = {
      type: "offset",
      page_size: parseInt(form.pagination_page_size) || 100,
      limit_param: form.pagination_limit_param || "limit",
      offset_param: form.pagination_offset_param || "offset",
    };
  } else if (form.pagination_type === "cursor") {
    pagination = {
      type: "cursor",
      page_size: parseInt(form.pagination_page_size) || 100,
      limit_param: form.pagination_limit_param || "limit",
      token_param: form.pagination_token_param || "pageToken",
      token_path: form.pagination_token_path || "nextPageToken",
    };
  }

  return {
    code: form.code.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_"),
    base_url_template: form.base_url_template.trim(),
    http_method: form.http_method,
    response_path: form.response_path.trim(),
    field_mapping,
    auth_header_name: form.auth_header_name.trim() || null,
    auth_header_value_env: form.auth_header_value_env.trim() || null,
    posted_at_format: form.posted_at_format.trim() || null,
    pagination,
  };
}

function configToForm(cfg: ApiJobPlatformConfig): FormState {
  const m = cfg.field_mapping || {};
  const p = cfg.pagination as Record<string, unknown> | null;
  return {
    code: cfg.code,
    base_url_template: cfg.base_url_template,
    http_method: cfg.http_method as "GET" | "POST",
    response_path: cfg.response_path,
    field_mapping_title: (m.title as string) || "",
    field_mapping_source_id: (m.source_id as string) || "",
    field_mapping_company: (m.company as string) || "",
    field_mapping_url: (m.url as string) || "",
    field_mapping_location: (m.location as string) || "",
    field_mapping_jd_text: (m.jd_text as string) || "",
    field_mapping_posted_at: (m.posted_at as string) || "",
    field_mapping_apply_url: (m.apply_url as string) || "",
    auth_header_name: cfg.auth_header_name || "",
    auth_header_value_env: cfg.auth_header_value_env || "",
    posted_at_format: cfg.posted_at_format || "",
    pagination_type: p ? (p.type as "offset" | "cursor") : "none",
    pagination_page_size: p ? String(p.page_size ?? 100) : "100",
    pagination_limit_param: p ? String(p.limit_param ?? "limit") : "limit",
    pagination_offset_param: p ? String(p.offset_param ?? "offset") : "offset",
    pagination_token_param: p ? String(p.token_param ?? "pageToken") : "pageToken",
    pagination_token_path: p
      ? String(p.token_path ?? "nextPageToken")
      : "nextPageToken",
  };
}

const inputCls =
  "w-full px-3 py-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--accent-violet)]/60 focus:outline-none";
const labelCls = "block text-xs font-medium text-[var(--text-secondary)] mb-1";

function ConfigForm({
  form,
  onChange,
  disabled,
  isEdit,
}: {
  form: FormState;
  onChange: (patch: Partial<FormState>) => void;
  disabled: boolean;
  isEdit: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>
            Platform code{" "}
            <span className="text-[var(--text-secondary)]/60">(lowercase, underscores)</span>
          </label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => onChange({ code: e.target.value })}
            placeholder="e.g. bamboohr"
            disabled={disabled || isEdit}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>HTTP method</label>
          <select
            value={form.http_method}
            onChange={(e) =>
              onChange({ http_method: e.target.value as "GET" | "POST" })
            }
            disabled={disabled}
            className={inputCls}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>
          Base URL template{" "}
          <span className="text-[var(--text-secondary)]/60">
            (use &#123;identifier&#125; as placeholder)
          </span>
        </label>
        <input
          type="text"
          value={form.base_url_template}
          onChange={(e) => onChange({ base_url_template: e.target.value })}
          placeholder="https://example.com/api/jobs/{identifier}"
          disabled={disabled}
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>
          Response path{" "}
          <span className="text-[var(--text-secondary)]/60">
            (dotted path to jobs array, e.g. data.jobs)
          </span>
        </label>
        <input
          type="text"
          value={form.response_path}
          onChange={(e) => onChange({ response_path: e.target.value })}
          placeholder="e.g. data or offers or results.items"
          disabled={disabled}
          className={inputCls}
        />
      </div>

      {/* Field mapping */}
      <div>
        <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">
          Field mapping{" "}
          <span className="text-[var(--text-secondary)]/60">
            (dotted paths into each job object)
          </span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>
              title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.field_mapping_title}
              onChange={(e) =>
                onChange({ field_mapping_title: e.target.value })
              }
              placeholder="title"
              disabled={disabled}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>
              source_id <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.field_mapping_source_id}
              onChange={(e) =>
                onChange({ field_mapping_source_id: e.target.value })
              }
              placeholder="id"
              disabled={disabled}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>company</label>
            <input
              type="text"
              value={form.field_mapping_company}
              onChange={(e) =>
                onChange({ field_mapping_company: e.target.value })
              }
              placeholder="company_name"
              disabled={disabled}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>url</label>
            <input
              type="text"
              value={form.field_mapping_url}
              onChange={(e) => onChange({ field_mapping_url: e.target.value })}
              placeholder="url or careers_url"
              disabled={disabled}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>location</label>
            <input
              type="text"
              value={form.field_mapping_location}
              onChange={(e) =>
                onChange({ field_mapping_location: e.target.value })
              }
              placeholder="location or city"
              disabled={disabled}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>jd_text</label>
            <input
              type="text"
              value={form.field_mapping_jd_text}
              onChange={(e) =>
                onChange({ field_mapping_jd_text: e.target.value })
              }
              placeholder="description or body"
              disabled={disabled}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>posted_at</label>
            <input
              type="text"
              value={form.field_mapping_posted_at}
              onChange={(e) =>
                onChange({ field_mapping_posted_at: e.target.value })
              }
              placeholder="published_at or created_at"
              disabled={disabled}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>apply_url</label>
            <input
              type="text"
              value={form.field_mapping_apply_url}
              onChange={(e) =>
                onChange({ field_mapping_apply_url: e.target.value })
              }
              placeholder="apply_url (optional)"
              disabled={disabled}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Auth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Auth header name (optional)</label>
          <input
            type="text"
            value={form.auth_header_name}
            onChange={(e) => onChange({ auth_header_name: e.target.value })}
            placeholder="e.g. Authorization"
            disabled={disabled}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Auth env var (optional)</label>
          <input
            type="text"
            value={form.auth_header_value_env}
            onChange={(e) =>
              onChange({ auth_header_value_env: e.target.value })
            }
            placeholder="e.g. BAMBOOHR_API_KEY"
            disabled={disabled}
            className={inputCls}
          />
        </div>
      </div>

      {/* Timestamp format */}
      <div>
        <label className={labelCls}>
          posted_at format (optional){" "}
          <span className="text-[var(--text-secondary)]/60">
            strftime format for non-ISO timestamps
          </span>
        </label>
        <input
          type="text"
          value={form.posted_at_format}
          onChange={(e) => onChange({ posted_at_format: e.target.value })}
          placeholder="e.g. %Y-%m-%d %H:%M:%S UTC (leave blank for ISO)"
          disabled={disabled}
          className={inputCls}
        />
      </div>

      {/* Pagination */}
      <div>
        <label className={labelCls}>Pagination</label>
        <select
          value={form.pagination_type}
          onChange={(e) =>
            onChange({
              pagination_type: e.target.value as "none" | "offset" | "cursor",
            })
          }
          disabled={disabled}
          className={inputCls + " mb-3"}
        >
          <option value="none">None (single request)</option>
          <option value="offset">Offset-based</option>
          <option value="cursor">Cursor-based</option>
        </select>

        {form.pagination_type !== "none" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Page size</label>
              <input
                type="number"
                value={form.pagination_page_size}
                onChange={(e) =>
                  onChange({ pagination_page_size: e.target.value })
                }
                disabled={disabled}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Limit param</label>
              <input
                type="text"
                value={form.pagination_limit_param}
                onChange={(e) =>
                  onChange({ pagination_limit_param: e.target.value })
                }
                disabled={disabled}
                className={inputCls}
              />
            </div>
            {form.pagination_type === "offset" && (
              <div>
                <label className={labelCls}>Offset param</label>
                <input
                  type="text"
                  value={form.pagination_offset_param}
                  onChange={(e) =>
                    onChange({ pagination_offset_param: e.target.value })
                  }
                  disabled={disabled}
                  className={inputCls}
                />
              </div>
            )}
            {form.pagination_type === "cursor" && (
              <>
                <div>
                  <label className={labelCls}>Token param</label>
                  <input
                    type="text"
                    value={form.pagination_token_param}
                    onChange={(e) =>
                      onChange({ pagination_token_param: e.target.value })
                    }
                    disabled={disabled}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Token path (in response)</label>
                  <input
                    type="text"
                    value={form.pagination_token_path}
                    onChange={(e) =>
                      onChange({ pagination_token_path: e.target.value })
                    }
                    disabled={disabled}
                    className={inputCls}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlatformConfigsClient({
  initialConfigs,
}: {
  initialConfigs: ApiJobPlatformConfig[];
}) {
  const router = useRouter();
  const [configs, setConfigs] =
    useState<ApiJobPlatformConfig[]>(initialConfigs);
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(configs.length === 0);
  const [editCode, setEditCode] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    code: string;
    result: PlatformConfigTestResult | null;
    error: string;
  } | null>(null);
  const [testIdentifiers, setTestIdentifiers] = useState<Record<string, string>>({});

  const updateForm = (patch: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const isFormValid =
    form.code.trim() &&
    form.base_url_template.trim() &&
    form.response_path.trim() &&
    form.field_mapping_title.trim() &&
    form.field_mapping_source_id.trim();

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    setBusy("create");
    setError(null);
    const payload = buildPayload(form);
    const res = await createPlatformConfigAction(payload);
    setBusy(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.data) {
      setConfigs((prev) => [...prev, res.data as ApiJobPlatformConfig]);
      setForm({ ...EMPTY_FORM });
      setShowForm(false);
      router.refresh();
    }
  }

  async function onTestInline() {
    if (!isFormValid) return;
    setBusy("test-inline");
    setError(null);
    const payload = buildPayload(form);
    const res = await testPlatformConfigInlineAction(payload);
    setBusy(null);
    if (res.error) {
      setTestResult({ code: "__inline__", result: null, error: res.error });
      return;
    }
    setTestResult({
      code: "__inline__",
      result: res.data as PlatformConfigTestResult,
      error: "",
    });
  }

  async function onTestSaved(code: string) {
    setBusy(`test-${code}`);
    setError(null);
    const id = (testIdentifiers[code] || "").trim() || "test";
    const res = await testPlatformConfigAction(code, id);
    setBusy(null);
    if (res.error) {
      setTestResult({ code, result: null, error: res.error });
      return;
    }
    setTestResult({
      code,
      result: res.data as PlatformConfigTestResult,
      error: "",
    });
  }

  function startEdit(cfg: ApiJobPlatformConfig) {
    setEditCode(cfg.code);
    setForm(configToForm(cfg));
    setError(null);
    setTestResult(null);
  }

  function cancelEdit() {
    setEditCode(null);
    setForm({ ...EMPTY_FORM });
    setError(null);
  }

  async function saveEdit() {
    if (!editCode) return;
    setBusy(`edit-${editCode}`);
    setError(null);
    const payload = buildPayload(form);
    const { code: _, ...updateData } = payload;
    const res = await updatePlatformConfigAction(editCode, updateData);
    setBusy(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.data) {
      setConfigs((prev) =>
        prev.map((c) =>
          c.code === editCode ? (res.data as ApiJobPlatformConfig) : c
        )
      );
      setEditCode(null);
      setForm({ ...EMPTY_FORM });
      router.refresh();
    }
  }

  async function onDelete(code: string) {
    if (
      !confirm(
        `Delete platform config "${code}"? Sources using this platform will stop polling.`
      )
    )
      return;
    setBusy(code);
    setError(null);
    const res = await deletePlatformConfigAction(code);
    setBusy(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    setConfigs((prev) => prev.filter((c) => c.code !== code));
    if (editCode === code) cancelEdit();
    router.refresh();
  }

  return (
    <>
      {/* New config form toggle */}
      {!editCode && (
        <div className="mb-6">
          <button
            onClick={() => {
              setShowForm((v) => !v);
              setForm({ ...EMPTY_FORM });
              setTestResult(null);
              setError(null);
            }}
            className="text-sm font-medium text-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]/80 transition-colors"
          >
            {showForm ? "Cancel" : "+ Add new platform"}
          </button>
        </div>
      )}

      {/* Create form */}
      {showForm && !editCode && (
        <form
          onSubmit={onCreate}
          className="mb-6 p-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4"
        >
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            New platform adapter
          </h2>
          <ConfigForm
            form={form}
            onChange={updateForm}
            disabled={busy === "create" || busy === "test-inline"}
            isEdit={false}
          />

          {/* Inline test result */}
          {testResult?.code === "__inline__" && (
            <div className="rounded-md bg-[var(--bg-elevated)] p-3">
              {testResult.error ? (
                <p className="text-xs text-red-300">
                  Test error: {testResult.error}
                </p>
              ) : testResult.result ? (
                <div className="space-y-1">
                  <p className="text-xs text-[var(--text-secondary)]">
                    <span
                      className={
                        testResult.result.ok
                          ? "text-emerald-300"
                          : "text-red-300"
                      }
                    >
                      {testResult.result.ok ? "OK" : "Failed"}
                    </span>
                    {" — "}
                    {testResult.result.count} job
                    {testResult.result.count !== 1 ? "s" : ""} found
                  </p>
                  {testResult.result.sample.map((j, i) => (
                    <p
                      key={i}
                      className="text-xs text-[var(--text-secondary)] pl-3"
                    >
                      <a
                        href={j.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent-cyan)] hover:underline"
                      >
                        {j.title}
                      </a>
                      {" @ "}
                      {j.company}
                    </p>
                  ))}
                  {testResult.result.error && (
                    <p className="text-xs text-red-300 mt-1">
                      {testResult.result.error}
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onTestInline}
              disabled={!isFormValid || busy === "test-inline"}
              className="px-4 py-2 rounded-md border border-[var(--accent-cyan)]/40 text-[var(--accent-cyan)] text-sm font-medium hover:bg-[var(--accent-cyan)]/10 disabled:opacity-50 transition-colors"
            >
              {busy === "test-inline" ? "Testing…" : "Test config"}
            </button>
            <button
              type="submit"
              disabled={!isFormValid || busy === "create"}
              className="px-4 py-2 rounded-md bg-[var(--accent-violet)] text-white text-sm font-medium hover:bg-[var(--accent-violet)]/90 disabled:opacity-50 transition-colors"
            >
              {busy === "create" ? "Saving…" : "Save platform"}
            </button>
          </div>
        </form>
      )}

      {/* Edit form */}
      {editCode && (
        <div className="mb-6 p-5 rounded-lg border border-[var(--accent-violet)]/40 bg-[var(--bg-surface)] space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Editing: {editCode}
          </h2>
          <ConfigForm
            form={form}
            onChange={updateForm}
            disabled={busy === `edit-${editCode}`}
            isEdit={true}
          />
          <div className="flex gap-3 pt-2">
            <button
              onClick={saveEdit}
              disabled={!isFormValid || busy === `edit-${editCode}`}
              className="px-4 py-2 rounded-md bg-[var(--accent-violet)] text-white text-sm font-medium hover:bg-[var(--accent-violet)]/90 disabled:opacity-50 transition-colors"
            >
              {busy === `edit-${editCode}` ? "Saving…" : "Save changes"}
            </button>
            <button
              onClick={cancelEdit}
              disabled={busy === `edit-${editCode}`}
              className="px-4 py-2 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] text-sm hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/40 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Existing configs table */}
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 text-left">Code</th>
              <th className="px-4 py-2 text-left">URL template</th>
              <th className="px-4 py-2 text-left">Response path</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {configs.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-[var(--text-secondary)] italic"
                >
                  No dynamic platform configs yet. Click &ldquo;Add new
                  platform&rdquo; above.
                </td>
              </tr>
            ) : (
              configs.map((cfg) => {
                const isBusy =
                  busy === cfg.code ||
                  busy === `test-${cfg.code}` ||
                  busy === `edit-${cfg.code}`;
                const test =
                  testResult?.code === cfg.code ? testResult : null;

                return (
                  <Fragment key={cfg.code}>
                    <tr className="border-t border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]/50">
                      <td className="px-4 py-2 text-[var(--text-primary)] font-mono">
                        {cfg.code}
                      </td>
                      <td className="px-4 py-2 text-[var(--text-secondary)] text-xs truncate max-w-[300px]">
                        {cfg.base_url_template}
                      </td>
                      <td className="px-4 py-2 text-[var(--text-secondary)] font-mono text-xs">
                        {cfg.response_path}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <span className="inline-flex gap-3 items-center">
                          <input
                            type="text"
                            value={testIdentifiers[cfg.code] ?? ""}
                            onChange={(e) =>
                              setTestIdentifiers((prev) => ({
                                ...prev,
                                [cfg.code]: e.target.value,
                              }))
                            }
                            placeholder="identifier"
                            className="w-24 px-2 py-1 rounded text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                          />
                          <button
                            onClick={() => onTestSaved(cfg.code)}
                            disabled={isBusy || !!editCode}
                            className="text-xs text-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]/80 disabled:opacity-40 transition-colors"
                          >
                            {busy === `test-${cfg.code}`
                              ? "Testing…"
                              : "Test"}
                          </button>
                          <button
                            onClick={() => startEdit(cfg)}
                            disabled={isBusy || !!editCode}
                            className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] disabled:opacity-40 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(cfg.code)}
                            disabled={isBusy || !!editCode}
                            className="text-xs text-red-300 hover:text-red-200 disabled:opacity-40 transition-colors"
                          >
                            Delete
                          </button>
                        </span>
                      </td>
                    </tr>
                    {test && (
                      <tr className="border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40">
                        <td colSpan={4} className="px-4 py-3">
                          {test.error ? (
                            <p className="text-xs text-red-300">
                              Test error: {test.error}
                            </p>
                          ) : test.result ? (
                            <div className="space-y-1">
                              <p className="text-xs text-[var(--text-secondary)]">
                                <span
                                  className={
                                    test.result.ok
                                      ? "text-emerald-300"
                                      : "text-red-300"
                                  }
                                >
                                  {test.result.ok ? "OK" : "Failed"}
                                </span>
                                {" — "}
                                {test.result.count} job
                                {test.result.count !== 1 ? "s" : ""} found
                              </p>
                              {test.result.sample.map((j, i) => (
                                <p
                                  key={i}
                                  className="text-xs text-[var(--text-secondary)] pl-3"
                                >
                                  <a
                                    href={j.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[var(--accent-cyan)] hover:underline"
                                  >
                                    {j.title}
                                  </a>
                                  {" @ "}
                                  {j.company}
                                </p>
                              ))}
                              {test.result.error && (
                                <p className="text-xs text-red-300 mt-1">
                                  {test.result.error}
                                </p>
                              )}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
