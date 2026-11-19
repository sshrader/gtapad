// The crew roster as the browser needs it. Keep in sync with server/pets.mjs.
// 16 original cartoon characters from the made-up city of Neon Bay. None are based on real people or on any game, film or TV character.
export type Species = 'mob' | 'crew';

export const PET_ROSTER = [
  { id: 'don-biscotti', species: 'mob', name: 'Don Biscotti', breed: 'The Don', voice: 'oracle' },
  { id: 'sal-pigeon', species: 'mob', name: 'Sal the Pigeon', breed: 'The Lookout', voice: 'degen' },
  { id: 'mr-ledger', species: 'mob', name: 'Mr. Ledger', breed: 'The Accountant', voice: 'auditor' },
  { id: 'velvet-lou', species: 'mob', name: 'Velvet Lou', breed: 'The Crooner', voice: 'poet' },
  { id: 'gruff-gus', species: 'mob', name: 'Gruff Gus', breed: 'The Bouncer', voice: 'grump' },
  { id: 'nonna-pesto', species: 'mob', name: 'Nonna Pesto', breed: 'The Matriarch', voice: 'oracle' },
  { id: 'dapper-dom', species: 'mob', name: 'Dapper Dom', breed: 'The Fixer', voice: 'auditor' },
  { id: 'big-pretzel', species: 'mob', name: 'Big Pretzel', breed: 'The Muscle', voice: 'grump' },
  { id: 'turbo-tess', species: 'crew', name: 'Turbo Tess', breed: 'The Wheelwoman', voice: 'degen' },
  { id: 'chrome-charlie', species: 'crew', name: 'Chrome Charlie', breed: 'The Mechanic', voice: 'grump' },
  { id: 'neon-nadia', species: 'crew', name: 'Neon Nadia', breed: 'The Hacker', voice: 'auditor' },
  { id: 'skates-mcgee', species: 'crew', name: 'Skates McGee', breed: 'The Courier', voice: 'degen' },
  { id: 'miss-mirage', species: 'crew', name: 'Miss Mirage', breed: 'The Illusionist', voice: 'oracle' },
  { id: 'sunny-sundae', species: 'crew', name: 'Sunny Sundae', breed: 'The Getaway Driver', voice: 'poet' },
  { id: 'doc-dime', species: 'crew', name: 'Doc Dime', breed: 'The Safecracker', voice: 'auditor' },
  { id: 'rocket-rita', species: 'crew', name: 'Rocket Rita', breed: 'The Pilot', voice: 'degen' },
] as const;

const VOICE_LABEL: Record<string, string> = {
  oracle: 'Godfather',
  degen: 'Loudmouth',
  auditor: 'Bookkeeper',
  poet: 'Smooth',
  grump: 'Grumpy',
};

export const voiceLabel = (voice: string): string => VOICE_LABEL[voice] ?? voice;

/** Which side of town a character belongs to. Coins saved by the earlier pet version count as the family. */
export function speciesOf(pet: { id: string; species?: string }): Species {
  if (pet.species === 'mob' || pet.species === 'crew') return pet.species;
  return PET_ROSTER.find((p) => p.id === pet.id)?.species ?? 'mob';
}

export const crewLabel = (s: Species): string => (s === 'crew' ? 'street crew' : 'the family');
