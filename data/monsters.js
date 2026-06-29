const monsters = {
  Emby: {
    position: {
      x: 280,
      y: 325
    },
    playerPos: { x: 280, y: 275 },
    enemyPos: { x: 800, y: 100 },
    image: {
      src: './img/embySprite.png'
    },
    frames: {
      max: 4,
      hold: 30
    },
    animate: true,
    name: 'Emby',
    attacks: [attacks.Tackle, attacks.Fireball, attacks.Windslash, attacks.Blackhole]
  },

  Draggle: {
    position: {
      x: 800,
      y: 100
    },
    playerPos: { x: 280, y: 325 },
    enemyPos: { x: 800, y: 100 },
    image: {
      src: './img/draggleSprite.png'
    },
    frames: {
      max: 4,
      hold: 30
    },
    animate: true,
    isEnemy: true,
    name: 'Draggle',
    type: 'Tree & Fire',
    baseStats: {
      hp: 100,
      speed: 30
    },
    attacks: [attacks.Tackle, attacks.Fireball, attacks.Windslash]
  },
  Nidoking: {
    position: {
      x: 780,
      y: 53 
    },
    playerPos: { x: 280, y: 250 }, // Adjusted for scale
    enemyPos: { x: 780, y: 53 },
    image: {
      src: './img/nidoking1 (1).png'
    },
    frames: {
      max: 1,
      hold: 60
    },
    animate: true,
    scale: 2.5,
    isEnemy: true,
    name: 'Nidoking',
    type: 'Darkness',
    baseStats: {
      hp: 150,
      speed: 30
    },
    attacks: [attacks.Blackhole, attacks.Fireball]
  },

  Bulabu: {
    position: {
      x: 780,
      y: -120 
    },
    playerPos: { x: 280, y: 105 }, // Offset by -220 from base y:325
    enemyPos: { x: 780, y: -120 },
    image: {
      src: './img/bulabu-removebg-preview.png'
    },
    frames: {
      max: 2,
      hold: 30
    },
    animate: true,
    isEnemy: true,
    name: 'Bulabu',
    type: 'Shadow',
    baseStats: {
      hp: 150,
      speed: 30
    },
    attacks: [attacks.Tackle, attacks.Blackhole]
  }

};
