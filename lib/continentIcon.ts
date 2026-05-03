import {
  GiAfrica, GiEarthAfricaEurope, GiEarthAsiaOceania,
  GiEarthAmerica, GiSouthAmerica, GiAntarctica, GiWorld,
} from 'react-icons/gi';
import type { IconType } from 'react-icons';

const ICONS: Record<string, IconType> = {
  africa:        GiAfrica,
  europe:        GiEarthAfricaEurope,
  asia:          GiEarthAsiaOceania,
  oceania:       GiEarthAsiaOceania,
  'north-america': GiEarthAmerica,
  americas:      GiEarthAmerica,
  'south-america': GiSouthAmerica,
  antarctica:    GiAntarctica,
};

export function getContinentIcon(slug: string): IconType {
  return ICONS[slug.toLowerCase()] ?? GiWorld;
}
