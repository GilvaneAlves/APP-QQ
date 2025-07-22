const btnAjuda = document.getElementById("btn-ajuda");
const modalAjuda = document.getElementById("modal-ajuda");
const modalConteudo = document.getElementById("modal-ajuda-conteudo");

btnAjuda.addEventListener("click", async () => {
  if (!modalConteudo.dataset.loaded) {
    try {
      const response = await fetch('./modal.html');
      if (!response.ok) throw new Error('Erro ao carregar ajuda');
      const html = await response.text();
      // mantém o botão fechar e adiciona o conteúdo da ajuda
      modalConteudo.innerHTML = `<span class="fechar-modal" id="fechar-ajuda">&times;</span>` + html;
      modalConteudo.dataset.loaded = "true";

      // Reatribui evento do botão fechar
      const fechar = modalConteudo.querySelector('#fechar-ajuda');
      fechar.addEventListener('click', () => {
        modalAjuda.style.display = "none";
      });

    } catch (error) {
      modalConteudo.innerHTML += `<p style="color:red;">Erro ao carregar conteúdo de ajuda.</p>`;
    }
  }
  modalAjuda.style.display = "block";
});

window.addEventListener("click", (event) => {
  if (event.target === modalAjuda) {
    modalAjuda.style.display = "none";
  }
});
