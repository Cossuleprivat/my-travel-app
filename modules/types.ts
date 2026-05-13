export type ModuleStatus = 'active' | 'coming_soon';
export type ModuleColor = 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'indigo';

export type LiveOSModule = {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  color: ModuleColor;
  href: string;
  profileDataHref: string;
  status: ModuleStatus;
};

export type ModuleProfileData = {
  moduleId: string;
  headline: string;
  subline: string;
  metrics: { label: string; value: string | number }[];
};
