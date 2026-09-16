const foedselsdatoFelt = document.getElementById("foedselsdato");
const alderVisning = document.getElementById("alder-visning");

function opdaterAlderVisning() {
  const alderMdr = beregnAlderIMdr(foedselsdatoFelt.value);
  if (alderMdr === null) {
    alderVisning.textContent = "";
    return;
  }
  alderVisning.textContent = `Barnet er ${alderMdr} måned${alderMdr === 1 ? "" : "er"} gammelt.`;
}

foedselsdatoFelt.value = hentFoedselsdato();
opdaterAlderVisning();

foedselsdatoFelt.addEventListener("change", () => {
  gemFoedselsdato(foedselsdatoFelt.value);
  opdaterAlderVisning();
});
