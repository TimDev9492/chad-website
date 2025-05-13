export type TeamMention = {
  category: string;
  members: string[];
};

export type TeamImageMention = {
  category: string;
  memberName: string;
  imgSrc: string;
};

export const teamImageMentions: TeamImageMention[] = [
  {
    category: 'Verpflegung',
    memberName: 'Marvin',
    imgSrc: '/images/team/team-marvin.jpg',
  },
  {
    category: 'Sicherheit und Logistik',
    memberName: 'Dorus',
    imgSrc: '/images/team/team-dorus.jpg',
  },
  {
    category: 'Leitung',
    memberName: 'Raphael',
    imgSrc: '/images/team/team-raphael.jpg',
  },
  {
    category: 'Tempel und Verpflegung',
    memberName: 'Naemi',
    imgSrc: '/images/team/team-naemi.jpg',
  },
  {
    category: 'Dienstprojekt und Freizeitaktivitäten',
    memberName: 'Maya',
    imgSrc: '/images/team/team-maya.jpg',
  },
  {
    category: 'Finanzen und Kommunikation',
    memberName: 'Saria',
    imgSrc: '/images/team/team-saria.jpg',
  },
];

export const teamMentions: TeamMention[] = [
  {
    category: 'Öffentlichkeitsarbeit (Social Media & Anmeldung)',
    members: ['In-Chol', 'Ana'],
  },
  {
    category: 'Kommunikation & Kennenlernen auf der Tagung',
    members: ['Maxi', 'Saria'],
  },
  {
    category: 'Dienstprojekt(e)',
    members: ['Maya', 'Maraly'],
  },
  {
    category: 'Tempel & Ahnenforschung',
    members: ['Naemi', 'Mai'],
  },
  {
    category: 'Geistige Klassen & Schriftstudium',
    members: ['Adrian', 'Jana'],
  },
  {
    category: 'Freizeitaktivitäten & Sport',
    members: ['Max', 'Maya'],
  },
  {
    category: 'Tanzabende',
    members: ['Ana', 'Dorus'],
  },
  {
    category: 'Workshops',
    members: ['Maraly', 'In-Chol'],
  },
  {
    category: 'Sicherheit & Logistik',
    members: ['Dorus', 'Marvin'],
  },
  {
    category: 'Finanzen',
    members: ['Saria', 'Adrian'],
  },
  {
    category: 'Essen',
    members: ['Marvin', 'Naemi'],
  },
  {
    category: 'Schlafplätze',
    members: ['Sebastian'],
  },
  {
    category: 'Missionsarbeit & Interreligiöses',
    members: ['Jana', 'Max'],
  },
];
