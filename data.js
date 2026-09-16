// Delte hjælpefunktioner til at hente og vise opskriftsdata

let opskrifterCache = null;

async function hentOpskrifter() {
  if (opskrifterCache) return opskrifterCache;
  const svar = await fetch("data/recipes.json", { cache: "no-store" });
  opskrifterCache = await svar.json();
  return opskrifterCache;
}

function formatMaengde(tal) {
  const afrundet = Math.round(tal * 100) / 100;
  return afrundet.toString().replace(".", ",");
}

function formatIngrediens(ing) {
  const maengde = formatMaengde(ing.maengde);
  if (ing.valg) {
    return `${ing.valg[0]} ${maengde} ${ing.enhed} eller ${ing.valg[1]} ${maengde} ${ing.enhed}`;
  }
  return `${ing.navn} ${maengde} ${ing.enhed}`;
}

function erVand(navn) {
  return /^(koldt |lunkent |kogende )?vand$/i.test(navn.trim());
}

const AFDELING_RAEKKEFOELGE = [
  "frugt og grønt",
  "kød og fisk",
  "køl",
  "frost",
  "brød",
  "kolonial",
  "baby",
  "andet",
];

// Det navn en ingrediens optræder under i køleskab/indkøb: ved mælk-valg
// (modermælk/modermælkserstatning) er det kun modermælkserstatning, der er en "vare".
function koebsNavn(ing) {
  return ing.valg ? ing.valg[1] : ing.navn;
}

// Alle unikke ingredienser på tværs af opskrifterne (undtagen vand), til Køleskab-siden.
function hentAlleIngredienser(opskrifter) {
  const fundne = new Map();
  opskrifter.forEach((o) => {
    o.ingredienser.forEach((ing) => {
      const navn = koebsNavn(ing);
      if (erVand(navn)) return;
      if (!fundne.has(navn)) fundne.set(navn, ing.afdeling);
    });
  });
  return [...fundne.entries()]
    .map(([navn, afdeling]) => ({ navn, afdeling }))
    .sort((a, b) => a.navn.localeCompare(b.navn, "da"));
}
