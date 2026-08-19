import { BrandLogoLink } from '@/components/common/BrandLogoLink';

export function PaymentPageHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
      <div className="container max-w-2xl mx-auto px-4 py-3">
        <BrandLogoLink variant="header" />
      </div>
    </header>
  );
}
