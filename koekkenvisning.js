const parametre = new URLSearchParams(window.location.search);
const opskriftId = parametre.get("id");

const indhold = document.getElementById("koekken-indhold");
const fremgang = document.getElementById("fremgang");
const koekkenTitel = document.getElementById("koekken-titel");
const afslutLink = document.getElementById("afslut-link");
const forrigeKnap = document.getElementById("forrige-knap");
const naesteKnap = document.getElementById("naeste-knap");

let opskrift = null;
let trinListe = [];
let nuvaerendeIndex = 0;
let timerInterval = null;
let timerSekunderTilbage = 0;
let wakeLock = null;

hentOpskrifter().then((opskrifter) => {
  opskrift = opskrifter.find((o) => o.id === opskriftId);
  if (!opskrift) {
    indhold.innerHTML = "<p>Opskriften blev ikke fundet.</p>";
    return;
  }

  document.title = `${opskrift.navn} – Køkkenvisning`;
  koekkenTitel.textContent = opskrift.navn;
  afslutLink.href = `opskrift.html?id=${encodeURIComponent(opskrift.id)}`;

  trinListe = [
    { type: "ingredienser" },
    ...opskrift.trin.map((tekst) => ({ type: "trin", tekst })),
    { type: "faerdig" },
  ];

  visTrin();
  aktiverWakeLock();
});

function udtraekMinutter(tekst) {
  const match = tekst.match(/(\d+)(?:-(\d+))?\s*minut/i);
  if (!match) return null;
  return match[2] ? parseInt(match[2], 10) : parseInt(match[1], 10);
}

function formatTid(sekunder) {
  const m = Math.floor(sekunder / 60).toString().padStart(2, "0");
  const s = (sekunder % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function visTrin() {
  ryddTimer();
  const trin = trinListe[nuvaerendeIndex];
  const total = trinListe.length;
  const antalTrin = total - 2;

  fremgang.textContent = `${nuvaerendeIndex + 1} / ${total}`;

  if (trin.type === "ingredienser") {
    indhold.innerHTML = `
      <h2>Ingredienser</h2>
      <ul class="ingrediens-liste ingrediens-liste-stor">
        ${opskrift.ingredienser.map((ing) => `<li>${formatIngrediens(ing)}</li>`).join("")}
      </ul>
    `;
  } else if (trin.type === "trin") {
    const trinNummer = nuvaerendeIndex;
    const minutter = udtraekMinutter(trin.tekst);
    indhold.innerHTML = `
      <p class="trin-nummer">Trin ${trinNummer} af ${antalTrin}</p>
      <p class="trin-tekst-stor">${trin.tekst}</p>
      <div id="timer-omraade"></div>
    `;
    if (minutter) opretTimer(minutter);
  } else {
    indhold.innerHTML = `
      <h2>🎉 Godt appetit!</h2>
      <p class="trin-tekst-stor">${opskrift.navn} er klar til at blive serveret.</p>
      <a class="knap-primaer knap-link" href="opskrift.html?id=${encodeURIComponent(opskrift.id)}">Tilbage til opskriften</a>
    `;
  }

  forrigeKnap.disabled = nuvaerendeIndex === 0;
  naesteKnap.disabled = nuvaerendeIndex === total - 1;
}

function opretTimer(minutter) {
  timerSekunderTilbage = minutter * 60;
  const omraade = document.getElementById("timer-omraade");
  omraade.innerHTML = `
    <div class="timer-boks">
      <p id="timer-visning" class="timer-visning">${formatTid(timerSekunderTilbage)}</p>
      <div class="filterbar">
        <button id="timer-start" class="pill" type="button">▶️ Start timer (${minutter} min)</button>
        <button id="timer-nulstil" class="pill" type="button" hidden>↺ Nulstil</button>
      </div>
    </div>
  `;
  document.getElementById("timer-start").addEventListener("click", startTimer);
  document.getElementById("timer-nulstil").addEventListener("click", () => opretTimer(minutter));
}

function startTimer() {
  const startKnap = document.getElementById("timer-start");
  const nulstilKnap = document.getElementById("timer-nulstil");
  const visning = document.getElementById("timer-visning");
  startKnap.hidden = true;
  nulstilKnap.hidden = false;

  timerInterval = setInterval(() => {
    timerSekunderTilbage -= 1;
    if (timerSekunderTilbage <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      visning.textContent = "⏰ Tiden er gået!";
      visning.classList.add("timer-faerdig");
      spilLyd();
      if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300]);
      return;
    }
    visning.textContent = formatTid(timerSekunderTilbage);
  }, 1000);
}

function spilLyd() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.4, 0.8].forEach((start) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + 0.3);
    });
  } catch {
    // lyd er ikke kritisk for funktionen
  }
}

function ryddTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

forrigeKnap.addEventListener("click", () => {
  if (nuvaerendeIndex > 0) {
    nuvaerendeIndex -= 1;
    visTrin();
  }
});

naesteKnap.addEventListener("click", () => {
  if (nuvaerendeIndex < trinListe.length - 1) {
    nuvaerendeIndex += 1;
    visTrin();
  }
});

async function aktiverWakeLock() {
  if (!("wakeLock" in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    const badge = document.getElementById("wakelock-badge");
    badge.hidden = false;
    wakeLock.addEventListener("release", () => {
      badge.hidden = true;
      wakeLock = null;
    });
  } catch {
    // kunne ikke aktivere wake lock, fx pga. batterisparefunktion – ikke kritisk
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && !wakeLock) {
    aktiverWakeLock();
  }
});
