// Håndtering af indkøbslisten, gemt lokalt på iPad'en

const INDKOEB_NOEGLE = "babymad-indkoebsliste";

function hentIndkoebsliste() {
  try {
    const gemt = localStorage.getItem(INDKOEB_NOEGLE);
    return gemt ? JSON.parse(gemt) : [];
  } catch {
    return [];
  }
}

function gemIndkoebsliste(liste) {
  localStorage.setItem(INDKOEB_NOEGLE, JSON.stringify(liste));
}

function lavVareId() {
  return "vare-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

// Tilføjer alle ingredienser fra en opskrift (undtagen vand), skaleret til det ønskede
// antal portioner. Kendes ingrediensen fra ingrediens-koeb.js, lægges den sammen med
// eventuelle tidligere tilføjelser i GRAM (uanset om opskrifterne bruger fx dl eller spsk),
// så vi bagefter kan foreslå en realistisk indkøbsmængde. Ukendte ingredienser lægges
// i stedet sammen efter navn, enhed og afdeling, som opskriften selv angiver dem.
function tilfoejOpskriftTilIndkoebsliste(opskrift, skaleringsFaktor = 1) {
  const liste = hentIndkoebsliste();

  opskrift.ingredienser.forEach((ing) => {
    const navn = koebsNavn(ing);
    const maengde = ing.maengde * skaleringsFaktor;
    const enhed = ing.enhed;
    const afdeling = ing.afdeling;

    if (erVand(navn)) return;

    const tabelEntry = INGREDIENS_KOEB[navn];
    const gram = tabelEntry ? beregnGram(tabelEntry, maengde, enhed) : null;

    if (tabelEntry && gram !== null) {
      const eksisterende = liste.find(
        (v) => v.navn === navn && v.afdeling === afdeling && v.koebGram !== undefined
      );
      if (eksisterende) {
        eksisterende.koebGram += gram;
        if (!eksisterende.fraOpskrifter.includes(opskrift.navn)) {
          eksisterende.fraOpskrifter.push(opskrift.navn);
        }
      } else {
        liste.push({
          id: lavVareId(),
          navn,
          afdeling,
          koebGram: gram,
          fraOpskrifter: [opskrift.navn],
        });
      }
      return;
    }

    const eksisterende = liste.find(
      (v) => v.navn === navn && v.enhed === enhed && v.afdeling === afdeling
    );
    if (eksisterende) {
      eksisterende.maengde += maengde;
      if (!eksisterende.fraOpskrifter.includes(opskrift.navn)) {
        eksisterende.fraOpskrifter.push(opskrift.navn);
      }
    } else {
      liste.push({
        id: lavVareId(),
        navn,
        maengde,
        enhed,
        afdeling,
        fraOpskrifter: [opskrift.navn],
      });
    }
  });

  gemIndkoebsliste(liste);
  return liste;
}

function fjernFraIndkoebsliste(vareId) {
  const liste = hentIndkoebsliste().filter((v) => v.id !== vareId);
  gemIndkoebsliste(liste);
  return liste;
}

function ryddIndkoebsliste() {
  gemIndkoebsliste([]);
}
