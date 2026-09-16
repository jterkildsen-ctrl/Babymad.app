// Opslagstabel: hvordan omregnes opskrifternes mål (dl, spsk, tsk...) til gram/ml,
// og hvordan købes ingrediensen typisk ind (pakke, dåse, glas, stykvis)?
// Bruges til at lægge samme ingrediens sammen på tværs af opskrifter og til at
// foreslå en realistisk indkøbsmængde i stedet for fx "1 spsk" på indkøbslisten.
//
// koeb.type "vaegt": sælges i faste pakkestørrelser (g eller ml) – foreslår "min. X kg/g/l/ml".
// koeb.type "stk": sælges stykvis (dåse, glas, citron...) – foreslår "min. X <enhedNavn>".

const INGREDIENS_KOEB = {
  "havregryn": { perDl: 90, perSpsk: 9, koeb: { type: "vaegt", stoerrelseG: 500 } },
  "hirseflager": { perDl: 70, perSpsk: 7, koeb: { type: "vaegt", stoerrelseG: 500 } },
  "rugmel": { perDl: 60, perSpsk: 6, koeb: { type: "vaegt", stoerrelseG: 1000 } },
  "hvedemel": { perDl: 60, perSpsk: 6, perTsk: 2, koeb: { type: "vaegt", stoerrelseG: 1000 } },
  "sukker": { perDl: 85, perTsk: 4, koeb: { type: "vaegt", stoerrelseG: 1000 } },
  "olie": { perSpsk: 10, perTsk: 3, koeb: { type: "vaegt", stoerrelseG: 500, maalenhed: "ml" } },
  "olivenolie": { perSpsk: 10, koeb: { type: "vaegt", stoerrelseG: 500, maalenhed: "ml" } },
  "smør": { perSpsk: 14, koeb: { type: "vaegt", stoerrelseG: 200 } },
  "citronsaft": {
    perSpsk: 15,
    perTsk: 5,
    koeb: { type: "stk", stoerrelseG: 45, enhedNavn: "citron", enhedNavnFlertal: "citroner" },
  },
  "kokosmælk, light": {
    perDl: 100,
    koeb: { type: "stk", stoerrelseG: 400, enhedNavn: "dåse kokosmælk", enhedNavnFlertal: "dåser kokosmælk" },
  },
  "tomatpuré": {
    perSpsk: 15,
    koeb: { type: "stk", stoerrelseG: 140, enhedNavn: "tube tomatpuré", enhedNavnFlertal: "tuber tomatpuré" },
  },
  "flåede tomater": {
    koeb: { type: "stk", stoerrelseG: 400, enhedNavn: "dåse flåede tomater", enhedNavnFlertal: "dåser flåede tomater" },
  },
  "kikærter, kogte": {
    koeb: { type: "stk", stoerrelseG: 240, enhedNavn: "dåse kikærter", enhedNavnFlertal: "dåser kikærter" },
  },
  "oregano, tørret": {
    perTsk: 1,
    koeb: { type: "stk", stoerrelseG: 10, enhedNavn: "glas tørret oregano", enhedNavnFlertal: "glas tørret oregano" },
  },
  "karry": {
    perTsk: 2,
    koeb: { type: "stk", stoerrelseG: 30, enhedNavn: "glas karry", enhedNavnFlertal: "glas karry" },
  },
  "spidskommen, stødt": {
    perTsk: 2,
    koeb: { type: "stk", stoerrelseG: 25, enhedNavn: "glas stødt spidskommen", enhedNavnFlertal: "glas stødt spidskommen" },
  },
  "basilikum, tørret": {
    perSpsk: 3,
    koeb: { type: "stk", stoerrelseG: 10, enhedNavn: "glas tørret basilikum", enhedNavnFlertal: "glas tørret basilikum" },
  },
  "gurkemeje": {
    perSpsk: 6,
    koeb: { type: "stk", stoerrelseG: 30, enhedNavn: "glas gurkemeje", enhedNavnFlertal: "glas gurkemeje" },
  },
  "tahin (sesamsmør)": {
    perSpsk: 15,
    koeb: { type: "stk", stoerrelseG: 300, enhedNavn: "glas tahin", enhedNavnFlertal: "glas tahin" },
  },
  "mayonnaise": {
    perSpsk: 15,
    koeb: { type: "stk", stoerrelseG: 400, enhedNavn: "glas mayonnaise", enhedNavnFlertal: "glas mayonnaise" },
  },
  "A38": {
    perSpsk: 15,
    koeb: { type: "stk", stoerrelseG: 1000, enhedNavn: "karton A38", enhedNavnFlertal: "kartoner A38" },
  },
};

// Omregner en mængde + enhed fra en opskrift til gram (eller ml), så det kan lægges
// sammen med samme ingrediens fra andre opskrifter. Returnerer null, hvis enheden
// ikke kendes for denne ingrediens (så bruges opskriftens egne tal i stedet).
function beregnGram(ingrediensEntry, maengde, enhed) {
  if (enhed === "g" || enhed === "ml") return maengde;
  if (enhed === "kg" || enhed === "l") return maengde * 1000;
  if (enhed === "dl" && ingrediensEntry.perDl) return maengde * ingrediensEntry.perDl;
  if (enhed === "spsk" && ingrediensEntry.perSpsk) return maengde * ingrediensEntry.perSpsk;
  if (enhed === "tsk" && ingrediensEntry.perTsk) return maengde * ingrediensEntry.perTsk;
  if ((enhed === "dåse" || enhed === "stk") && ingrediensEntry.koeb.stoerrelseG) {
    return maengde * ingrediensEntry.koeb.stoerrelseG;
  }
  return null;
}

// Formaterer en gram-mængde til en realistisk indkøbstekst, fx "min. 1 kg" eller "min. 2 dåser flåede tomater".
function formatKoebForslag(gram, koeb) {
  const antal = Math.ceil(gram / koeb.stoerrelseG);

  if (koeb.type === "stk") {
    const navn = antal === 1 ? koeb.enhedNavn : koeb.enhedNavnFlertal;
    return `min. ${antal} ${navn}`;
  }

  const totalG = antal * koeb.stoerrelseG;
  const brugKilo = totalG >= 1000;
  const tal = brugKilo ? formatMaengde(totalG / 1000) : totalG;
  const enhedTekst = koeb.maalenhed === "ml" ? (brugKilo ? "l" : "ml") : (brugKilo ? "kg" : "g");
  return `min. ${tal} ${enhedTekst}`;
}
