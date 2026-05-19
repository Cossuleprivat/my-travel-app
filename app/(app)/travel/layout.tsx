import { TravelSubNav } from '@/components/travel/TravelSubNav';

export default function TravelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <TravelSubNav />
      {children}
    </div>
  );
}
