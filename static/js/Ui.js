class Ui {
  constructor() {
    $('#start').on('click', (e) => {
      e.preventDefault()
      $('#root').css('opacity', 1)
      $('.loginBox').css('display', 'none')
      this.showWaitingBox()

      let send = {
        action: 'ADD_USER',
        username: $('#username').val(),
      }
      net.sendData(send)
      ui.waitForPlayer()
    })

    $('#reset').on('click', (e) => {
      e.preventDefault()
      let send = {
        action: 'RESET_ALL',
      }
      net.sendData(send)
    })
  }
  showMessage(msg) {
    $('#playerInfo').text(msg)
  }

  showLoginBox() {
    ui.hideWaitingBox()
    $('#root').css('opacity', 0.2)
    $('.loginBox').css('display', 'flex')
  }

  showWaitingBox() {
    $('.waitingBox').css('display', 'flex')
  }
  hideWaitingBox() {
    $('.waitingBox').css('display', 'none')
  }

  waitForPlayer() {
    let check = { action: 'CHECK_USER' }
    this.inte = setInterval(() => {
      net.sendData(check)
    }, 1000)
  }
  stopWaiting() {
    clearInterval(this.inte)
  }
}
