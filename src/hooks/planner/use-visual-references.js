import { normalizeVisualReferences } from "@/lib/project-planner";

export function useVisualReferences({
  setVisualReferences,
  clearOutputState,
  createId,
}) {
  function addVisualReferenceFiles(files) {
    const fileList = Array.from(files || []).filter((file) =>
      file.type?.startsWith("image/")
    );
    if (fileList.length === 0) return;

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        clearOutputState();
        setVisualReferences((prev) =>
          normalizeVisualReferences([
            ...prev,
            {
              id: createId(),
              name: file.name,
              dataUrl: typeof reader.result === "string" ? reader.result : "",
              note: "",
              category: "Mood",
              influence: {
                continuity: true,
                scenePlan: true,
                outputs: true,
              },
              primary: prev.length === 0,
              sortOrder: prev.length,
            },
          ])
        );
      };
      reader.readAsDataURL(file);
    });
  }

  function updateVisualReference(referenceId, field, value) {
    clearOutputState();
    setVisualReferences((prev) =>
      normalizeVisualReferences(
        prev.map((reference) => {
          if (reference.id === referenceId) {
            return { ...reference, [field]: value };
          }

          if (field === "primary" && value === true) {
            return { ...reference, primary: false };
          }

          return reference;
        })
      )
    );
  }

  function removeVisualReference(referenceId) {
    clearOutputState();
    setVisualReferences((prev) =>
      normalizeVisualReferences(
        prev.filter((reference) => reference.id !== referenceId)
      )
    );
  }

  function moveVisualReference(referenceId, direction) {
    clearOutputState();
    setVisualReferences((prev) => {
      const references = normalizeVisualReferences(prev);
      const index = references.findIndex(
        (reference) => reference.id === referenceId
      );
      const nextIndex = index + direction;
      if (index === -1 || nextIndex < 0 || nextIndex >= references.length) {
        return references;
      }
      const updated = [...references];
      [updated[index], updated[nextIndex]] = [updated[nextIndex], updated[index]];
      return normalizeVisualReferences(updated);
    });
  }

  return {
    addVisualReferenceFiles,
    updateVisualReference,
    removeVisualReference,
    moveVisualReference,
  };
}
