import { Suspense } from "react";
import Nav from "@/components/Nav";
import RunClient from "./RunClient";

export default function RunPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav subtitle="Pipeline Run" />
      <Suspense fallback={<div className="p-10 text-mid text-sm">Loading pipeline...</div>}>
        <RunClient />
      </Suspense>
    </div>
  );
}
