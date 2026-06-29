function isNearBoat() {
  const playerCenterX = player.position.x + player.width / 2
  const playerCenterY = player.position.y + player.height / 2

  // Posisi perahu (kira-kira)
  const boatX = 750 // ← ubah sesuai koordinat perahu kamu
  const boatY = 320
  const boatWidth = 40
  const boatHeight = 40

  return (
    playerCenterX > boatX &&
    playerCenterX < boatX + boatWidth &&
    playerCenterY > boatY &&
    playerCenterY < boatY + boatHeight
  )
}
function goToLakeMap() {
  const lakeImage = new Image()
  lakeImage.src = './img/lakeMap.png'
  lakeImage.onload = () => {
    map.image = lakeImage
    player.position = { x: 128, y: 384 } // posisikan sesuai interior danau
  }

  // Optional: Ganti musik
  // audio.Map.pause()
  // audio.Lake.play()
}
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    if (isNearBoat()) {
      goToLakeMap()
    }
  }
})
function isAtLakeExit() {
  return (
    player.position.x >= 110 &&
    player.position.x <= 140 &&
    player.position.y >= 380 &&
    player.position.y <= 420
  )
}

function goBackToMainMap() {
  const mainMapImage = new Image()
  mainMapImage.src = './img/map.png'
  mainMapImage.onload = () => {
    map.image = mainMapImage
    player.position = { x: 750, y: 300 } // kembali ke posisi perahu
  }
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && isAtLakeExit()) {
    goBackToMainMap()
  }
})
