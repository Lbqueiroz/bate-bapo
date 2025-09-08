(() => {
  const socketUrl = 'ws://' + window.location.host + '/socket-chat';
  const client = new StompJs.Client({ brokerURL: socketUrl });

  function toggleUi(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    $("#conversation").toggle(!!connected);
  }

  function appendRow(text) {
    $("#livechat").append('<tr><td>' + text + '</td></tr>');
  }

  client.onConnect = (frame) => {
    toggleUi(true);
    console.log('Conectado:', frame);

    client.subscribe('/topic/chatroom', (msg) => {
      try {
        const payload = JSON.parse(msg.body);
        const text = payload.msg ?? payload.content ?? String(msg.body);
        appendRow(text);
      } catch (e) {
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
      $("#message").focus();
      return;
    }

    client.publish({
      destination: '/chat/send-message',
      body: JSON.stringify({ user, message }) 
    });

    $("#message").val("");
  }

  $(function () {
    $("form").on('submit', (e) => e.preventDefault());

    $("#connect").on('click', doConnect);
    $("#disconnect").on('click', doDisconnect);
    $("#send").on('click', doSend);

    $("#message").on('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        doSend();
      }
    });

    toggleUi(false);
  });
})();
