// app.js — somente front, backend intocado
(() => {
  // === conexão STOMP (mesmo endpoint do backend) ===
  const socketUrl = 'ws://' + window.location.host + '/buildrun-livechat-websocket';
  const client = new StompJs.Client({ brokerURL: socketUrl });

  // === estado/UI ===
  function toggleUi(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    $("#conversation").toggle(!!connected);
  }

  // === renderização da linha na tabela ===
  function appendRow(text) {
    $("#livechat").append('<tr><td>' + text + '</td></tr>');
  }

  // === lifecycle ===
  client.onConnect = (frame) => {
    toggleUi(true);
    console.log('Conectado:', frame);

    // mantém o mesmo tópico do backend
    client.subscribe('/topics/livechat', (msg) => {
      try {
        const payload = JSON.parse(msg.body);
        // ChatOutpt(String msg) -> {"msg":"..."}
        const text = payload.msg ?? payload.content ?? String(msg.body);
        appendRow(text);
      } catch (e) {
        // se não vier JSON por algum motivo, joga a string
        appendRow(msg.body);
      }
    });
  };

  client.onWebSocketError = (err) => {
    console.error('WebSocket error', err);
  };

  client.onStompError = (frame) => {
    console.error('STOMP error:', frame.headers['message']);
    console.error('Detalhes:', frame.body);
  };

  // === ações ===
  function doConnect() {
    client.activate();
  }

  function doDisconnect() {
    client.deactivate();
    toggleUi(false);
    console.log('Desconectado');
  }

  function doSend() {
    const user = $("#user").val();
    const message = $("#message").val();

    if (!user || !message) {
      // feedback simples sem alterar HTML
      $("#message").focus();
      return;
    }

    // publica no mesmo destino do backend
    client.publish({
      destination: '/app/new-message',
      body: JSON.stringify({ user, message }) // ChatInput(String user, String message)
    });

    $("#message").val("");
  }

  // === bindings ===
  $(function () {
    // evitar submit recarregar página
    $("form").on('submit', (e) => e.preventDefault());

    $("#connect").on('click', doConnect);
    $("#disconnect").on('click', doDisconnect);
    $("#send").on('click', doSend);

    // UX: enter para enviar quando focado no #message
    $("#message").on('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        doSend();
      }
    });

    // inicia UI desconectada
    toggleUi(false);
  });
})();
