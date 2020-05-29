const WHITE_FIELD_TEX = '/mats/white_field.jpg'
const BLACK_FIELD_TEX = '/mats/black_field.jpg'

const createPawn = (color, x, y) => {
  const pawn = new Pawn({ color, x, y })
  pawn.position.x = -180 + x * 50
  pawn.position.y = 30
  pawn.position.z = -180 + y * 50
  return pawn
}

class Game {
  constructor() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      1000
    )
    this.board = null
    this.init()

    this.selectedPawn = null
    this.possibleMoves = []
    $('#root').mousedown((event) => {
      let raycaster = new THREE.Raycaster()
      let mouseVector = new THREE.Vector2()
      mouseVector.x = (event.clientX / $(window).width()) * 2 - 1
      mouseVector.y = -(event.clientY / $(window).height()) * 2 + 1
      raycaster.setFromCamera(mouseVector, this.camera)
      var intersects = raycaster.intersectObjects(this.scene.children)

      if (intersects.length > 0) {
        if (intersects[0].object.name.startsWith('pawn_')) {
          // kliknięcie pionka
          let tmpColor =
            intersects[0].object.userData.color === 1 ? 'white' : 'red'
          if (tmpColor !== this.player.color) {
            console.log('cudzy pionek')
            return
          }
          this.possibleMoves.forEach((pawn) => this.scene.remove(pawn))
          this.possibleMoves = []

          if (this.selectedPawn !== null) this.selectedPawn.resetHighlight()
          if (this.selectedPawn === intersects[0].object) {
            this.selectedPawn = null
            return
          }
          this.selectedPawn = intersects[0].object
          const possible = []
          const { x, y, color } = this.selectedPawn.userData
          if (color === 2) {
            const possibleLeft = this.board[y + 1][x - 1]
            const possibleRight = this.board[y + 1][x + 1]
            if (possibleLeft === 0) possible.push({ x: x - 1, y: y + 1 })
            if (possibleRight === 0) possible.push({ x: x + 1, y: y + 1 })

            if (possibleLeft === 1) {
              const possibleJump = this.board[y + 2][x + 2]
              if (possibleJump === 0) possible.push({ x: x + 2, y: y + 2 })
            }
            if (possibleRight === 1) {
              const possibleJump = this.board[y + 2][x - 2]
              if (possibleJump === 0) possible.push({ x: x - 2, y: y + 2 })
            }
          } else {
            const possibleLeft = this.board[y - 1][x + 1]
            const possibleRight = this.board[y - 1][x - 1]
            if (possibleLeft === 0) possible.push({ x: x + 1, y: y - 1 })
            if (possibleRight === 0) possible.push({ x: x - 1, y: y - 1 })

            if (possibleLeft === 2) {
              const possibleJump = this.board[y - 2][x + 2]
              if (possibleJump === 0) possible.push({ x: x + 2, y: y - 2 })
            }
            if (possibleRight === 2) {
              const possibleJump = this.board[y - 2][x - 2]
              if (possibleJump === 0) possible.push({ x: x - 2, y: y - 2 })
            }
          }
          possible.forEach(({ x, y }) => {
            const possiblePawn = createPawn(3, x, y)
            this.scene.add(possiblePawn)
            this.possibleMoves.push(possiblePawn)
          })

          intersects[0].object.highlight()
          return
        } else if (intersects[0].object.name.startsWith('possible_')) {
          // kliknięcie możliwego ruchu
          if (this.selectedPawn === null) return // brak wybranego pionka
          let ud = intersects[0].object.userData

          // if (ud.color !== 'dark' && ud.color !== 3) return // pole nie jest czarne

          let object = this.scene.getObjectByName(`pawn_${ud.x}_${ud.y}`, true)
          if (object !== undefined) return // pole jest już zajęte

          this.move(
            this.selectedPawn.userData.x,
            this.selectedPawn.userData.y,
            ud.x,
            ud.y
          )
        }
      }
    })
  }

  init() {
    let renderer = new THREE.WebGLRenderer()
    renderer.setClearColor(0x99ccff)
    renderer.setSize($(document).width(), $(document).height())
    $('#root').append(renderer.domElement)
    this.setCam()

    // dopasowywanie rozmiaru po zmianie wielkości okna
    window.addEventListener('resize', onWindowResize, false)
    function onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()

      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    // let axes = new THREE.AxesHelper(1000); this.scene.add(axes);
    let materialLight = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      map: new THREE.TextureLoader().load(WHITE_FIELD_TEX),
    })
    let materialDark = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      map: new THREE.TextureLoader().load(BLACK_FIELD_TEX),
    })
    let szachownica = [
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
    ]

    let geometry = new THREE.BoxGeometry(50, 20, 50)
    let posx = -180
    let posy = -180
    for (let i = 0; i < szachownica.length; i++) {
      for (let j = 0; j < szachownica.length; j++) {
        let cub
        if (szachownica[i][j] == 0) {
          cub = new THREE.Mesh(geometry, materialLight)
          cub.userData = { color: 'light', x: j, y: i }
        } else {
          cub = new THREE.Mesh(geometry, materialDark)
          cub.userData = { color: 'dark', x: j, y: i }
        }
        cub.name = `field_${cub.userData.x}_${cub.userData.y}`
        cub.position.x = posx
        posx += 50
        cub.position.z = posy
        this.scene.add(cub)
      }
      posx = -180
      posy += 50
    }

    function render(scene, camera) {
      requestAnimationFrame(() => render(scene, camera))
      renderer.render(scene, camera)
    }
    render(this.scene, this.camera)
  }

  setCam(color) {
    if (color == 'white') {
      this.camera.position.set(0, 400, 400)
    } else if (color == 'red') {
      this.camera.position.set(0, 400, -400)
    } else {
      this.camera.position.set(400, 400, 0)
    }
    this.camera.lookAt(this.scene.position)
  }

  setPlayer(p) {
    this.player = p.userData
    let color = this.player.id === 0 ? 'białymi' : 'czerwonymi'
    ui.showMessage('Witaj ' + this.player.username + '! Grasz ' + color + '!')
  }

  start() {
    ui.stopWaiting()
    ui.hideWaitingBox()
    net.sendData({ action: 'GET_STATE' }) // załadowanie planszy z serwera
    this.gameWatcherInterval = setInterval(() => {
      net.sendData({ action: 'GET_STATE' }) // załadowanie planszy z serwera w trakcie gry
    }, 500)

    this.setCam(this.player.color)

    this.pawns = []
  }

  async move(x1, y1, x2, y2) {
    let data = {
      action: 'MOVE',
      x1,
      y1,
      x2,
      y2,
    }
    await net.sendData(data)
    this.possibleMoves.forEach((pawn) => this.scene.remove(pawn))
    this.possibleMoves = []
    this.selectedPawn.resetHighlight()
    this.selectedPawn = null
  }

  createPawns() {
    let possx = -180
    let possz = -180
    let pion
    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board.length; j++) {
        if (this.board[i][j] > 0) {
          pion = new Pawn({ color: this.board[i][j], x: j, y: i })
          pion.position.x = possx
          pion.position.y = 30
          pion.position.z = possz
          this.scene.add(pion)
          this.pawns.push(pion)
        }
        possx += 50
      }
      possx = -180
      possz += 50
    }
  }

  updateBoard(b) {
    if (this.board === null) {
      // nowa plansza
      this.board = b
      this.createPawns()
      return
    }
    this.board = b
    // update planszy

    let pawnID = 0

    let possx = -180
    let possz = -180
    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board.length; j++) {
        if (this.board[i][j] > 0) {
          this.pawns[pawnID].color = this.board[i][j]
          this.pawns[pawnID].setPosition(j, i)
          this.pawns[pawnID].position.x = possx
          this.pawns[pawnID].position.y = 30
          this.pawns[pawnID].position.z = possz
          this.pawns[pawnID].__dirtyPosition = true
          pawnID++
        }
        possx += 50
      }
      possx = -180
      possz += 50
    }
  }
}
