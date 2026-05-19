export type ModuleStatus = 'active' | 'coming_soon';
export type ModuleColor = 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'indigo';

export type ModuleSection = {
  label: string;
  href: string;
  icon: string;
};

export type LiveOSModule = {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  color: ModuleColor;
  href: string;
  profileDataHref: string;
  status: ModuleStatus;
  /** Bereich-Startseite (Sub-App-Home). Wenn gesetzt, ist dies ein navigierbarer Bereich. */
  home?: string;
  /** Sub-Navigation des Bereichs (Tab-Leiste + Sidebar-Unterpunkte). */
  sections?: ModuleSection[];
};

export type ModuleProfileData = {
  moduleId: string;
  headline: string;
  subline: string;
  metrics: { label: string; value: string | number }[];
};
