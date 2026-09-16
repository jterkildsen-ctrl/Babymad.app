// Babymad-kartotek – fælles script, indlæses på alle sider

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      // Offline-understøttelse er ikke kritisk for at appen ellers virker
    });
  });
}
