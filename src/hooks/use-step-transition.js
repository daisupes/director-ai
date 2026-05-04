"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function getInitialMap(ids) {
  return ids.reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {});
}

export function useStepTransition({
  initialActiveStep,
  initialRevealedSteps = [],
  observedStepIds = [],
} = {}) {
  const sectionRefs = useRef(new Map());
  const focusRefs = useRef(new Map());
  const [activeStepId, setActiveStepId] = useState(initialActiveStep);
  const [revealedSteps, setRevealedSteps] = useState(() =>
    getInitialMap(initialRevealedSteps)
  );
  const [collapsedSteps, setCollapsedSteps] = useState({});
  const [highlightedStepId, setHighlightedStepId] = useState(null);
  const [pendingScrollTarget, setPendingScrollTarget] = useState(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(query.matches);

    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  const registerStep = useCallback(
    (stepId) => (node) => {
      if (node) {
        sectionRefs.current.set(stepId, node);
      } else {
        sectionRefs.current.delete(stepId);
      }
    },
    []
  );

  const registerFocusTarget = useCallback(
    (stepId) => (node) => {
      if (node) {
        focusRefs.current.set(stepId, node);
      } else {
        focusRefs.current.delete(stepId);
      }
    },
    []
  );

  const revealStep = useCallback((stepId) => {
    setRevealedSteps((prev) =>
      prev[stepId] ? prev : { ...prev, [stepId]: true }
    );
  }, []);

  const activateStep = useCallback((stepId) => {
    setRevealedSteps((prev) =>
      prev[stepId] ? prev : { ...prev, [stepId]: true }
    );
    setActiveStepId(stepId);
  }, []);

  const setStepCollapsed = useCallback((stepId, collapsed) => {
    setCollapsedSteps((prev) =>
      prev[stepId] === collapsed ? prev : { ...prev, [stepId]: collapsed }
    );
  }, []);

  const scrollToStep = useCallback((stepId) => {
    setRevealedSteps((prev) => ({ ...prev, [stepId]: true }));
    setActiveStepId(stepId);
    setPendingScrollTarget(stepId);
  }, []);

  const editStep = useCallback(
    (stepId) => {
      setStepCollapsed(stepId, false);
      scrollToStep(stepId);
    },
    [scrollToStep, setStepCollapsed]
  );

  const continueToStep = useCallback(
    ({ fromStepId, toStepId, onBeforeScroll, collapseFrom = true }) => {
      if (fromStepId && collapseFrom) {
        setStepCollapsed(fromStepId, true);
      }

      setRevealedSteps((prev) => ({ ...prev, [toStepId]: true }));
      setActiveStepId(toStepId);
      onBeforeScroll?.();
      setPendingScrollTarget(toStepId);
    },
    [setStepCollapsed]
  );

  useEffect(() => {
    if (!pendingScrollTarget) return;

    const node = sectionRefs.current.get(pendingScrollTarget);
    if (!node) return;

    node.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });

    const focusTarget = focusRefs.current.get(pendingScrollTarget) || node;
    focusTarget.focus({ preventScroll: true });
    setHighlightedStepId(pendingScrollTarget);
    setPendingScrollTarget(null);
  }, [pendingScrollTarget, prefersReducedMotion, revealedSteps]);

  useEffect(() => {
    if (observedStepIds.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.dataset?.stepTransitionId) {
          setActiveStepId(visible.target.dataset.stepTransitionId);
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.18, 0.32, 0.5],
      }
    );

    observedStepIds.forEach((stepId) => {
      const node = sectionRefs.current.get(stepId);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [observedStepIds, revealedSteps, collapsedSteps]);

  const state = useMemo(
    () => ({
      activeStepId,
      revealedSteps,
      collapsedSteps,
      highlightedStepId,
      prefersReducedMotion,
    }),
    [
      activeStepId,
      collapsedSteps,
      highlightedStepId,
      prefersReducedMotion,
      revealedSteps,
    ]
  );

  return {
    ...state,
    registerStep,
    registerFocusTarget,
    revealStep,
    activateStep,
    setStepCollapsed,
    scrollToStep,
    editStep,
    continueToStep,
    clearHighlight: () => setHighlightedStepId(null),
    isStepRevealed: (stepId) => Boolean(revealedSteps[stepId]),
    isStepCollapsed: (stepId) => Boolean(collapsedSteps[stepId]),
    isStepHighlighted: (stepId) => highlightedStepId === stepId,
  };
}
