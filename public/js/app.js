(function () {
  const btnToggleMode = document.getElementById("btn-toggle-mode");
  const btnScan = document.getElementById("btn-scan");

  let modoCelular = false;

  // Manipula a alternância entre os modos
  btnToggleMode.addEventListener("click", () => {
    modoCelular = !modoCelular;
    btnToggleMode.textContent = modoCelular ? "Modo Desktop" : "Modo Celular";
    btnScan.style.display = modoCelular ? "inline-block" : "none";

    if (modoCelular) {
      startScanner();
    } else {
      stopScanner();
      resultEl.textContent = "";
    }
  });
})();
