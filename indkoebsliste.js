// Håndtering af indkøbslisten, gemt lokalt på iPad'en

const INDKOEB_NOEGLE = "babymad-indkoebsliste";

function erVand(navn) {
  return /^(koldt |lunkent |kogende )?vand$/i.test(navn.trim());
}

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

// Tilføjer alle ingredienser fra en opskrift (undtagen vand).
// Findes en vare med samme navn, enhed og afdeling i forvejen, lægges mængden sammen.
function tilfoejOpskriftTilIndkoebsliste(opskrift) {
  const liste = hentIndkoebsliste();

  opskrift.ingredienser.forEach((ing) => {
    let navn = ing.navn;
    let maengde = ing.maengde;
    const enhed = ing.enhed;
    const afdeling = ing.afdeling;

    // Ved valg mellem modermælk og modermælkserstatning skal kun
    // modermælkserstatning på indkøbslisten – modermælk købes ikke.
    if (ing.valg) {
      navn = ing.valg[1];
    }

    if (erVand(navn)) return;

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
