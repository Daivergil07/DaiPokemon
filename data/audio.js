window.discordSound = new Howl({
  src: ['./audio/discord-notification.mp3'],
  volume: 1
})

const audio = {
  Map: new Howl({
    src: './audio/littleroot town  daycore (slowedreverb)  pokemon omega rubyalpha sapphire.mp3',
    html5: true,
    volume: 0.3,
    onend: function () {
      audio.Map.play(); 
    }
  }),
  initBattle: new Howl({
    src: './audio/initBattle.wav',
    html5: true,
    volume: 0.1
  }),
  battle: new Howl({
    src: './audio/battle.mp3',
    html5: true,
    volume: 0.1
  }),
  tackleHit: new Howl({
    src: './audio/tackleHit.wav',
    html5: true,
    volume: 0.1
  }),
  fireballHit: new Howl({
    src: './audio/fireballHit.wav',
    html5: true,
    volume: 0.1
  }),
  initFireball: new Howl({
    src: './audio/initFireball.wav',
    html5: true,
    volume: 0.1
  }),
  victory: new Howl({
    src: './audio/victory.wav',
    html5: true,
    volume: 0.1
  })
}
