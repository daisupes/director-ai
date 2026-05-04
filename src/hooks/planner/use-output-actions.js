"use client";

import { useEffect, useMemo, useState } from "react";

import {
  buildExportText,
  buildProjectExport,
  slugifyFilename,
} from "@/lib/project-planner";

function stringifyGeneratedItem(item) {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return "";

  return Object.entries(item)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

function buildGeneratedOutputText(activeTab, generatedOutputs) {
  if (!generatedOutputs) return "";

  const itemsByTab = {
    Storyboard: generatedOutputs.storyboard,
    "Shot List": generatedOutputs.shotList,
    "Prompt Pack": generatedOutputs.promptPack,
  };

  const items = itemsByTab[activeTab];
  if (!Array.isArray(items) || items.length === 0) return "";

  const outputText = items.map(stringifyGeneratedItem).filter(Boolean).join("\n\n");

  if (activeTab !== "Prompt Pack" || !generatedOutputs.globalContinuityPrompt) {
    return outputText;
  }

  return [
    `globalContinuityPrompt: ${generatedOutputs.globalContinuityPrompt}`,
    outputText,
  ].join("\n\n");
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function writeClipboardText(text) {
  if (!navigator?.clipboard?.writeText) {
    throw new Error("Clipboard is not available in this browser.");
  }

  await navigator.clipboard.writeText(text);
}

export function useOutputActions({
  projectTitle,
  creativeCategory,
  format,
  duration,
  platform,
  aspectRatio,
  scenes,
  activeOutputTab,
  sceneCount,
  generatedOutputs,
  outputVariants,
  activeOutputVariantId,
  preferredOutputVariantId,
  setGeneratedOutputs,
  setActiveOutputVariantId,
  setPreferredOutputVariantId,
  buildCurrentSnapshot,
}) {
  const [copyFeedback, setCopyFeedback] = useState("");
  const [exportFeedback, setExportFeedback] = useState("");

  useEffect(() => {
    if (!copyFeedback) return;
    const timeout = setTimeout(() => setCopyFeedback(""), 1600);
    return () => clearTimeout(timeout);
  }, [copyFeedback]);

  useEffect(() => {
    if (!exportFeedback) return;
    const timeout = setTimeout(() => setExportFeedback(""), 1800);
    return () => clearTimeout(timeout);
  }, [exportFeedback]);

  const fallbackOutputExportText = useMemo(
    () =>
      buildExportText({
        projectTitle,
        creativeCategory,
        format,
        duration,
        platform,
        aspectRatio,
        scenes,
        activeTab: activeOutputTab,
      }),
    [
      projectTitle,
      creativeCategory,
      format,
      duration,
      platform,
      aspectRatio,
      scenes,
      activeOutputTab,
    ]
  );

  const activeOutputVariant = useMemo(
    () =>
      outputVariants.find((variant) => variant.id === activeOutputVariantId) ||
      null,
    [activeOutputVariantId, outputVariants]
  );

  const preferredOutputVariant = useMemo(
    () =>
      outputVariants.find(
        (variant) => variant.id === preferredOutputVariantId
      ) || null,
    [outputVariants, preferredOutputVariantId]
  );

  const effectiveGeneratedOutputs =
    activeOutputVariant?.outputs ||
    preferredOutputVariant?.outputs ||
    generatedOutputs;

  const outputExportText = useMemo(() => {
    const generatedOutputText = buildGeneratedOutputText(
      activeOutputTab,
      effectiveGeneratedOutputs
    );

    if (generatedOutputText) return generatedOutputText;

    return fallbackOutputExportText;
  }, [activeOutputTab, fallbackOutputExportText, effectiveGeneratedOutputs]);

  // Post-generation utilities live here; AI output creation stays in
  // usePlannerGenerationActions.
  async function copyCurrentOutput() {
    try {
      await writeClipboardText(outputExportText);
      setCopyFeedback("Output copied");
    } catch {
      setCopyFeedback("Copy failed");
    }
  }

  function selectOutputVariant(variantId) {
    if (!outputVariants.some((variant) => variant.id === variantId)) return;
    setActiveOutputVariantId(variantId);
  }

  function markOutputVariantPreferred(variantId) {
    const variant = outputVariants.find((item) => item.id === variantId);
    if (!variant) return;

    setPreferredOutputVariantId(variantId);
    setActiveOutputVariantId(variantId);
    setGeneratedOutputs(variant.outputs);
  }

  function buildExportSnapshot() {
    return {
      ...buildCurrentSnapshot(),
      sceneCount,
      generatedOutputs: effectiveGeneratedOutputs,
    };
  }

  async function copyProjectExport(exportType, fileType = "md") {
    try {
      const text = buildProjectExport(
        buildExportSnapshot(),
        exportType,
        fileType
      );
      await writeClipboardText(text);
      setExportFeedback("Export copied");
    } catch {
      setExportFeedback("Copy failed");
    }
  }

  function downloadProjectExport(exportType, fileType = "md") {
    try {
      const text = buildProjectExport(
        buildExportSnapshot(),
        exportType,
        fileType
      );
      const filename = `${slugifyFilename(projectTitle)}-${exportType}.${fileType}`;
      downloadTextFile(filename, text);
      setExportFeedback(`.${fileType} downloaded`);
    } catch {
      setExportFeedback("Download failed");
    }
  }

  return {
    copyFeedback,
    exportFeedback,
    effectiveGeneratedOutputs,
    copyCurrentOutput,
    selectOutputVariant,
    markOutputVariantPreferred,
    copyProjectExport,
    downloadProjectExport,
  };
}
