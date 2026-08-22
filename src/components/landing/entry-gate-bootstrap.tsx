import { withBasePath } from "@/lib/base-path";

const STORAGE_KEY = "energy-entry-calculator-seen-v2";

export function EntryGateBootstrap({ nonce }: { nonce?: string }) {
  const script = `(function(){var root=document.documentElement;root.dataset.entryGate="pending";try{if(sessionStorage.getItem("${STORAGE_KEY}")==="true")root.dataset.entryGate="seen";}catch(e){}setTimeout(function(){if(root.dataset.entryGate==="pending")root.dataset.entryGate="failed"},4000)})();`;
  const logo = withBasePath("/brand/energy-logo-horizontal-white-orange.png");

  return (
    <>
      <style nonce={nonce}>{`:root{--entry-gate-logo:url("${logo}")}`}</style>
      <script nonce={nonce} dangerouslySetInnerHTML={{ __html: script }} />
    </>
  );
}
