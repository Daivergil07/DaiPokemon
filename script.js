const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 540
const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
  collisionsMap.push(collisions.slice(i, 70 + i))
}

const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i += 70) {
  battleZonesMap.push(battleZonesData.slice(i, 70 + i))
}

const charactersMap = []
for (let i = 0; i < charactersMapData.length; i += 70) {
  charactersMap.push(charactersMapData.slice(i, 70 + i))
}
console.log(charactersMap)

const boundaries = []
const offset = {
  x: -735,
  y: -650
}

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      )
  })
})



const battleZones = []

battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      battleZones.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      )
  })
})

const characters = []
const villagerImg = new Image()
villagerImg.src = './img/villager/Idle.png'

const oldManImg = new Image()
oldManImg.src = './img/oldMan/Idle.png'

charactersMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
 // 1026 === villager (Prabowo)
if (symbol === 1026) {
  characters.push(
    new Character({
      position: {
        x: j * Boundary.width + offset.x,
        y: i * Boundary.height + offset.y
      },
      image: villagerImg,
      frames: {
        max: 4,
        hold: 60
      },
      scale: 3,
      animate: true,
      dialogue: [
        'Prabowo: "Ayo! Jangan biarkan mereka merusak desa ini!"',
        'Prabowo: "Aku sudah mencari Liya, tapi dia belum juga kembali... Mungkin kamu bisa membantuku?"',
        'Prabowo: "Aku tahu kamu bisa menghadapinya, kami butuh bantuanmu sekarang!"'
      ]
    })
  );
}

// 1024 === Mas Anis with interaction sound
else if (symbol === 1024) {
  characters.push(
    new Character({
      position: {
        x: j * Boundary.width + offset.x,
        y: i * Boundary.height + offset.y
      },
      image: villagerImg,
      frames: {
        max: 4,
        hold: 60
      },
      scale: 3,
      animate: true,
      dialogue: [
        'Mas Anis: "Ayo, kita tak boleh kalah! Semua harapan ada di tanganmu sekarang!"',
        'Mas Anis: "Tunjukkan pada mereka siapa yang lebih kuat! Hajar mereka dengan semangatmu!..Dan ingat jangan terlalu sering untuk menggunakan skill yang sama karena penggunaan skill yang terbatas"',
        'Mas Anis: "Ingat, setiap kemenangan kita adalah langkah besar menuju kejayaan! Jangan ragu!"'
      ],
      onInteract: () => {
        console.log('Interaksi dengan Mas Anis dimulai');

        try {
          if (interactSound) { // Pastikan interactSound terdefinisi
            interactSound.stop(); // hentikan jika sedang bermain
            interactSound.play().then(() => {
              console.log('Audio diputar');
            }).catch(error => {
              console.error('Gagal memutar audio:', error);
            });
          } else {
            console.error('Audio interactSound tidak ditemukan!');
          }
        } catch (error) {
          console.error('Error saat memutar audio:', error);
          
        }
      }
    })
  );
}

// 1035 === Faiz (old man)
else if (symbol === 1035) {
  characters.push(
    new Character({
      position: {
        x: j * Boundary.width + offset.x,
        y: i * Boundary.height + offset.y
      },
      image: oldManImg,
      frames: {
        max: 4,
        hold: 60
      },
      scale: 3,
      dialogue: [
        'Faiz: "Ingatlah Wahai Anak Muda, jalanmu tidak akan mudah..."',
        'Faiz: "Kunci kemenangan ada di Jawa, kuharapkan kamu mampu menemukannya!"',
        'Faiz: "Jangan lupakan kata-kataku, karena keputusanmu akan menentukan masa depan!"'
      ],
onInteract: () => {
  console.log('onInteract Faiz dijalankan')
  if (discordSound) {
    discordSound.stop()
    discordSound.play().catch((err) =>
      console.error('Gagal memutar suara Discord:', err)
    )
  }
}

    })
  );
}

// 1043 === Vergiil (PokeCenter Healer / Nurse)
else if (symbol === 1043) {
  characters.push(
    new Character({
      position: {
        x: j * Boundary.width + offset.x,
        y: i * Boundary.height + offset.y
      },
      image: oldManImg,
      frames: {
        max: 4,
        hold: 60
      },
      scale: 3,
      dialogue: [
        'Nurse Vergiil: "Halo! Selamat datang di Pusat Penyembuhan Pokemon!"',
        'Nurse Vergiil: "Kami akan memulihkan kesehatan dan PP seluruh Pokemon di timmu..."',
        'Nurse Vergiil: "*ting ting ting* ... Selesai! Pokemon timmu kini telah sehat dan penuh energi!"',
        'Nurse Vergiil: "Semoga perjalananmu menyenangkan! Sampai jumpa lagi!"'
      ],
      onInteract: () => {
        try {
          // Heal all Pokemon in team
          if (window.playerData && Array.isArray(window.playerData.team)) {
            window.playerData.team.forEach(p => {
              if (p) {
                p.health = p.maxHealth || 100
                if (Array.isArray(p.attacks)) {
                  p.attacks.forEach(atk => {
                    if (atk) atk.pp = atk.maxPp || 30
                  })
                }
              }
            })

            // Sync attackPP for backwards compatibility
            const firstP = window.playerData.team[0]
            if (firstP) {
              window.playerData.attackPP = window.playerData.attackPP || {}
              if (Array.isArray(firstP.attacks)) {
                firstP.attacks.forEach(a => {
                  if (a && a.name) {
                    window.playerData.attackPP[a.name] = a.pp
                  }
                })
              }
              window.playerData.health = firstP.health || 100;
              window.playerData.maxHealth = firstP.maxHealth || 100;
            }

            // Force save and show notification
            localStorage.setItem('pokemonData', JSON.stringify(window.playerData))
            showNotification('🩺 Semua Pokemon telah dipulihkan secara penuh!')
            console.log('✅ Healing successful:', window.playerData.team)
          } else {
            console.warn('⚠️ No team found to heal!')
          }
        } catch (error) {
          console.error('❌ Error during healing:', error)
          showNotification('Terjadi kesalahan saat memulihkan Pokemon.')
        }
      }
    })
  );
}


    // Add boundaries for non-zero symbol values
    if (symbol !== 0) {
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      );
    }
  });
});



const image = new Image()
image.src = './img/Pellet Town.png'

const foregroundImage = new Image()
foregroundImage.src = './img/foregroundObjects.png'

const playerDownImage = new Image()
playerDownImage.src = './img/playerDown.png'

const playerUpImage = new Image()
playerUpImage.src = './img/playerUp.png'

const playerLeftImage = new Image()
playerLeftImage.src = './img/playerLeft.png'

const playerRightImage = new Image()
playerRightImage.src = './img/playerRight.png'

const player = new Sprite({
  position: {
    x: canvas.width / 2 - 192 / 4 / 2,
    y: canvas.height / 2 - 68 / 2
  },
  image: playerDownImage,
  frames: {
    max: 4,
    hold: 10
  },
  sprites: {
    up: playerUpImage,
    left: playerLeftImage,
    right: playerRightImage,
    down: playerDownImage
  }
})

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: image
})

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: foregroundImage
})

const keys = {
  w: { pressed: false },
  a: { pressed: false },
  s: { pressed: false },
  d: { pressed: false },
  space: { pressed: false } // Tambahkan ini
}


const movables = [
  background,
  ...boundaries,
  foreground,
  ...battleZones,
  ...characters
]
const renderables = [
  background,
  ...boundaries,
  ...battleZones,
  ...characters,
  player,
  foreground
]

const battle = {
  initiated: false
}

function animate() {
  const animationId = window.requestAnimationFrame(animate)
  renderables.forEach((renderable) => {
    renderable.draw()
  })

  let moving = true
  player.animate = false

  if (battle.initiated) return

  const isMoving = keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed

  // Battle trigger
  if (isMoving) {
    for (let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i]
      const overlappingArea =
        (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) -
         Math.max(player.position.x, battleZone.position.x)) *
        (Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) -
         Math.max(player.position.y, battleZone.position.y))

      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: battleZone
        }) &&
        overlappingArea > (player.width * player.height) / 2 &&
        Math.random() < 0.01
      ) {
        window.cancelAnimationFrame(animationId)
        audio.Map.stop()
        audio.initBattle.play()
        audio.battle.play()
        battle.initiated = true
        gsap.to('#overlappingDiv', {
          opacity: 1,
          repeat: 3,
          yoyo: true,
          duration: 0.4,
          onComplete() {
            gsap.to('#overlappingDiv', {
              opacity: 1,
              duration: 0.4,
              onComplete() {
                initBattle()
                animateBattle()
                gsap.to('#overlappingDiv', {
                  opacity: 0,
                  duration: 0.4
                })
              }
            })
          }
        })
        return
      }
    }
  }

  if (!isMoving) return

  const direction = lastKey

  const directions = {
    w: {
      image: player.sprites.up,
      offset: { x: 0, y: 3 },
      move: () => movables.forEach((movable) => (movable.position.y += 3))
    },
    a: {
      image: player.sprites.left,
      offset: { x: 3, y: 0 },
      move: () => movables.forEach((movable) => (movable.position.x += 3))
    },
    s: {
      image: player.sprites.down,
      offset: { x: 0, y: -3 },
      move: () => movables.forEach((movable) => (movable.position.y -= 3))
    },
    d: {
      image: player.sprites.right,
      offset: { x: -3, y: 0 },
      move: () => movables.forEach((movable) => (movable.position.x -= 3))
    }
  }

  const current = directions[direction]
  if (!current) return

  player.animate = true
  player.image = current.image

  checkForCharacterCollision({
    characters,
    player,
    characterOffset: current.offset
  })

  for (let i = 0; i < boundaries.length; i++) {
    const boundary = boundaries[i]
    const collision = rectangularCollision({
      rectangle1: player,
      rectangle2: {
        ...boundary,
        position: {
          x: boundary.position.x + current.offset.x,
          y: boundary.position.y + current.offset.y
        }
      }
    })
    if (collision) {
      moving = false
      break
    }
  }

  if (moving) current.move()
}


let lastKey = ''

window.addEventListener('keydown', (e) => {
  // Jika sedang interaksi, lanjut dialog
  if (player.isInteracting) {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault()
      player.interactionAsset.dialogueIndex++

      const { dialogueIndex, dialogue } = player.interactionAsset
      if (dialogueIndex <= dialogue.length - 1) {
        document.querySelector('#characterDialogueBox').innerHTML =
          player.interactionAsset.dialogue[dialogueIndex]
        return
      }

      // Selesai bicara
      player.isInteracting = false
      player.interactionAsset.dialogueIndex = 0
      document.querySelector('#characterDialogueBox').style.display = 'none'
    }
    return
  }

  // Mulai interaksi saat tekan spasi
  if ((e.code === 'Space' || e.key === ' ') && player.interactionAsset) {
    e.preventDefault()
    const firstMessage = player.interactionAsset.dialogue[0]
    document.querySelector('#characterDialogueBox').innerHTML = firstMessage
    document.querySelector('#characterDialogueBox').style.display = 'flex'
    player.isInteracting = true

    if (typeof player.interactionAsset.onInteract === 'function') {
      player.interactionAsset.onInteract()
    }
    return
  }

  // Gerakan biasa
  switch (e.key) {
    case 'w':
      keys.w.pressed = true
      lastKey = 'w'
      break
    case 'a':
      keys.a.pressed = true
      lastKey = 'a'
      break
    case 's':
      keys.s.pressed = true
      lastKey = 's'
      break
    case 'd':
      keys.d.pressed = true
      lastKey = 'd'
      break
  }
})

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'w':
      keys.w.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
    case 's':
      keys.s.pressed = false
      break
    case 'd':
      keys.d.pressed = false
      break
  }
})

// Virtual D-pad
const upButton = document.getElementById('up')
const leftButton = document.getElementById('left')
const downButton = document.getElementById('down')
const rightButton = document.getElementById('right')

const resetKeys = (key) => {
  switch (key) {
    case 'w':
      keys.w.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
    case 's':
      keys.s.pressed = false
      break
    case 'd':
      keys.d.pressed = false
      break
  }
}

upButton.addEventListener('touchstart', (e) => {
  e.preventDefault()
  keys.w.pressed = true
  lastKey = 'w'
})
leftButton.addEventListener('touchstart', (e) => {
  e.preventDefault()
  keys.a.pressed = true
  lastKey = 'a'
})
downButton.addEventListener('touchstart', (e) => {
  e.preventDefault()
  keys.s.pressed = true
  lastKey = 's'
})
rightButton.addEventListener('touchstart', (e) => {
  e.preventDefault()
  keys.d.pressed = true
  lastKey = 'd'
})

upButton.addEventListener('touchend', () => resetKeys('w'))
leftButton.addEventListener('touchend', () => resetKeys('a'))
downButton.addEventListener('touchend', () => resetKeys('s'))
rightButton.addEventListener('touchend', () => resetKeys('d'))

// Interaksi tombol 🤝 (mobile)
window.addEventListener('load', () => {
  const interactBtn = document.getElementById('interact-button') || document.getElementById('interactButton')
  if (interactBtn) {
    interactBtn.addEventListener('click', () => {
      const e = new KeyboardEvent('keydown', { key: ' ' })
      window.dispatchEvent(e)
    })
  }
})

// Musik aktif saat pertama kali disentuh
let clicked = false
addEventListener('click', () => {
  if (!clicked) {
    audio.Map.play()
    clicked = true
    if (typeof discordSound !== 'undefined') {
      discordSound.play().catch((e) => console.warn('Gagal mainkan sound:', e))
    }
  }
})

window.addEventListener('load', () => {
  const loadingScreen = document.getElementById('loadingScreen');
  
  // Simulasi delay load (atau hapus kalau tidak perlu)
  setTimeout(() => {
    loadingScreen.style.display = 'none';

    // Mulai animasi game setelah loading hilang
    ;
  }, 5500); // 1.5 detik, sesuaikan atau hapus delay
});

function showNotification(message, duration = 6000) {
  const notif = document.getElementById('notifBox');
  notif.innerText = message;
  notif.style.display = 'block';

  setTimeout(() => {
    notif.style.display = 'none';
  }, duration);
}




