class Sprite {
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    scale = 1
  }) {
    this.position = position
    this.image = new Image()
    this.frames = { ...frames, val: 0, elapsed: 0 }
    this.image.onload = () => {
      this.width = (this.image.width / this.frames.max) * scale
      this.height = this.image.height * scale
    }
    this.image.src = image.src

    this.animate = animate
    this.sprites = sprites
    this.opacity = 1

    this.rotation = rotation
    this.scale = scale
  }

  draw() {
    c.save()
    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    )
    c.rotate(this.rotation)
    c.translate(
      -this.position.x - this.width / 2,
      -this.position.y - this.height / 2
    )
    c.globalAlpha = this.opacity

    const crop = {
      position: {
        x: this.frames.val * (this.width / this.scale),
        y: 0
      },
      width: this.image.width / this.frames.max,
      height: this.image.height
    }

    const image = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      width: this.image.width / this.frames.max,
      height: this.image.height
    }

    c.drawImage(
      this.image,
      crop.position.x,
      crop.position.y,
      crop.width,
      crop.height,
      image.position.x,
      image.position.y,
      image.width * this.scale,
      image.height * this.scale
    )

    c.restore()

    if (!this.animate) return

    if (this.frames.max > 1) {
      this.frames.elapsed++
    }

    if (this.frames.elapsed % this.frames.hold === 0) {
      if (this.frames.val < this.frames.max - 1) this.frames.val++
      else this.frames.val = 0
    }
  }
}



class Monster extends Sprite {
  
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    isEnemy = false,
    name,
    attacks,
    baseStats,
    expReward,
    level
  }) {
    super({
      position,
      velocity,
      image,
      frames,
      sprites,
      animate,
      rotation
    })
    this.baseStats = baseStats || { hp: 100, speed: 30 }
    this.maxHealth = this.baseStats.hp
    this.health = this.maxHealth
    this.level = level || 1
    this.exp = 0
    this.expReward = expReward || 50
    
    this.isEnemy = isEnemy
    this.name = name
    
    // Clone attacks to track independent PP state
    this.attacks = attacks ? JSON.parse(JSON.stringify(attacks)) : []
    this.attacks.forEach(a => {
      a.pp = a.maxPp || 10
    })
  }
  
  showFloatingText(text, color = 'white') {
    const textEl = document.createElement('div')
    textEl.innerHTML = text
    textEl.className = 'floating-text'
    textEl.style.color = color
    // Calculate position based on the sprite
    const x = this.position.x + (this.width / 2)
    const y = this.position.y
    textEl.style.left = x + 'px'
    textEl.style.top = y + 'px'
    
    document.querySelector('#userInterface').appendChild(textEl)
    
    gsap.to(textEl, {
      y: y - 50,
      opacity: 0,
      duration: 1.5,
      onComplete: () => {
        textEl.remove()
      }
    })
  }
  

  faint() {
    document.querySelector('#dialogueBox').innerHTML = this.name + ' fainted!'
    gsap.to(this.position, {
      y: this.position.y + 20
    })
    gsap.to(this, {
      opacity: 0
    })
    audio.battle.stop()
    audio.victory.play()
  }

  attack({ attack, recipient, renderedSprites, onComplete }) {
    document.querySelector('#dialogueBox').style.display = 'block'
    showNotification(this.name + ' used ' + attack.name)

    let healthBar = '#enemyHealthBar'
    let healthText = '#enemyHealthText'
    if (this.isEnemy) {
      healthBar = '#playerHealthBar'
      healthText = '#playerHealthText'
    }

    let rotation = 1
    if (this.isEnemy) rotation = -2.2

    // Deduct PP
    const myAttack = this.attacks.find(a => a.name === attack.name)
    if (myAttack && myAttack.pp > 0) {
      myAttack.pp--
    }

    recipient.health -= attack.damage
    recipient.showFloatingText(attack.damage, 'red')

    switch (attack.name) {
      case 'Fireball':
        audio.initFireball.play()
        const fireballImage = new Image()
        fireballImage.src = './img/fireball.png'
        const fireball = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y
          },
          image: fireballImage,
          frames: {
            max: 4,
            hold: 10
          },
          animate: true,
          rotation
        })
        renderedSprites.splice(1, 0, fireball)

        gsap.to(fireball.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          onComplete: () => {
            audio.fireballHit.play()
            gsap.to(healthBar, {
              width: (recipient.health / recipient.maxHealth) * 100 + '%'
            })
            const hText = document.querySelector(this.isEnemy ? '#playerHealthText' : '#enemyHealthText');
            if (hText) hText.innerHTML = Math.max(0, recipient.health) + '/' + recipient.maxHealth;
            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08
            })
             gsap.to(recipient, {
               opacity: 0,
               repeat: 5,
               yoyo: true,
               duration: 0.08,
               onComplete: () => {
                 renderedSprites.splice(1, 1)
                 if (onComplete) onComplete()
               }
             })
           }
         })
         break
case 'Windslash':

  const windImage = new Image();
  windImage.src = './img/windslash.png';
  const windSlash = new Sprite({
    position: {
      x: this.position.x,
      y: this.position.y
    },
    image: windImage,
    frames: {
      max: 4,
      hold: 10
    },
    animate: true,
    rotation
  });
  renderedSprites.splice(1, 0, windSlash);

  gsap.to(windSlash.position, {
    x: recipient.position.x,
    y: recipient.position.y,
    onComplete: () => {
      audio.fireballHit.play();

      gsap.to(healthBar, {
        width: (recipient.health / recipient.maxHealth) * 100 + '%'
      });
      const hTextWind = document.querySelector(this.isEnemy ? '#playerHealthText' : '#enemyHealthText');
      if (hTextWind) hTextWind.innerHTML = Math.max(0, recipient.health) + '/' + recipient.maxHealth;
      gsap.to(recipient.position, {
        x: recipient.position.x + 10,
        yoyo: true,
        repeat: 5,
        duration: 0.08
      });
      gsap.to(recipient, {
        opacity: 0,
        repeat: 5,
        yoyo: true,
        duration: 0.08,
        onComplete: () => {
          renderedSprites.splice(1, 1);
          if (onComplete) onComplete();
        }
      });
    }
  });
  break;
case 'Blackhole':

  const blackholeImage = new Image();
  blackholeImage.src = './img/blackhole.png';
  const blackhole = new Sprite({
    position: {
      x: this.position.x,
      y: this.position.y
    },
    image: blackholeImage,
    frames: {
      max: 6,
      hold: 10
    },
    animate: true,
    rotation
  });
  renderedSprites.splice(1, 0, blackhole);

  gsap.to(blackhole.position, {
    x: recipient.position.x,
    y: recipient.position.y,
    onComplete: () => {
      audio.fireballHit.play();
      gsap.to(healthBar, {
        width: (recipient.health / recipient.maxHealth) * 100 + '%'
      });
      const hTextBlack = document.querySelector(this.isEnemy ? '#playerHealthText' : '#enemyHealthText');
      if (hTextBlack) hTextBlack.innerHTML = Math.max(0, recipient.health) + '/' + recipient.maxHealth;
      gsap.to(recipient.position, {
        x: recipient.position.x + 10,
        yoyo: true,
        repeat: 5,
        duration: 0.08
      });
      gsap.to(recipient, {
        opacity: 0,
        repeat: 5,
        yoyo: true,
        duration: 0.08,
        onComplete: () => {
          renderedSprites.splice(1, 1);
          if (onComplete) onComplete();
        }
      });
    }
  });
  break;

      case 'Tackle':
        const tl = gsap.timeline()
        let movementDistance = 20
        if (this.isEnemy) movementDistance = -20
        tl.to(this.position, {
          x: this.position.x - movementDistance
        })
          .to(this.position, {
            x: this.position.x + movementDistance * 2,
            duration: 0.1,
            onComplete: () => {
              audio.tackleHit.play()
              gsap.to(healthBar, {
                width: (recipient.health / recipient.maxHealth) * 100 + '%'
              })
              const hTextTackle = document.querySelector(this.isEnemy ? '#playerHealthText' : '#enemyHealthText');
              if (hTextTackle) hTextTackle.innerHTML = Math.max(0, recipient.health) + '/' + recipient.maxHealth;
              gsap.to(recipient.position, {
                x: recipient.position.x + 10,
                yoyo: true,
                repeat: 5,
                duration: 0.08
              })
              gsap.to(recipient, {
                opacity: 0,
                repeat: 5,
                yoyo: true,
                duration: 0.08,
                onComplete: () => {
                  if (onComplete) onComplete()
                }
              })
            }
          })
          .to(this.position, {
            x: this.position.x
          })
        break
    }
  }
}

// Fungsi pemilihan serangan musuh
function chooseEnemyAttack(monster) {
  // Filter serangan yang masih memiliki PP
  const usableAttacks = monster.attacks.filter((attack) => attack.pp > 0);

  // Jika semua PP habis, gunakan Struggle (fallback)
  if (usableAttacks.length === 0) {
    return { name: 'Struggle', damage: 10, type: 'Normal', color: 'black', pp: 1, maxPp: 1 };
  }

  // Pilih secara random dari serangan yang tersisa
  return usableAttacks[Math.floor(Math.random() * usableAttacks.length)];
}

class Boundary {
  static width = 48
  static height = 48
  constructor({ position }) {
    this.position = position
    this.width = 48
    this.height = 48
  }

  draw() {
    c.fillStyle = 'rgba(255, 0, 0, 0)'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }
}

class Character extends Sprite {
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    scale = 1,
    dialogue = ['']
  }) {
    super({
      position,
      velocity,
      image,
      frames,
      sprites,
      animate,
      rotation,
      scale
    })

    this.dialogue = dialogue
    this.dialogueIndex = 0
  }
}
