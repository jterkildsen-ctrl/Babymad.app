// Favoritmarkerede opskrifter, gemt lokalt på iPad'en

const FAVORIT_NOEGLE = "babymad-favoritter";

function hentFavoritter() {
  try {
    const gemt = localStorage.getItem(FAVORIT_NOEGLE);
    return new Set(gemt ? JSON.parse(gemt) : []);
  } catch {
    return new Set();
  }
}

function erFavorit(opskriftId) {
  return hentFavoritter().has(opskriftId);
}

// Skifter favorit-status og returnerer den nye status (true = nu favorit).
function skiftFavorit(opskriftId) {
  const favoritter = hentFavoritter();
  if (favoritter.has(opskriftId)) {
    favoritter.delete(opskriftId);
  } else {
    favoritter.add(opskriftId);
  }
  localStorage.setItem(FAVORIT_NOEGLE, JSON.stringify([...favoritter]));
  return favoritter.has(opskriftId);
}
