const DAGE = ["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"];
const MAALTIDER = ["morgen", "middag", "aften"];
const MAALTID_LABEL = { morgen: "Morgen", middag: "Middag", aften: "Aften" };

// Hvilke opskriftstyper der foretrækkes til hvert måltid, når "Foreslå uge" bruges.
// Man kan altid selv vælge en anden type i dropdown-menuen.
const MAALTID_TYPER = {
  morgen: ["grød"],
  middag: ["grøntsagsmos", "middag/familiemad"],
  aften: ["middag/familiemad", "pålæg", "grøntsagsmos"],
};

const UGEPLAN_NOEGLE = "babymad-ugeplan";

let alleOpskrifter = [];
let ugeplan = tomUgeplan();
let alderMdr = null;

function tomUgeplan() {
  const plan = {};
  DAGE.forEach((dag) => {
    plan[dag] = { morgen: null, middag: null, aften: null };
  });
  return plan;
}

function hentUgeplan() {
  const fuld = tomUgeplan();
  try {
    const gemt = localStorage.getItem(UGEPLAN_NOEGLE);
    if (!gemt) return fuld;
    const plan = JSON.parse(gemt);
    DAGE.forEach((dag) => {
      MAALTIDER.forEach((maaltid) => {
        if (plan[dag] && plan[dag][maaltid]) fuld[dag][maaltid] = plan[dag][maaltid];
      });
    });
  } catch {
    // ignorer ugyldig gemt data og brug en tom uge
  }
  return fuld;
}

function gemUgeplan() {
  localStorage.setItem(UGEPLAN_NOEGLE, JSON.stringify(ugeplan));
}

function kapitaliser(tekst) {
  return tekst.charAt(0).toUpperCase() + tekst.slice(1);
}

function opskriftFra(id) {
  return alleOpskrifter.find((o) => o.id === id) || null;
}

function alderTilladteOpskrifter() {
  if (alderMdr === null) return alleOpskrifter;
  return alleOpskrifter.filter((o) => o.alderFraMdr <= alderMdr);
}

function visAlderInfo() {
  const alderInfo = document.getElementById("alder-info");
  if (alderMdr === null) {
    alderInfo.innerHTML = 'Tilføj barnets fødselsdato i <a href="indstillinger.html">Indstillinger</a> for en alderstilpasset ugeplan og regeltjek.';
  } else {
    alderInfo.textContent = `Barnet er ${alderMdr} måned${alderMdr === 1 ? "" : "er"} gammelt – kun opskrifter, der passer til alderen, kan vælges herunder.`;
  }
}

function tegnUge() {
  const container = document.getElementById("uge-liste");
  const tilladte = alderTilladteOpskrifter();

  if (tilladte.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = DAGE.map(
    (dag) => `
    <div class="dag-kort">
      <h2>${kapitaliser(dag)}</h2>
      <div class="maaltid-raekke">
        ${MAALTIDER.map(
          (maaltid) => `
          <div class="maaltid-slot">
            <label>${MAALTID_LABEL[maaltid]}</label>
            <select data-dag="${dag}" data-maaltid="${maaltid}">
              <option value="">– Vælg opskrift –</option>
              ${tilladte
                .map(
                  (o) =>
                    `<option value="${o.id}" ${ugeplan[dag][maaltid] === o.id ? "selected" : ""}>${o.navn}</option>`
                )
                .join("")}
            </select>
          </div>
        `
        ).join("")}
      </div>
    </div>
  `
  ).join("");

  container.querySelectorAll("select").forEach((select) => {
    select.addEventListener("change", () => {
      const { dag, maaltid } = select.dataset;
      ugeplan[dag][maaltid] = select.value || null;
      gemUgeplan();
      visAdvarsler();
    });
  });
}

function koerRegeltjek() {
  const advarsler = [];

  if (alderMdr === null) return advarsler;

  if (alderMdr < 4) {
    advarsler.push({
      niveau: "info",
      ikon: "🍼",
      tekst: "Barnet er under 4 måneder og skal kun have mælk – ugeplanen er ikke relevant endnu.",
    });
    return advarsler;
  }

  let risTaeller = 0;
  let aegTaeller = 0;
  let harUdfyldtNoget = false;

  DAGE.forEach((dag) => {
    const dagensOpskrifter = MAALTIDER.map((m) => ugeplan[dag][m]).filter(Boolean).map(opskriftFra).filter(Boolean);
    if (dagensOpskrifter.length > 0) harUdfyldtNoget = true;

    if (alderMdr >= 6 && dagensOpskrifter.length > 0) {
      const harKoedFisk = dagensOpskrifter.some((o) => o.flag.kodEllerFisk);
      if (!harKoedFisk) {
        advarsler.push({ niveau: "advarsel", ikon: "⚠️", tekst: `${kapitaliser(dag)}: mangler kød eller fisk som jernkilde.` });
      }
    }

    if (alderMdr < 6) {
      const groedAntal = dagensOpskrifter.filter((o) => o.type === "grød").length;
      if (groedAntal > 2) {
        advarsler.push({
          niveau: "tip",
          ikon: "💡",
          tekst: `${kapitaliser(dag)}: ${groedAntal} grødmåltider – typisk er 1-2 om dagen nok.`,
        });
      }
    }

    MAALTIDER.forEach((maaltid) => {
      const opskrift = opskriftFra(ugeplan[dag][maaltid]);
      if (!opskrift) return;

      if (opskrift.type === "frugtmos") {
        advarsler.push({
          niveau: "tip",
          ikon: "💡",
          tekst: `${kapitaliser(dag)} (${MAALTID_LABEL[maaltid].toLowerCase()}): frugtmos er tænkt som tilbehør/dessert, ikke et selvstændigt måltid.`,
        });
      }
      if (opskrift.alderFraMdr > alderMdr) {
        advarsler.push({
          niveau: "advarsel",
          ikon: "⚠️",
          tekst: `${kapitaliser(dag)} (${MAALTID_LABEL[maaltid].toLowerCase()}): "${opskrift.navn}" passer først fra ${opskrift.alderFraMdr} måneder.`,
        });
      }
      if (opskrift.flag.ris) risTaeller++;
      if (opskrift.flag.aeg) aegTaeller++;
    });
  });

  if (risTaeller > 3) {
    advarsler.push({
      niveau: "advarsel",
      ikon: "⚠️",
      tekst: `Ris/risgrød optræder ${risTaeller} gange i ugeplanen – Sundhedsstyrelsen anbefaler højst 2-3 gange om ugen.`,
    });
  }

  if (harUdfyldtNoget && aegTaeller === 0) {
    advarsler.push({ niveau: "tip", ikon: "💡", tekst: "Husk evt. ca. ½ lille hårdkogt æg et par gange om ugen." });
  }

  return advarsler;
}

function visAdvarsler() {
  const container = document.getElementById("advarsler");
  const advarsler = koerRegeltjek();

  if (alderMdr !== null && alderMdr >= 4 && advarsler.length === 0) {
    container.innerHTML = '<p class="badge badge-groen">✅ Ingen advarsler fra regeltjekket lige nu</p>';
    return;
  }

  container.innerHTML = advarsler.map((a) => `<p class="advarsel advarsel-${a.niveau}">${a.ikon} ${a.tekst}</p>`).join("");
}

function foreslaaUge() {
  const tilladte = alderTilladteOpskrifter();
  if (tilladte.length === 0) return;

  const brugsTaeller = {};
  tilladte.forEach((o) => {
    brugsTaeller[o.id] = 0;
  });

  DAGE.forEach((dag) => {
    const dagensValgte = new Set();
    let dagHarKoedFisk = false;

    MAALTIDER.forEach((maaltid, index) => {
      const erSidsteMaaltid = index === MAALTIDER.length - 1;
      const foretrukneTyper = MAALTID_TYPER[maaltid];
      let pulje = tilladte.filter((o) => foretrukneTyper.includes(o.type) && !dagensValgte.has(o.id));

      // Sørg for mindst én kød/fisk-kilde om dagen fra 6 måneder: ved sidste måltid,
      // hvis dagen stadig mangler det, indsnævres puljen til kød/fisk-opskrifter.
      if (alderMdr >= 6 && erSidsteMaaltid && !dagHarKoedFisk) {
        const koedFiskPulje = pulje.filter((o) => o.flag.kodEllerFisk);
        if (koedFiskPulje.length > 0) {
          pulje = koedFiskPulje;
        } else {
          const bredKoedFiskPulje = tilladte.filter((o) => o.flag.kodEllerFisk && !dagensValgte.has(o.id));
          if (bredKoedFiskPulje.length > 0) pulje = bredKoedFiskPulje;
        }
      }

      if (pulje.length === 0) pulje = tilladte.filter((o) => !dagensValgte.has(o.id));
      if (pulje.length === 0) pulje = tilladte;

      pulje = [...pulje].sort((a, b) => brugsTaeller[a.id] - brugsTaeller[b.id] || Math.random() - 0.5);
      const valgt = pulje[0];

      ugeplan[dag][maaltid] = valgt.id;
      dagensValgte.add(valgt.id);
      brugsTaeller[valgt.id] += 1;
      if (valgt.flag.kodEllerFisk) dagHarKoedFisk = true;
    });
  });

  gemUgeplan();
  tegnUge();
  visAdvarsler();
}

document.getElementById("foreslaa-knap").addEventListener("click", foreslaaUge);

document.getElementById("ryd-uge-knap").addEventListener("click", () => {
  if (confirm("Vil du rydde hele ugeplanen?")) {
    ugeplan = tomUgeplan();
    gemUgeplan();
    tegnUge();
    visAdvarsler();
  }
});

hentOpskrifter().then((opskrifter) => {
  alleOpskrifter = opskrifter;
  ugeplan = hentUgeplan();
  alderMdr = beregnAlderIMdr(hentFoedselsdato());
  visAlderInfo();
  tegnUge();
  visAdvarsler();
});
