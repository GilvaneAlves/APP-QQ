(function () {
  // --- Variáveis e elementos DOM ---
  const btnToggleMode = document.getElementById("btn-toggle-mode");
  const btnScan = document.getElementById("btn-scan");
  const videoEl = document.getElementById("preview");
  const resultEl = document.getElementById("resultado");

  const manualInputEAN = document.getElementById("manual-ean");
  const btnManualEAN = document.getElementById("btn-manual");
  const manualInputMaterial = document.getElementById("manual-material");
  const btnManualMaterial = document.getElementById("btn-manual-material");

  // --- Configura ZXing ---
  const hints = new Map();
  hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [ZXing.BarcodeFormat.EAN_13]);
  const codeReader = new ZXing.BrowserMultiFormatReader(hints);

  // --- Estado ---
  let modoCelular = false;
  let scanning = false;

  let produtos = {}, produtosPorMaterial = {};
  
  // --- Carrega produtos ---
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
      console.error("Erro ao carregar a base de dados:", err);
      resultEl.textContent = "Falha ao carregar base de produtos.";
    });

  // --- Funções do scanner ---
  async function startScanner() {
    if (scanning) return;
    scanning = true;

    btnScan.textContent = "Parar Scanner";
    resultEl.textContent = "Escaneando…";
    toggleManualInputs(false);
    videoEl.style.display = "block";

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
        await playPromise.catch(err => {
          console.error("Erro ao reproduzir o vídeo:", err);
          resultEl.textContent = "Erro ao acessar a câmera: " + (err.message || err);
          stopScanner();
        });
      }

      codeReader.decodeFromStream(stream, videoEl, (result, err) => {
        if (result) {
          console.log("Código lido:", result.text);
          handleCodeEAN(result.text);
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
    codeReader.reset();

    const stream = videoEl.srcObject;
    if (stream) stream.getTracks().forEach(t => t.stop());
    videoEl.srcObject = null;
    videoEl.style.display = "none";
    toggleManualInputs(true);
  }

  // --- Função para mostrar o produto na tela (reduz duplicação) ---
  function mostrarProduto(produto, ean) {
    resultEl.innerHTML = `
      <strong>Material:</strong> ${produto.material} <br>
      <strong>EAN:</strong> ${ean} <br>
      <strong>Descrição:</strong> ${produto.descricao} <br>
      <button id="btn-site" style="margin-top:8px">Ver no site Quero‑Quero</button>
    `;

    if (navigator.vibrate) navigator.vibrate(100);

    requestAnimationFrame(() => {
      const btnSite = document.getElementById("btn-site");
      if (btnSite) {
        btnSite.addEventListener("click", () => {
          const url = `https://www.queroquero.com.br/${produto.material}?_q=${produto.material}&map=ft`;
          window.open(url, "_blank");
        });
      }

      setTimeout(() => {
        stopScanner();
      }, 150);
    });
  }

  // --- Funções de busca e manipulação ---
  function handleCodeEAN(ean) {
    console.log("Procurando pelo código EAN:", ean);

    if (produtos[ean]) {
      mostrarProduto(produtos[ean], ean);
    } else {
      resultEl.innerHTML = `Código EAN <strong>${ean}</strong> não encontrado. <br><br> Verifique se o formato do código está correto ou se ele não pertence à nossa base de dados.`;
      stopScanner();
    }
    manualInputEAN.value = ""; // limpa o input EAN após a busca
  }

  function buscarPorMaterial(mat) {
    const p = produtosPorMaterial[mat];
    if (p) {
      mostrarProduto(p, p.ean);
    } else {
      resultEl.textContent = `Material ${mat} não encontrado.`;
    }
    manualInputMaterial.value = ""; // limpa o input Material após a busca
  }

  function toggleManualInputs(show) {
    const d = show ? "inline-block" : "none";
    manualInputEAN.style.display = d;
    btnManualEAN.style.display = d;
    manualInputMaterial.style.display = d;
    btnManualMaterial.style.display = d;
  }

  // --- Eventos ---
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

  // --- Inicialização ---
  toggleManualInputs(true);
  btnScan.style.display = "none";
  videoEl.style.display = "none";
  resultEl.textContent = "";
})();
