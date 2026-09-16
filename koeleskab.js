const KOELESKAB_NOEGLE = "babymad-koeleskab";

const soegefelt = document.getElementById("soegefelt");
const ingrediensListeContainer = document.getElementById("ingrediens-liste");
const forslagListeContainer = document.getElementById("forslag-liste");

let alleIngredienser = [];
let alleOpskrifter = [];
let harSaet = new Set();

function hentKoeleskab() {
  try {
    const gemt = localStorage.getItem(KOELESKAB_NOEGLE);
    return new Set(gemt ? JSON.parse(gemt) : []);
  } catch {
    return new Set();
  }
}

function gemKoeleskab() {
  localStorage.setItem(KOELESKAB_NOEGLE, JSON.stringify([...harSaet]));
}

function grupperEfterAfdeling(liste) {
  const grupper = {};
  liste.forEach((vare) => {
    if (!grupper[vare.afdeling]) grupper[vare.afdeling] = [];
    grupper[vare.afdeling].push(vare);
  });
  return grupper;
}

function visIngredienser() {
  const soegetekst = soegefelt.value.trim().toLowerCase();
  const synlige = alleIngredienser.filter((v) => v.navn.toLowerCase().includes(soegetekst));

  const grupper = grupperEfterAfdeling(synlige);
  const afdelinger = Object.keys(grupper).sort(
    (a, b) => AFDELING_RAEKKEFOELGE.indexOf(a) - AFDELING_RAEKKEFOELGE.indexOf(b)
  );

  if (synlige.length === 0) {
    ingrediensListeContainer.innerHTML = "<p>Ingen varer matcher søgningen.</p>";
    return;
  }

  let html = "";
  afdelinger.forEach((afdeling) => {
    html += `<h2>${afdeling}</h2><div class="filterbar">`;
    grupper[afdeling].forEach((vare) => {
      const aktiv = harSaet.has(vare.navn);
      html += `
        <button type="button" class="pill koeleskab-pill ${aktiv ? "pill-aktiv" : ""}" data-navn="${encodeURIComponent(vare.navn)}" aria-pressed="${aktiv}">
          ${aktiv ? "✅" : "⬜"} ${vare.navn}
        </button>
      `;
    });
    html += `</div>`;
  });

  ingrediensListeContainer.innerHTML = html;

  ingrediensListeContainer.querySelectorAll(".koeleskab-pill").forEach((knap) => {
    knap.addEventListener("click", () => {
      const navn = decodeURIComponent(knap.dataset.navn);
      if (harSaet.has(navn)) {
        harSaet.delete(navn);
      } else {
        harSaet.add(navn);
      }
      gemKoeleskab();
      visIngredienser();
      visForslag();
    });
  });
}

function beregnManglende(opskrift) {
  const manglende = [];
  opskrift.ingredienser.forEach((ing) => {
    const navn = koebsNavn(ing);
    if (erVand(navn)) return;
    if (!harSaet.has(navn)) manglende.push(navn);
  });
  return manglende;
}

function visForslag() {
  const forslag = alleOpskrifter
    .map((o) => ({ opskrift: o, manglende: beregnManglende(o) }))
    .sort((a, b) => a.manglende.length - b.manglende.length || a.opskrift.navn.localeCompare(b.opskrift.navn, "da"));

  forslagListeContainer.innerHTML = forslag
    .map(({ opskrift, manglende }) => {
      const badge =
        manglende.length === 0
          ? '<span class="badge badge-groen">✅ Du har det hele</span>'
          : `<span class="badge">Mangler ${manglende.length}</span>`;
      return `
        <a class="opskrift-kort" href="opskrift.html?id=${encodeURIComponent(opskrift.id)}">
          <h3>${opskrift.navn}</h3>
          <div class="kort-badges">
            <span class="badge">${opskrift.type}</span>
            ${badge}
          </div>
        </a>
      `;
    })
    .join("");
}

soegefelt.addEventListener("input", visIngredienser);

Promise.resolve(hentOpskrifter()).then((opskrifter) => {
  alleOpskrifter = opskrifter;
  alleIngredienser = hentAlleIngredienser(opskrifter);
  harSaet = hentKoeleskab();
  visIngredienser();
  visForslag();
});
