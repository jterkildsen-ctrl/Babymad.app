const parametre = new URLSearchParams(window.location.search);
const opskriftId = parametre.get("id");
const indhold = document.getElementById("opskrift-indhold");
const titel = document.getElementById("opskrift-navn");

hentOpskrifter().then((opskrifter) => {
  const opskrift = opskrifter.find((o) => o.id === opskriftId);
  if (!opskrift) {
    indhold.innerHTML = "<p>Opskriften blev ikke fundet.</p>";
    return;
  }
  visOpskrift(opskrift);
});

function visOpskrift(o) {
  document.title = `${o.navn} – Babymad-kartotek`;
  titel.textContent = o.navn;

  const ingredienserHtml = o.ingredienser
    .map((ing) => `<li>${formatIngrediens(ing)}</li>`)
    .join("");

  const trinHtml = o.trin.map((t) => `<li>${t}</li>`).join("");

  indhold.innerHTML = `
    <div class="kort-badges">
      <span class="badge">${o.type}</span>
      <span class="badge">Fra ${o.alderFraMdr} mdr.</span>
      <span class="badge">${o.tidMin} min.</span>
      <span class="badge">${o.portioner} portioner</span>
      ${o.frysbar ? '<span class="badge">❄️ Frysbar</span>' : ""}
    </div>

    <h2>Ingredienser</h2>
    <ul class="ingrediens-liste">${ingredienserHtml}</ul>

    <h2>Sådan gør du</h2>
    <ol class="trin-liste">${trinHtml}</ol>

    <button id="tilfoej-knap" class="knap-primaer" type="button">
      🛒 Tilføj til indkøbsliste
    </button>
    <p id="tilfoej-kvittering" class="kvittering" hidden></p>

    <p class="kilde-tekst">
      Kilde: <a href="${o.kilde.url}" target="_blank" rel="noopener">${o.kilde.navn}</a>
    </p>
  `;

  const knap = document.getElementById("tilfoej-knap");
  const kvittering = document.getElementById("tilfoej-kvittering");
  knap.addEventListener("click", () => {
    tilfoejOpskriftTilIndkoebsliste(o);
    kvittering.innerHTML = '✅ Tilføjet til <a href="indkoeb.html">indkøbslisten</a>.';
    kvittering.hidden = false;
  });
}
