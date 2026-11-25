// Pastilles des filtres. Une couleur saisie dans le dashboard et absente
// d'ici s'affiche simplement avec la pastille neutre.
const SWATCHES: Record<string, string> = {
  Rose: "#EFB0C2",
  Rouge: "#B3263E",
  Blanc: "#FFFDF8",
  Ivoire: "#F6EEDD",
  Lilas: "#C9B3E3",
  Pêche: "#F6C3A0",
  Jaune: "#F4CF5B",
  Bleu: "#A9C8E6",
  Bordeaux: "#6E1F34",
  Vert: "#9DBB9F",
  Orange: "#EE9C56",
  Noir: "#2B2226",
  Or: "#D4B26A",
  Beige: "#EBD3B8",
  Mauve: "#B779B5",
  Taupe: "#B5A49B",
  Corail: "#F28A7A",
};

export function swatchFor(color: string) {
  return SWATCHES[color] ?? "#E4D8CC";
}

export const COLOR_SUGGESTIONS = Object.keys(SWATCHES);
export const FLOWER_SUGGESTIONS = ["Rose", "Pivoine", "Dahlia", "Succulente", "Mixte"];
export const SHAPE_SUGGESTIONS = ["Dôme", "Cœur", "Couronne", "Ovale", "Coupe"];
