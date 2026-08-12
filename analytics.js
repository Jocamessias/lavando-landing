/* ─────────────────────────────────────────────────────────
   Eventos de conversão — Lavandô
   Dispara uma vez por sessão para não inflar a contagem.
   ───────────────────────────────────────────────────────── */
(function () {
  var jaDisparou = {};

  function enviar(nome, origem) {
    if (jaDisparou[nome]) return;
    jaDisparou[nome] = true;
    if (typeof gtag === 'function') {
      gtag('event', nome, { origem: origem || 'nao-informado' });
    }
  }

  document.addEventListener('click', function (e) {
    var alvo = e.target;
    if (!alvo || typeof alvo.closest !== 'function') return;
    var link = alvo.closest('a');
    if (!link) return;
    var href = link.getAttribute('href') || '';

    if (href.indexOf('wa.me') > -1 || href.indexOf('api.whatsapp') > -1) {
      enviar('clique_whatsapp', link.textContent.trim().slice(0, 40));
    } else if (href.indexOf('tel:') === 0) {
      enviar('clique_telefone', 'link de telefone');
    } else if (href.indexOf('maps.google') > -1 || href.indexOf('maps.app.goo.gl') > -1) {
      enviar('clique_rota', 'link de mapa');
    }
  }, true);

  /* O conteúdo da página é montado pelo runtime (support.js) depois que o
     script carrega, então o #precos ainda não existe neste momento.
     Tentamos observar assim que ele aparecer — no máximo por ~30s. */
  function observarPrecos() {
    var precos = document.getElementById('precos');
    if (!precos) return false;
    if (!('IntersectionObserver' in window)) return true;

    var obs = new IntersectionObserver(function (itens) {
      itens.forEach(function (item) {
        if (item.isIntersecting) {
          enviar('viu_precos', 'scroll');
          obs.disconnect();
        }
      });
    }, { threshold: 0.5 });
    obs.observe(precos);
    return true;
  }

  if (!observarPrecos()) {
    var tentativas = 0;
    var timer = setInterval(function () {
      if (observarPrecos() || ++tentativas > 100) clearInterval(timer);
    }, 300);
  }
})();
