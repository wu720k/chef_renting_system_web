/** Page content (taken from FORRAS_26_05_22/forras.txt, also in resources/chef_renting_patterns). */

export interface InfoSectionContent {
  /** Large green first letter of the heading. */
  initial: string;
  /** Remaining letters of the heading. */
  rest: string;
  subtitle: string;
  text: string;
  image: string;
  imageAlt: string;
  /** Desktop only: image on the left, text on the right. */
  imageFirst: boolean;
}

export const BRAND_NAME = 'Gourmet Moments';

export const NAV_LINKS = [{ label: 'Séf Bérlés', path: '/seferek' }];

export const HERO = {
  light: 'A Legjobb',
  bold: 'Privát séfek szállítják házhoz az éttermi élményt.',
  brand: BRAND_NAME,
  text:
    'A séf most házhoz megy! Mind ismerjük a nagy ünnepi összejöveteleket, vagy épp üzleti ebédek körül ' +
    'kialakult őrületet: amikor akár több napot is eltöltünk a bevásárlással, főzéssel, tálalással és a ' +
    'rendrakással. A házigazdának végül pont arra nincs ideje és energiája, ami miatt az egészet csinálja: ' +
    'a meghívottakra.',
  image: 'assets/images/voucher.jpg',
  imageAlt: 'Vendégek egy megterített hosszú asztalnál',
};

export const SECTIONS: InfoSectionContent[] = [
  {
    initial: 'R',
    rest: 'ólunk',
    subtitle: 'Gourmet Moments – Privát séfek az Ön otthonában',
    text:
      'A Gourmet Moments elhozza Önnek az éttermi élményt az otthona kényelmébe. Legyen szó ünnepi ' +
      'vacsoráról, családi összejövetelről, céges rendezvényről vagy romantikus estéről, nálunk a séf ' +
      'házhoz megy! Így Önnek nem kell többé órákat töltenie bevásárlással, főzéssel és előkészületekkel – ' +
      'csak élveznie kell a tökéletesen megkomponált fogásokat és a társaságot. Csapatunk gondosan ' +
      'válogatott, magasan képzett séfekből áll, akik a világ különböző konyháinak legjavát hozzák el ' +
      'Önnek. Személyre szabott menük, friss alapanyagok, professzionális tálalás – mindezt az Ön igényei ' +
      'szerint.',
    image: 'assets/images/grazing.jpg',
    imageAlt: 'Falatkák és sütemények egy terített asztalon',
    imageFirst: true,
  },
  {
    initial: 'S',
    rest: 'éfek',
    subtitle: 'A világ ízei, egyenesen az Ön asztalára',
    text:
      'Séfjeink nemcsak kiváló szakemberek, hanem igazi művészek is a konyhában. Olasz, francia, ázsiai, ' +
      'mexikói, mediterrán vagy vegetáriánus fogások – nálunk minden vendég megtalálja a kedvére valót. ' +
      'Minden privát séfünk több éves tapasztalattal, nemzetközi referenciákkal és szenvedéllyel végzi ' +
      'munkáját, hogy felejthetetlen gasztronómiai élményt nyújtson Önnek és vendégeinek. Legyen szó egy ' +
      'elegáns vacsoráról, egy kötetlen grillpartiról vagy egy exkluzív kóstolóról, séfjeink minden ' +
      'alkalomra tökéletes megoldást kínálnak.',
    image: 'assets/images/catering.jpg',
    imageAlt: 'Felvágottak és falatkák tálon',
    imageFirst: false,
  },
];
