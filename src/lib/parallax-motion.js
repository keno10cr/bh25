"use client";

import { useEffect } from "react";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function createLerpLoop() {
  let raf = 0;
  const nodes = new Map();

  function tick() {
    let again = false;
    nodes.forEach((state, el) => {
      if (!el) return;
      state.x += (state.tx - state.x) * state.lerp;
      state.y += (state.ty - state.y) * state.lerp;
      el.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
      if (
        Math.abs(state.tx - state.x) > 0.12 ||
        Math.abs(state.ty - state.y) > 0.12
      ) {
        again = true;
      } else {
        state.x = state.tx;
        state.y = state.ty;
        el.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
      }
    });
    raf = again ? requestAnimationFrame(tick) : 0;
  }

  return {
    set(el, { x = 0, y = 0, lerp = 0.16 } = {}) {
      if (!el) return;
      const prev = nodes.get(el) || { x: 0, y: 0, tx: 0, ty: 0, lerp };
      prev.tx = x;
      prev.ty = y;
      prev.lerp = lerp;
      nodes.set(el, prev);
      if (!raf) raf = requestAnimationFrame(tick);
    },
    destroy() {
      cancelAnimationFrame(raf);
      raf = 0;
      nodes.clear();
    },
  };
}

export function bindScrollParallax(update) {
  let frame = 0;
  const onScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  window.addEventListener("pageshow", onScroll);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    window.removeEventListener("pageshow", onScroll);
  };
}

export function useSmoothParallax(update, deps = []) {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (prefersReducedMotion()) return undefined;
    const loop = createLerpLoop();
    const stop = bindScrollParallax(() => update(loop));
    return () => {
      stop();
      loop.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
