const WHITE_PAWN_TEX = '/mats/white_pawn.jpg'
const BLACK_PAWN_TEX = '/mats/black_pawn.jpg'
const HIGHLITHED_PAWN_TEX = '/mats/highlighted.jpg'

materialWhite = new THREE.MeshBasicMaterial({
  side: THREE.DoubleSide,
  map: new THREE.TextureLoader().load(WHITE_PAWN_TEX),
})
materialRed = new THREE.MeshBasicMaterial({
  side: THREE.DoubleSide,
  map: new THREE.TextureLoader().load(BLACK_PAWN_TEX),
})
materialGold = new THREE.MeshBasicMaterial({
  side: THREE.DoubleSide,
  map: new THREE.TextureLoader().load(HIGHLITHED_PAWN_TEX),
})
materialPossible = new THREE.MeshBasicMaterial({
  color: 0x8888ff,
  side: THREE.DoubleSide,
  wireframe: true,
  opacity: 0.5,
})
geometryCylinder = new THREE.CylinderGeometry(20, 20, 20, 30)

class Pawn extends THREE.Mesh {
  constructor(userData) {
    // CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);

    if (userData.color === 1) {
      super(geometryCylinder, materialWhite)
    } else if (userData.color === 2) {
      super(geometryCylinder, materialRed)
    } else if (userData.color === 3) {
      super(geometryCylinder, materialPossible)
    } else {
      console.log('Pawn error: unknown color.')
    }

    this.userData = userData
    if (userData.color === 3) {
      this.name = `possible_${userData.x}_${userData.y}`
    } else {
      this.name = `pawn_${userData.x}_${userData.y}`
    }
  }

  set color(c) {
    this.userData.color = c
    if (!this.highlightState) {
      this.updateColor()
    }
  }

  get color() {
    return this.userData.color
  }

  setPosition(x1, y1) {
    this.userData.x = x1
    this.userData.y = y1
    this.name = `pawn_${this.userData.x}_${this.userData.y}`
  }

  highlight() {
    this.highlightState = true
    this.material = materialGold
    console.log('HI!')
  }

  resetHighlight() {
    this.highlightState = false
    this.updateColor()
  }

  updateColor() {
    if (this.userData.color === 1) {
      this.material = materialWhite
    } else if (this.userData.color === 2) {
      this.material = materialRed
    } else {
      console.log('Pawn error: unknown color.')
    }
  }
}
