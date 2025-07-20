(function () {
  const btnToggleMode = document.getElementById("btn-toggle-mode");
  const btnScan = document.getElementById("btn-scan");
  const videoEl = document.getElementById("preview");
  const resultEl = document.getElementById("resultado");

  const manualInputEAN = document.getElementById("manual-ean");
  const btnManualEAN = document.getElementById("btn-manual");
  const manualInputMaterial = document.getElementById("manual-material");
  const btnManualMaterial = document.getElementById("btn-manual-material");

  const hints = new Map();
  hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [ZXing.BarcodeFormat.EAN_13]);
  const codeReader = new ZXing.BrowserMultiFormatReader(hints);

  let modoCelular = false;
  let scanning = false;

  let produtos = {}, produtosPorMaterial = {};
  fetch("./dados/produtos.json")
    .then(r => r.json())
    .then(dados => {
      const lista = dados[0] || [];
      lista.forEach(item => {
        const ean = String(item["Código EAN/UPC"]);
        const material = String(item.Material);
        const descricao = item["Texto breve material"] || "Sem descrição";
        produtos[ean] = { descricao, material };
        produtosPorMaterial[material] = { descricao, ean, material };
      });
    })
    .catch(err => {
      console.error(err);
      resultEl.textContent = "Falha ao carregar base de produtos.";
    });

  async function startScanner() {
    if (scanning) return;
    scanning = true;

    btnScan.textContent = "Parar Scanner";
    resultEl.textContent = "Escaneando…";
    toggleManualInputs(false);
    videoEl.style.display = "block"; // Exibe o vídeo

    if (videoEl.srcObject) {
      videoEl.srcObject.getTracks().forEach(track => track.stop());
      videoEl.srcObject = null;
    }

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false
        });
      } catch (errRear) {
        console.warn("Câmera traseira indisponível, usando a frontal.", errRear);
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      videoEl.srcObject = stream;

      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log("Vídeo reproduzido com sucesso.");
        }).catch(err => {
          console.error("Erro ao reproduzir o vídeo:", err);
          resultEl.textContent = "Erro ao acessar a câmera: " + (err.message || err);
          stopScanner();
        });
      }

      codeReader.decodeFromStream(stream, videoEl, (result, err) => {
        if (result) {
          console.log("Código lido:", result.text);
          handleCodeEAN(result.text);
          stopScanner(); // Fecha a câmera após a leitura
        }
        if (err && !(err instanceof ZXing.NotFoundException)) {
          console.warn("Erro de leitura:", err);
        }
      });
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      resultEl.textContent = "Erro ao acessar a câmera: " + (err.message || err);
      stopScanner();
    }
  }

  function stopScanner() {
    if (!scanning) return;
    scanning = false;

    btnScan.textContent = "Iniciar Scanner";
    resultEl.textContent = "Scanner pausado.";
    codeReader.reset();

    const stream = videoEl.srcObject;
    if (stream) stream.getTracks().forEach(t => t.stop());
    videoEl.srcObject = null;
    videoEl.style.display = "none"; // Oculta o vídeo
    toggleManualInputs(true);
  }

  function handleCodeEAN(ean) {
    const p = produtos[ean];
    if (p) {
      resultEl.innerHTML = `Material: ${p.material} | EAN: ${ean} — ${p.descricao}<br><button id="btn-site" style="margin-top:8px">Ver no site Quero‑Quero</button>`;
      if (navigator.vibrate) navigator.vibrate(100); // Vibra para notificação
      document.getElementById("btn-site").addEventListener("click", () => {
        const url = `https://www.queroquero.com.br/${p.material}?_q=${p.material}&map=ft`;
        window.open(url, "_blank");
      });
    } else {
      resultEl.textContent = `Código EAN ${ean} não encontrado.`;
    }
    manualInputEAN.value = "";
  }

  function buscarPorMaterial(mat) {
    const p = produtosPorMaterial[mat];
    if (p) {
      resultEl.innerHTML = `Material: ${p.material} | EAN: ${p.ean} — ${p.descricao}<br><button id="btn-site" style="margin-top:8px">Ver no site Quero‑Quero</button>`;
      if (navigator.vibrate) navigator.vibrate(100); // Vibra para notificação
      document.getElementById("btn-site").addEventListener("click", () => {
        const url = `https://www.queroquero.com.br/${p.material}?_q=${p.material}&map=ft`;
        window.open(url, "_blank");
      });
    } else {
      resultEl.textContent = `Material ${mat} não encontrado.`;
    }
    manualInputMaterial.value = "";
  }

  function toggleManualInputs(show) {
    const d = show ? "inline-block" : "none";
    manualInputEAN.style.display = d;
    btnManualEAN.style.display = d;
    manualInputMaterial.style.display = d;
    btnManualMaterial.style.display = d;
  }

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

  btnScan.addEventListener("click", () => (scanning ? stopScanner() : startScanner()));

  btnManualEAN.addEventListener("click", () => {
    const ean = manualInputEAN.value.trim();
    if (ean) handleCodeEAN(ean);
  });
  manualInputEAN.addEventListener("keypress", e => {
    if (e.key === "Enter") btnManualEAN.click();
  });

  btnManualMaterial.addEventListener("click", () => {
    const mat = manualInputMaterial.value.trim();
    if (mat) buscarPorMaterial(mat);
  });
  manualInputMaterial.addEventListener("keypress", e => {
    if (e.key === "Enter") btnManualMaterial.click();
  });

  // Estado inicial
  toggleManualInputs(true);
  btnScan.style.display = "none";
  videoEl.style.display = "none";
  resultEl.textContent = "";
})();
