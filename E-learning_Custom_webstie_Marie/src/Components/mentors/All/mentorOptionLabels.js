/** Display labels only — stored API values stay in English. */
export const MENTOR_OPTION_FR = {
  Technology: 'Technologie',
  'Creative & Design': 'Création & Design',
  'Finance & Fintech': 'Finance & Fintech',
  'Marketing & Sales': 'Marketing & Vente',
  Education: 'Éducation',
  Healthcare: 'Santé',
  'E-Commerce': 'E-commerce',
  Growth: 'Croissance',
  Empathy: 'Empathie',
  Creativity: 'Créativité',
  Balance: 'Équilibre',
  Impact: 'Impact',
  Authenticity: 'Authenticité',
  Leadership: 'Leadership',
  Innovation: 'Innovation',
  Resilience: 'Résilience',
  Community: 'Communauté',
  Freedom: 'Liberté',
  Fun: 'Plaisir',
  online: 'En ligne',
  Online: 'En ligne',
  inPerson: 'En présentiel',
  'in-person': 'En présentiel',
  'In-person': 'En présentiel',
  'In Person': 'En présentiel',
  both: 'En ligne et présentiel',
  Both: 'En ligne et présentiel',
  mindful_reflection: 'Réflexion consciente',
  'Mindful Reflection': 'Réflexion consciente',
  action_planning: 'Plan d’action',
  'Action Planning': 'Plan d’action',
  basing_thinking: 'Pensée itérative',
  'Basing Thinking': 'Pensée itérative',
  career_mapping: 'Cartographie de carrière',
  'Career Mapping': 'Cartographie de carrière',
  scenario_method: 'Méthode des scénarios',
  'Scenario Method': 'Méthode des scénarios',
  role_playing: 'Jeux de rôle',
  'Role Playing': 'Jeux de rôle',
  students: 'Étudiants & stagiaires',
  'Students & Interns': 'Étudiants & stagiaires',
  early_career: 'Début de carrière',
  'Early Career': 'Début de carrière',
  mid_level: 'Niveau intermédiaire',
  'Mid-Level': 'Niveau intermédiaire',
  senior: 'Leadership senior',
  'Senior Leadership': 'Leadership senior',
  executives: 'Dirigeants',
  Executives: 'Dirigeants',
  career_pivoters: 'En reconversion',
  'Career Pivoters': 'En reconversion',
  English: 'Anglais',
  French: 'Français',
  Spanish: 'Espagnol',
  German: 'Allemand',
  Italian: 'Italien',
  Portuguese: 'Portugais',
  Arabic: 'Arabe',
  Recommended: 'Recommandé',
};

export const mentorOptionFr = (value) => {
  if (value == null || value === '') return value;
  return MENTOR_OPTION_FR[value] || value;
};

export const mentorOptionsFr = (values) =>
  (Array.isArray(values) ? values : []).map(mentorOptionFr);

export const mentorOptionsFrJoin = (values, sep = ' • ') =>
  mentorOptionsFr(values).join(sep);
