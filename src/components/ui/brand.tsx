import Image from "next/image";

export function Brand({ compact = false, dark = true }: { compact?: boolean; dark?: boolean }) {
  if (compact) return <Image className="brand-symbol" src="/brand/energy-symbol-orange.png" alt="Símbolo Energy" width={639} height={644} />;
  if (!dark) return <span className="brand brand-light"><Image src="/brand/energy-symbol-black.png" alt="" width={639} height={644} /><strong>ENERGY</strong></span>;
  return <Image className="brand-logo" src="/brand/energy-logo-horizontal-white-orange.png" alt="Energy" width={1763} height={743} priority />;
}
