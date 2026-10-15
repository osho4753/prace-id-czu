"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("./App"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-white text-muted">Načítám…</div>
  ),
});

export default function ClientApp() {
  return <App />;
}
