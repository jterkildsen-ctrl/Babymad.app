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

const container = document.getElementById("indkoeb-indhold");

function grupperEfterAfdeling(liste) {
  const grupper = {};
  liste.forEach((vare) => {
    if (!grupper[vare.afdeling]) grupper[vare.afdeling] = [];
    grupper[vare.afdeling].push(vare);
  });
  return grupper;
}

function visIndkoebsliste() {
  const liste = hentIndkoebsliste();

  if (liste.length === 0) {
    container.innerHTML = `
      <p class="antal-resultater">Indkøbslisten er tom.</p>
      <p>Gå ind på en opskrift og tryk "Tilføj til indkøbsliste" for at komme i gang.</p>
    `;
    return;
  }

  const grupper = grupperEfterAfdeling(liste);
  const afdelinger = Object.keys(grupper).sort(
    (a, b) => AFDELING_RAEKKEFOELGE.indexOf(a) - AFDELING_RAEKKEFOELGE.indexOf(b)
  );

  let html = `<button id="ryd-knap" class="pill" type="button">🗑 Ryd hele listen</button>`;

  afdelinger.forEach((afdeling) => {
    html += `<h2>${afdeling}</h2><ul class="indkoeb-liste">`;
    grupper[afdeling].forEach((vare) => {
      const tekst =
        vare.koebGram !== undefined
          ? `${vare.navn} (${formatKoebForslag(vare.koebGram, INGREDIENS_KOEB[vare.navn].koeb)})`
          : `${vare.navn} – ${formatMaengde(vare.maengde)} ${vare.enhed}`;
      html += `
        <li class="indkoeb-vare" data-id="${vare.id}">
          <span class="vare-tekst">${tekst}</span>
          <button class="slet-knap" type="button" aria-label="Slet ${vare.navn}">✕</button>
        </li>
      `;
    });
    html += `</ul>`;
  });

  container.innerHTML = html;

  container.querySelectorAll(".slet-knap").forEach((knap) => {
    knap.addEventListener("click", () => {
      const id = knap.closest(".indkoeb-vare").dataset.id;
      fjernFraIndkoebsliste(id);
      visIndkoebsliste();
    });
  });

  document.getElementById("ryd-knap").addEventListener("click", () => {
    if (confirm("Vil du slette alle varer fra indkøbslisten?")) {
      ryddIndkoebsliste();
      visIndkoebsliste();
    }
  });
}

visIndkoebsliste();
