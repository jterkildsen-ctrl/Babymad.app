const TYPER = ["grød", "grøntsagsmos", "frugtmos", "middag/familiemad", "pålæg"];

let alleOpskrifter = [];
let valgtType = "alle";

const soegefelt = document.getElementById("soegefelt");
const alderFilter = document.getElementById("alder-filter");
const kildeFilter = document.getElementById("kilde-filter");
const frysFilter = document.getElementById("frys-filter");
const favoritFilter = document.getElementById("favorit-filter");
const typePillsContainer = document.getElementById("type-pills");
const listeContainer = document.getElementById("opskrift-liste");
const antalResultater = document.getElementById("antal-resultater");

function opretTypePills() {
  const alleKnap = lavPill("Alle typer", "alle");
  typePillsContainer.appendChild(alleKnap);
  TYPER.forEach((type) => {
    typePillsContainer.appendChild(lavPill(type, type));
  });
  opdaterTypePillsUdseende();
}

function lavPill(tekst, vaerdi) {
  const knap = document.createElement("button");
  knap.type = "button";
  knap.className = "pill";
  knap.textContent = tekst;
  knap.dataset.vaerdi = vaerdi;
  knap.addEventListener("click", () => {
    valgtType = vaerdi;
    opdaterTypePillsUdseende();
    visOpskrifter();
  });
  return knap;
}

function opdaterTypePillsUdseende() {
  typePillsContainer.querySelectorAll(".pill").forEach((knap) => {
    const aktiv = knap.dataset.vaerdi === valgtType;
    knap.classList.toggle("pill-aktiv", aktiv);
    knap.setAttribute("aria-pressed", aktiv ? "true" : "false");
  });
}

function opretKildeFilter(opskrifter) {
  const kilder = [...new Set(opskrifter.map((o) => o.kilde.navn))];
  kilder.forEach((kilde) => {
    const option = document.createElement("option");
    option.value = kilde;
    option.textContent = kilde;
    kildeFilter.appendChild(option);
  });
}

function filtrerOpskrifter() {
  const soegetekst = soegefelt.value.trim().toLowerCase();
  const maxAlder = Number(alderFilter.value);
  const kilde = kildeFilter.value;
  const kunFrysbare = frysFilter.getAttribute("aria-pressed") === "true";
  const kunFavoritter = favoritFilter.getAttribute("aria-pressed") === "true";

  return alleOpskrifter.filter((o) => {
    if (soegetekst && !o.navn.toLowerCase().includes(soegetekst)) return false;
    if (valgtType !== "alle" && o.type !== valgtType) return false;
    if (o.alderFraMdr > maxAlder) return false;
    if (kilde && o.kilde.navn !== kilde) return false;
    if (kunFrysbare && !o.frysbar) return false;
    if (kunFavoritter && !erFavorit(o.id)) return false;
    return true;
  });
}

function lavOpskriftKort(opskrift) {
  const link = document.createElement("a");
  link.className = "opskrift-kort";
  link.href = `opskrift.html?id=${encodeURIComponent(opskrift.id)}`;

  const favorit = erFavorit(opskrift.id);

  link.innerHTML = `
    <button class="favorit-knap" type="button" aria-label="${favorit ? "Fjern favorit" : "Tilføj favorit"}" aria-pressed="${favorit}">${favorit ? "❤️" : "🤍"}</button>
    <h3>${opskrift.navn}</h3>
    <div class="kort-badges">
      <span class="badge">${opskrift.type}</span>
      <span class="badge">Fra ${opskrift.alderFraMdr} mdr.</span>
      ${opskrift.frysbar ? '<span class="badge">❄️ Frysbar</span>' : ""}
    </div>
    <p class="kort-tid">${opskrift.tidMin} min.</p>
  `;

  const favoritKnap = link.querySelector(".favorit-knap");
  favoritKnap.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    skiftFavorit(opskrift.id);
    visOpskrifter();
  });

  return link;
}

function visOpskrifter() {
  const resultater = filtrerOpskrifter();
  listeContainer.innerHTML = "";
  resultater.forEach((o) => listeContainer.appendChild(lavOpskriftKort(o)));

  if (resultater.length === 0) {
    antalResultater.textContent = "Ingen opskrifter matcher – prøv at ændre søgning eller filtre.";
  } else {
    antalResultater.textContent = `${resultater.length} opskrift${resultater.length === 1 ? "" : "er"}`;
  }
}

function tilfoejTogglePil(knap) {
  knap.addEventListener("click", () => {
    const aktiv = knap.getAttribute("aria-pressed") === "true";
    knap.setAttribute("aria-pressed", aktiv ? "false" : "true");
    knap.classList.toggle("pill-aktiv", !aktiv);
    visOpskrifter();
  });
}

tilfoejTogglePil(frysFilter);
tilfoejTogglePil(favoritFilter);

soegefelt.addEventListener("input", visOpskrifter);
alderFilter.addEventListener("change", visOpskrifter);
kildeFilter.addEventListener("change", visOpskrifter);

hentOpskrifter().then((opskrifter) => {
  alleOpskrifter = opskrifter;
  opretTypePills();
  opretKildeFilter(opskrifter);
  visOpskrifter();
});
