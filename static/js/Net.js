class Net {
  checkData(obj) {
    if (obj != undefined) {
      if (obj.action == 'ADD_USER') {
        //dodawanie uzytkownika do tablicy na serwerze
        if (obj.error) {
          ui.showMessage('Serwer jest pełny!')
          ui.showLoginBox()
        } else {
          game.setPlayer(obj)
        }
      } else if (obj.action == 'CHECK_USER') {
        if (obj.players === 0) {
          // restart gry, bo jak my dołączymy to jest 1
          ui.hideWaitingBox()
          ui.showLoginBox()
          ui.showMessage('Zaloguj się...')
        } else if (obj.players === 2) {
          game.start()
        }
      } else if (obj.action == 'GET_STATE') {
        game.updateBoard(obj.board)
      }
    }
  }

  sendData(send) {
    $.ajax({
      url: 'http://localhost:3000/',
      data: send,
      type: 'POST',
      success: (data) => {
        this.checkData(data)
      },
      error: (xhr, status, error) => {
        console.log(xhr)
      },
    })
  }
}
