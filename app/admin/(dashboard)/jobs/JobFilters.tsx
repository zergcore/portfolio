"use client";

import { useQueryState, parseAsString, parseAsBoolean } from "nuqs";
import { useTransition, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Search, MapPin, Globe, X } from "lucide-react";

interface JobFiltersProps {
  locations?: string[];
  sources?: string[];
}

export default function JobFilters({
  locations = [],
  sources = [],
}: JobFiltersProps) {
  const t = useTranslations("adminJobs");
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ shallow: false, startTransition }),
  );
  const [localQ, setLocalQ] = useState(q);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQ !== q) {
        setQ(localQ || "");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localQ, q, setQ]);

  const [location, setLocation] = useQueryState(
    "location",
    parseAsString
      .withDefault("")
      .withOptions({ shallow: false, startTransition }),
  );
  const [remote, setRemote] = useQueryState(
    "remote",
    parseAsBoolean
      .withDefault(false)
      .withOptions({ shallow: false, startTransition }),
  );
  const [source, setSource] = useQueryState(
    "source",
    parseAsString
      .withDefault("")
      .withOptions({ shallow: false, startTransition }),
  );

  const hasActiveFilters = q || location || source || remote;

  const clearFilters = () => {
    setLocalQ("");
    setQ("");
    setLocation("");
    setSource("");
    setRemote(false);
  };

  return (
    <div className="mb-6 p-4 rounded-xl border border-(--border-subtle) bg-background/60 backdrop-blur-md shadow-sm flex flex-col gap-4 transition-all duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-medium text-(--text-secondary) mb-1">
            {t("semanticSearch")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-(--text-tertiary)" />
            </div>
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              className="w-full pl-9 pr-3 py-2 rounded-md border border-(--border-subtle) bg-background/50 text-sm focus:outline-none focus:border-(--accent-cyan) focus:ring-1 focus:ring-(--accent-cyan) transition-colors"
              value={localQ}
              onChange={(e) => setLocalQ(e.target.value)}
            />
          </div>
        </div>

        {/* Location Dropdown */}
        <div>
          <label className="block text-xs font-medium text-(--text-secondary) mb-1">
            {t("location")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-(--text-tertiary)" />
            </div>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-md border border-(--border-subtle) bg-background/50 text-sm appearance-none focus:outline-none focus:border-(--accent-cyan) focus:ring-1 focus:ring-(--accent-cyan) transition-colors cursor-pointer"
            >
              <option value="">{t("allLocations")}</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Source Dropdown */}
        <div>
          <label className="block text-xs font-medium text-(--text-secondary) mb-1">
            {t("source")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-4 w-4 text-(--text-tertiary)" />
            </div>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-md border border-(--border-subtle) bg-background/50 text-sm appearance-none focus:outline-none focus:border-(--accent-cyan) focus:ring-1 focus:ring-(--accent-cyan) transition-colors cursor-pointer"
            >
              <option value="">{t("allSources")}</option>
              {sources.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Remote Checkbox Toggle */}
        <div className="flex items-center mt-4 lg:mt-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                checked={remote}
                onChange={(e) => setRemote(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-(--border-strong) peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-(--accent-cyan)"></div>
            </div>
            <span className="text-sm font-medium text-foreground group-hover:text-(--accent-cyan) transition-colors">
              {t("remoteOnly")}
            </span>
          </label>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-2 pt-4 border-t border-(--border-subtle)">
          {q && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-(--accent-cyan)/10 text-(--accent-cyan) border border-(--accent-cyan)/20">
              {t("semanticSearch")}: {q}
              <button
                onClick={() => {
                  setLocalQ("");
                  setQ("");
                }}
                className="hover:text-(--accent-cyan)/80"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {location && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
              {t("location")}: {location}
              <button
                onClick={() => setLocation("")}
                className="hover:text-blue-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {source && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">
              {t("source")}: {source}
              <button
                onClick={() => setSource("")}
                className="hover:text-purple-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {remote && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              {t("remoteOnly")}
              <button
                onClick={() => setRemote(false)}
                className="hover:text-emerald-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={clearFilters}
            className="ml-auto text-xs font-medium text-(--text-tertiary) hover:text-foreground transition-colors"
          >
            {t("clearFilters")}
          </button>
        </div>
      )}

      {isPending && (
        <div className="absolute top-2 right-4 text-xs text-(--text-secondary) animate-pulse">
          Updating results...
        </div>
      )}
    </div>
  );
}
