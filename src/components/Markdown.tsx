"use client";

import { useEffect, useState, type ComponentType } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached: { Component: ComponentType<any>; plugins: any[] } | null = null;

async function loadMarkdown() {
  if (cached) return cached;
  const [rmMod, gfmMod] = await Promise.all([
    import("react-markdown"),
    import("remark-gfm"),
  ]);
  cached = {
    Component: rmMod.default,
    plugins: [gfmMod.default],
  };
  return cached;
}

export function Markdown({ children }: { children: string }) {
  const [loaded, setLoaded] = useState(cached);

  useEffect(() => {
    if (cached) {
      setLoaded(cached);
      return;
    }
    loadMarkdown().then(setLoaded);
  }, []);

  if (!loaded) {
    return <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>;
  }

  const { Component, plugins } = loaded;
  return <Component remarkPlugins={plugins}>{children}</Component>;
}
