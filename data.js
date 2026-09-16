// Delte hjælpefunktioner til at hente og vise opskriftsdata

let opskrifterCache = null;

async function hentOpskrifter() {
  if (opskrifterCache) return opskrifterCache;
  const svar = await fetch("data/recipes.json");
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
