# Babymad-kartotek – projektbeskrivelse

## Formål
En køkken-app til iPad, der hjælper os med at lave babymad efter Sundhedsstyrelsens anbefalinger:
et opskriftskartotek, forslag ud fra hvad vi har i køleskabet, en ugeplan til mealprep og en indkøbsliste.
Appen bruges kun på én iPad i køkkenet. Ingen login, ingen synkronisering mellem enheder.

## Om brugeren (vigtigt for arbejdsformen)
- Jesper er Business Analyst (Excel/Power BI), men kan ikke Python eller webudvikling.
- Forklar på dansk og i små trin. Kør selv kommandoer, og fortæl kort hvad de gør.
- Når Jesper skal gøre noget selv (fx åbne en side i browseren eller oprette en konto), så skriv præcis hvad han skal klikke på.
- Ret filerne direkte i projektmappen. Lav ikke kopier som `app_v2.html` – brug git til historik.
- Byg én funktion ad gangen, vis resultatet, og spørg før næste trin.

## Teknik
- Almindelig web-app: HTML, CSS og JavaScript uden framework og uden build-step, så den er nem at forstå og hoste.
- PWA: web app manifest + service worker, så den kan lægges på iPad'ens hjemmeskærm og virker offline.
- Opskrifter ligger i `data/recipes.json` i projektet.
- Brugerdata (køleskab, ugeplan, indkøbsliste, favoritter, barnets fødselsdato) gemmes lokalt på iPad'en (IndexedDB eller localStorage).
- Eksport/import af alle brugerdata som JSON-fil (backup), da Safari kan rydde lokale data.
- Hosting: GitHub Pages (gratis). Jesper opretter selv GitHub-kontoen; guide ham igennem resten.
- Design til iPad i køkkenet: store knapper, stor tekst, virker i både liggende og stående format. Hold skærmen tændt i opskriftsvisning, hvis browseren understøtter det (Wake Lock).

## Funktioner i version 1 (i denne rækkefølge)
1. **Skelet**: Forside med navigation (Opskrifter, Køleskab, Ugeplan, Indkøb, Indstillinger). Kan åbnes lokalt i browseren.
2. **Opskriftskartotek**: Søg og filtrér på alder, type (grød, grøntsagsmos, frugtmos, middag/familiemad, pålæg), frysbar og kilde. Start med 15-20 opskrifter fra kilderne nedenfor.
3. **Køleskab**: Afkryds ingredienser vi har. Foreslå opskrifter sorteret efter færrest manglende ingredienser.
4. **Ugeplan**: 7 dage × måltider (morgen, middag, aften). Vælg selv eller tryk "Foreslå uge". Kør regeltjek (se nedenfor) og vis advarsler tydeligt, men venligt.
5. **Indkøbsliste og mealprep**: Saml ingredienser for ugen, skalér efter antal portioner, træk det fra, vi har i køleskabet, og gruppér efter butiksafdeling. Lav en prep-plan: hvad der koges samme dag, hvad der fryses i portioner, og hvornår det skal bruges.
   - **"Tilføj til indkøbsliste" fra en opskrift**: *V1 (bygget)* – knappen på opskriftssiden lægger opskriftens ingredienser på indkøbslisten. Vand tilføjes aldrig. Ved mælk-valg (modermælk/modermælkserstatning) tilføjes kun modermælkserstatning. Ens ingredienser (samme navn, enhed og afdeling) lægges sammen i stedet for at give dobbelte linjer. Listen kan ses og ryddes for enkelte varer eller helt på Indkøb-siden. *Fremtidig forbedring (kræver Køleskab)*: tjek hver ingrediens op mod Køleskab. Ingredienser der slet ikke er afkrydset i køleskabet, tilføjes direkte. For ingredienser der ER afkrydset (vi har den, men ikke nødvendigvis nok), spørger appen: "Hvor meget har du af [ingrediens] i køleskabet?" og sammenligner svaret med den mængde, opskriften kræver. Er der ikke nok, tilføjes kun den manglende mængde. Er der nok, tilføjes ingrediensen slet ikke.
6. **Køkkenvisning**: Én opskrift ad gangen, trin for trin, med stor tekst og timer.
7. **Online og offline**: PWA-opsætning og udgivelse på GitHub Pages.

## Regeltjek (Sundhedsstyrelsen, "Mad til små")
Barnets alder beregnes ud fra fødselsdatoen i Indstillinger, og reglerne afhænger af alderen.
- Under 4 måneder: kun mælk – appen viser ingen opskrifter.
- 4-6 måneder: grød, grøntsagsmos og frugtmos. Typisk 1-2 grødmåltider og evt. et måltid grøntsagsmos om dagen. Frugtmos er topping/dessert, ikke et selvstændigt måltid.
- Fra 6 måneder: kød eller fisk hver dag (jern). Advar hvis en dag mangler det. Fisk dampet, kogt eller ovnbagt.
- Hjemmelavet grød og mos: ½-1 tsk fedtstof + modermælk eller modermælkserstatning pr. portion. Ved frysning: tilsæt fedt og mælk først ved opvarmning.
- Mælk i opskrifter: Skriv altid begge muligheder med mængde, fx "Modermælk 0,5 dl eller modermælkserstatning 0,5 dl". Det gælder i ingredienslister, trin og køkkenvisning. Mængder for modermælkserstatning er altid færdigblandet, så de svarer til modermælk. I indkøbslisten medtages kun modermælkserstatning.
- Intet salt under 1 år. Ingen honning under 1 år (brød bagt med honning er ok).
- Ris og risgrød: højst 2-3 gange om ugen. Ingen risdrik eller riskiks.
- Spinat, rødbede, fennikel, selleri: ikke under 6 måneder, derefter kun små mængder indtil 1 år.
- Æg: kun hårdkogt/gennemvarmet. Mind om ½ lille hårdkogt æg 2 gange om ugen.
- Komælk: ikke som drik under 1 år. I maden først fra 9 måneder, maks. 1 dl om dagen.
- Surmælksprodukter (yoghurt naturel, A38, tykmælk af sødmælkstypen): først fra 9 måneder, ½ dl stigende til 1 dl. Ingen skyr, ymer, ylette, kvark før 2 år.
- Tun (også dåsetun) og store rovfisk: ikke under 3 år.
- Frosne bær skal koges.
- Rosiner: maks. 50 g om ugen. Begræns kanel.
- Hårde madvarer (hele rå gulerødder, nødder, popcorn) og hele vindruer: ikke til små børn. Vindruer skæres i stykker.
- Holdbarhed: babymad på køl ca. 1 døgn i tæt beholder; på frost højst ca. 1 måned. Grød koges igennem igen før servering.

## Datastruktur for en opskrift (forslag)
```json
{
  "id": "kartoffel-guleroed-mos",
  "navn": "Kartoffel-grøntsagsmos med gulerod",
  "type": "grøntsagsmos",
  "alderFraMdr": 4,
  "portioner": 2,
  "ingredienser": [
    { "navn": "kartoffel", "maengde": 125, "enhed": "g", "afdeling": "frugt og grønt" },
    { "navn": "gulerod", "maengde": 75, "enhed": "g", "afdeling": "frugt og grønt" },
    { "navn": "fedtstof", "maengde": 1, "enhed": "tsk", "afdeling": "køl" },
    { "navn": "mælk", "valg": ["modermælk", "modermælkserstatning (færdigblandet)"], "maengde": 0.5, "enhed": "dl", "afdeling": "baby" }
  ],
  "trin": ["Kort beskrivelse med egne ord", "..."],
  "tidMin": 20,
  "frysbar": true,
  "tilsaetVedOpvarmning": ["fedtstof", "mælk"],
  "flag": { "kodEllerFisk": false, "ris": false, "nitratGroent": false, "aeg": false, "komaelk": false },
  "kilde": { "navn": "Mad til små (SST)", "url": "https://www.sst.dk/udgivelser/2020/mad-til-smaa-fra-maelk-til-familiens-mad" }
}
```

## Kilder
Brug kun opskrifter og regler fra disse kilder. Opfind ikke opskrifter; hvis Jesper tilføjer egne, markeres kilden som "Egen".
- Sundhedsstyrelsen m.fl.: *Mad til små – fra mælk til familiens mad* (PDF ligger i projektmappen).
  https://sundhedspleje.aarhus.dk/media/2kij2txh/mad-til-smaa-fra-maelk-til-familiens-mad.pdf
- Sundhedsplejen Aarhus: https://sundhedspleje.aarhus.dk/raad-og-vejledning/kost-og-ernaering-til-boern/mad-til-smaa-boern
- Mad til børn (Mejeriforeningen): https://madtilboern.dk

Appen er offentligt tilgængelig på GitHub Pages. Skriv derfor opskrifternes trin kort med egne ord og link til kilden i stedet for at kopiere bøgernes tekst.

## Uden for version 1 (senere idéer)
- Scanning af stregkoder eller kvitteringer til køleskabet.
- Log over hvad barnet har smagt og reaktioner.
- Familiemad-opskrifter fra 8-9 måneder.
