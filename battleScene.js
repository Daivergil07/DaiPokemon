const battleBackgroundImage = new Image()
battleBackgroundImage.src = './img/battleBackground.png'
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  image: battleBackgroundImage
})

const logoPokeballImage = new Image()
logoPokeballImage.src = './logo_pokeball.png'

let enemyMonster
let emby
let renderedSprites
let battleAnimationId



setupEnemyInfoToggle();   
function setupEnemyInfoToggle() {
  const toggleBtn = document.getElementById("toggleStatsBtn");
  const statsPanel = document.getElementById("enemyStatsPanel");

  if (toggleBtn && statsPanel) {
    toggleBtn.onclick = () => {
      const visible = statsPanel.style.display !== "none";
      statsPanel.style.display = visible ? "none" : "block";
    };
    console.log("✅ Listener toggleStatsBtn berhasil dipasang");
  } else {
    console.warn("❌ Tombol atau panel info musuh tidak ditemukan");
  }
}

function initBattle() {
  document.querySelector('#userInterface').style.display = 'block'
  document.querySelector('#enemyHealthBar').style.width = '100%'
  document.querySelector('#playerHealthBar').style.width = '100%'
  document.querySelector('#attacksBox').replaceChildren()
  document.querySelector('#bagBox').replaceChildren()

  if (!window.playerData) {
    const saved = localStorage.getItem('pokemonData')
    if (saved) {
      window.playerData = JSON.parse(saved)
    } else {
      window.playerData = {
        level: 1,
        exp: 0,
        maxHealth: 100,
        hpPotions: 10,
        ethers: 5,
        pokeBalls: 5
      }
    }
  }

  // Ensure pokeBalls count is initialized
  if (window.playerData.pokeBalls === undefined) {
    window.playerData.pokeBalls = 5
  }

  // Initialize team if not exist
  if (!window.playerData.team || window.playerData.team.length === 0) {
    window.playerData.team = [
      {
        name: 'Emby',
        level: window.playerData.level || 1,
        exp: window.playerData.exp || 0,
        health: window.playerData.maxHealth || 100,
        maxHealth: window.playerData.maxHealth || 100,
        attacks: JSON.parse(JSON.stringify(monsters.Emby.attacks))
      }
    ]
    // If playerData had saved attackPP, restore it for Emby in the team
    if (window.playerData.attackPP) {
      window.playerData.team[0].attacks.forEach(a => {
        if (window.playerData.attackPP[a.name] !== undefined) {
          a.pp = window.playerData.attackPP[a.name]
        }
      })
    }
  }

  // Set active Pokemon index to first conscious Pokemon
  window.activePokemonIndex = 0
  for (let i = 0; i < window.playerData.team.length; i++) {
    if (window.playerData.team[i].health > 0) {
      window.activePokemonIndex = i
      break
    }
  }

  const activeP = window.playerData.team[window.activePokemonIndex]

  // Setup active Player Monster
  const activeMonsterData = monsters[activeP.name]
  emby = new Monster({
    ...activeMonsterData,
    position: activeMonsterData.playerPos || { x: 280, y: 325 },
    isEnemy: false,
    level: activeP.level
  })
  emby.exp = activeP.exp
  emby.health = activeP.health
  emby.maxHealth = activeP.maxHealth
  emby.attacks = JSON.parse(JSON.stringify(activeP.attacks))

  // Update info panel saat battle dimulai
  function updateEnemyInfoPanel(monster) {
    document.getElementById('panelEnemyName').innerText = `Nama: ${monster.name}`;
    document.getElementById('panelEnemyType').innerText = `Tipe: ${monster.type || '-'}`;
    document.getElementById('panelEnemyStats').innerText =
      `HP: ${monster.baseStats?.hp || monster.health} | Speed: ${monster.baseStats?.speed || '-'}`;
  }

  document.querySelector('#playerNameText').innerHTML = emby.name
  document.querySelector('#playerLevel').innerHTML = 'Lv. ' + emby.level
  document.querySelector('#playerHealthText').innerHTML = emby.health + '/' + emby.maxHealth
  gsap.to('#playerHealthBar', { width: (emby.health / emby.maxHealth) * 100 + '%', duration: 0 })
  const expPercent = (emby.exp / (emby.level * 100)) * 100
  document.querySelector('#playerExpBar').style.width = expPercent + '%'

  // Random spawn antara Draggle, Bulabu, dan Nidoking
  const enemyChoices = [monsters.Draggle, monsters.Bulabu, monsters.Nidoking]
  const chosenEnemyData = enemyChoices[Math.floor(Math.random() * enemyChoices.length)]

  enemyMonster = new Monster({
    ...chosenEnemyData,
    position: chosenEnemyData.enemyPos || chosenEnemyData.position
  })
  
  // Update info panel sesuai musuh aktif
  updateEnemyInfoPanel(chosenEnemyData)

  // Update nama di UI
  document.querySelector('#enemyName').innerHTML = enemyMonster.name
  document.querySelector('#enemyLevel').innerHTML = 'Lv. ' + enemyMonster.level

  // Rendered sprites and attack buttons
  renderedSprites = [enemyMonster, emby]

  // Reset UI to Pokemon main menu state
  showMainMenu()

  // --- Helper: Show main menu (FIGHT/BAG/POKéMON/RUN) ---
  function showMainMenu() {
    document.querySelector('#dialogueBox').style.display = 'flex'
    document.querySelector('#dialogueBox').innerHTML = `What will ${emby.name} do?`
    document.querySelector('#attacksBox').style.display = 'none'
    document.querySelector('#actionMenuBox').style.display = 'grid'
    document.querySelector('#attackInfoBox').style.display = 'none'
    document.querySelector('#bagBox').style.display = 'none'
  }

  // --- Helper: Show attacks sub-menu ---
  function showAttacksMenu() {
    document.querySelector('#dialogueBox').style.display = 'none'
    document.querySelector('#attacksBox').style.display = 'grid'
    document.querySelector('#actionMenuBox').style.display = 'none'
    document.querySelector('#attackInfoBox').style.display = 'flex'
    document.querySelector('#bagBox').style.display = 'none'
    // Default: show first attack info
    if (emby.attacks.length > 0) {
      updateAttackInfo(emby.attacks[0])
    }
  }

  // --- Helper: Show bag sub-menu ---
  function showBagMenu() {
    document.querySelector('#dialogueBox').style.display = 'none'
    document.querySelector('#attacksBox').style.display = 'none'
    document.querySelector('#actionMenuBox').style.display = 'none'
    document.querySelector('#attackInfoBox').style.display = 'none'
    document.querySelector('#bagBox').style.display = 'block'
    updateBagUI()
  }

  // --- Helper: Show pokemon switching menu ---
  function showPokemonMenu() {
    document.querySelector('#dialogueBox').style.display = 'none'
    document.querySelector('#attacksBox').style.display = 'none'
    document.querySelector('#actionMenuBox').style.display = 'none'
    document.querySelector('#attackInfoBox').style.display = 'none'
    document.querySelector('#bagBox').style.display = 'block'
    updatePokemonMenuUI()
  }

  // --- Helper: Update team switching UI ---
  function updatePokemonMenuUI() {
    const bagBox = document.querySelector('#bagBox')
    bagBox.replaceChildren()

    window.playerData.team.forEach((p, index) => {
      const btn = document.createElement('button')
      const isActive = index === window.activePokemonIndex
      btn.innerHTML = `${isActive ? '▶ ' : ''}${p.name} (Lv. ${p.level}) - HP: ${p.health}/${p.maxHealth}`
      btn.style.cssText = 'display:block;width:100%;padding:10px;margin-bottom:8px;font-size:14px;font-weight:bold;border:2px solid #333;border-radius:6px;cursor:pointer;background:#f8f8f8;'
      
      btn.onclick = () => {
        if (isActive) {
          showNotification(`${p.name} sudah berada di arena!`)
          return
        }
        if (p.health <= 0) {
          showNotification(`${p.name} pingsan dan tidak bisa bertarung!`)
          return
        }
        switchPokemon(index)
      }
      bagBox.append(btn)
    })

    // Back button (only allow backing out if active pokemon is still conscious)
    if (emby.health > 0) {
      const backBtn = document.createElement('button')
      backBtn.innerHTML = '← Back'
      backBtn.style.cssText = 'display:block;width:100%;padding:10px;font-size:14px;font-weight:bold;border:2px solid #333;border-radius:6px;cursor:pointer;background:#eee;'
      backBtn.onclick = () => showMainMenu()
      bagBox.append(backBtn)
    }
  }

  // --- Helper: Switch Pokemon in battle ---
  function switchPokemon(index) {
    document.querySelector('#bottomContainer').style.pointerEvents = 'none'
    
    // Save current active pokemon stats back to team array
    const activeP = window.playerData.team[window.activePokemonIndex]
    if (activeP) {
      activeP.health = emby.health
      activeP.maxHealth = emby.maxHealth
      activeP.attacks = JSON.parse(JSON.stringify(emby.attacks))
    }

    const oldName = emby.name
    const newPokemonData = window.playerData.team[index]
    window.activePokemonIndex = index

    gsap.to(emby, {
      opacity: 0,
      duration: 0.4,
      onComplete: () => {
        // Instantiate new active player sprite
        const monsterData = monsters[newPokemonData.name]
        emby = new Monster({
          ...monsterData,
          position: monsterData.playerPos || { x: 280, y: 325 },
          isEnemy: false,
          level: newPokemonData.level
        })
        emby.health = newPokemonData.health
        emby.maxHealth = newPokemonData.maxHealth
        emby.exp = newPokemonData.exp
        emby.attacks = JSON.parse(JSON.stringify(newPokemonData.attacks))

        // Update UI
        document.querySelector('#playerNameText').innerHTML = emby.name
        document.querySelector('#playerLevel').innerHTML = 'Lv. ' + emby.level
        document.querySelector('#playerHealthText').innerHTML = emby.health + '/' + emby.maxHealth
        gsap.to('#playerHealthBar', { width: (emby.health / emby.maxHealth) * 100 + '%', duration: 0 })
        const expPercent = (emby.exp / (emby.level * 100)) * 100
        gsap.to('#playerExpBar', { width: expPercent + '%' })

        // Update renderedSprites
        renderedSprites[1] = emby
        emby.opacity = 0

        // Recreate attack buttons
        document.querySelector('#attacksBox').replaceChildren()
        emby.attacks.forEach((attack) => {
          const button = document.createElement('button')
          button.innerHTML = `${attack.name}<br><span style="font-size:11px;color:#666;">PP ${attack.pp}/${attack.maxPp}</span>`
          button.dataset.attackName = attack.name
          document.querySelector('#attacksBox').append(button)
        })
        setupAttackButtonListeners()

        gsap.to(emby, {
          opacity: 1,
          duration: 0.4,
          onComplete: () => {
            showMainMenu()
            document.querySelector('#dialogueBox').innerHTML = `Kembali, ${oldName}! Pergilah, ${emby.name}!`
            
            setTimeout(() => {
              enemyTurn()
            }, 1500)
          }
        })
      }
    })
  }

  // --- Helper: Update attack info panel (PP and Type) ---
  function updateAttackInfo(attack) {
    document.querySelector('#attackPpText').innerHTML = `PP ${attack.pp}/${attack.maxPp}`
    document.querySelector('#attackTypeText').innerHTML = `TYPE/${attack.type.toUpperCase()}`
    document.querySelector('#attackTypeText').style.color = attack.color
  }

  // --- Helper: Update PP text on all attack buttons ---
  function refreshAttackButtons() {
    const buttons = document.querySelectorAll('#attacksBox button')
    buttons.forEach((btn, i) => {
      const atk = emby.attacks[i]
      if (atk) {
        btn.innerHTML = `${atk.name}<br><span style="font-size:11px;color:#666;">PP ${atk.pp}/${atk.maxPp}</span>`
        btn.dataset.attackName = atk.name
        if (atk.pp <= 0) {
          btn.style.opacity = '0.4'
          btn.style.cursor = 'not-allowed'
        } else {
          btn.style.opacity = '1'
          btn.style.cursor = 'pointer'
        }
      }
    })
  }

  // Re-attach listeners to attacksBox buttons helper
  function setupAttackButtonListeners() {
    document.querySelectorAll('#attacksBox button').forEach((button) => {
      // Remove old listeners by replacing button with its clone
      const newBtn = button.cloneNode(true)
      button.parentNode.replaceChild(newBtn, button)

      newBtn.addEventListener('click', (e) => {
        const attackName = e.currentTarget.dataset.attackName
        const selectedAttack = attacks[attackName]
        const myAttack = emby.attacks.find(a => a.name === attackName)

        // Check PP
        if (!myAttack || myAttack.pp <= 0) {
          showNotification('Tidak ada PP tersisa untuk serangan ini!')
          return
        }

        // Disable menus during animation
        document.querySelector('#bottomContainer').style.pointerEvents = 'none'

        // Emby menyerang
        emby.attack({
          attack: selectedAttack,
          recipient: enemyMonster,
          renderedSprites,
          onComplete: () => {
            if (enemyMonster.health <= 0) {
              processWin()
            } else {
              setTimeout(() => {
                enemyTurn()
              }, 1000)
            }
          }
        })

        // Refresh attack buttons with updated PP
        refreshAttackButtons()

        // Return to main menu (showing text, actual buttons are hidden)
        showMainMenu()
        document.querySelector('#dialogueBox').innerHTML = `${emby.name} used ${attackName}!`

        // Save state
        saveState()
      })

      newBtn.addEventListener('mouseenter', (e) => {
        const attackName = e.currentTarget.dataset.attackName
        const myAttack = emby.attacks.find(a => a.name === attackName)
        if (myAttack) updateAttackInfo(myAttack)
      })
    })
  }

  // Create initial attack buttons
  emby.attacks.forEach((attack) => {
    const button = document.createElement('button')
    button.innerHTML = `${attack.name}<br><span style="font-size:11px;color:#666;">PP ${attack.pp}/${attack.maxPp}</span>`
    button.dataset.attackName = attack.name
    document.querySelector('#attacksBox').append(button)
  })
  setupAttackButtonListeners()

  // Setup Bag UI
  function updateBagUI() {
    const bagBox = document.querySelector('#bagBox')
    bagBox.replaceChildren()
    
    const hpBtn = document.createElement('button')
    hpBtn.innerHTML = `🧪 HP Potion (${window.playerData.hpPotions})`
    hpBtn.style.cssText = 'display:block;width:100%;padding:10px;margin-bottom:8px;font-size:14px;font-weight:bold;border:2px solid #333;border-radius:6px;cursor:pointer;background:#f8f8f8;'
    hpBtn.onclick = () => useItem('hp')
    
    const etherBtn = document.createElement('button')
    etherBtn.innerHTML = `✨ Ether (${window.playerData.ethers})`
    etherBtn.style.cssText = 'display:block;width:100%;padding:10px;margin-bottom:8px;font-size:14px;font-weight:bold;border:2px solid #333;border-radius:6px;cursor:pointer;background:#f8f8f8;'
    etherBtn.onclick = () => useItem('ether')

    const ballBtn = document.createElement('button')
    ballBtn.innerHTML = `🔴 PokeBall (${window.playerData.pokeBalls})`
    ballBtn.style.cssText = 'display:block;width:100%;padding:10px;margin-bottom:8px;font-size:14px;font-weight:bold;border:2px solid #333;border-radius:6px;cursor:pointer;background:#f8f8f8;'
    ballBtn.onclick = () => useItem('pokeball')
    
    const backBtn = document.createElement('button')
    backBtn.innerHTML = '← Back'
    backBtn.style.cssText = 'display:block;width:100%;padding:10px;font-size:14px;font-weight:bold;border:2px solid #333;border-radius:6px;cursor:pointer;background:#eee;'
    backBtn.onclick = () => showMainMenu()
    
    bagBox.append(hpBtn, etherBtn, ballBtn, backBtn)
  }

  // --- Button event listeners for the main 4 action buttons ---
  document.querySelector('#btnFight').onclick = () => showAttacksMenu()
  document.querySelector('#btnBag').onclick = () => showBagMenu()
  document.querySelector('#btnPokemon').onclick = () => showPokemonMenu()
  
  document.querySelector('#btnRun').onclick = () => {
    document.querySelector('#bottomContainer').style.pointerEvents = 'none'
    document.querySelector('#dialogueBox').style.display = 'flex'
    // 50% chance to run
    if (Math.random() < 0.5) {
      document.querySelector('#dialogueBox').innerHTML = 'Got away safely!'
      setTimeout(() => {
        endBattle()
      }, 1500)
    } else {
      document.querySelector('#dialogueBox').innerHTML = "Can't escape!"
      setTimeout(() => {
        enemyTurn()
      }, 1500)
    }
  }

  function useItem(type) {
    if (type === 'hp' && window.playerData.hpPotions > 0) {
      if (emby.health >= emby.maxHealth) { showNotification("HP penuh!"); return; }
      document.querySelector('#bottomContainer').style.pointerEvents = 'none'
      window.playerData.hpPotions--
      emby.health = Math.min(emby.maxHealth, emby.health + 50)
      emby.showFloatingText('+50 HP', 'green')
      gsap.to('#playerHealthBar', { width: (emby.health / emby.maxHealth) * 100 + '%' })
      document.querySelector('#playerHealthText').innerHTML = emby.health + '/' + emby.maxHealth
      
      showMainMenu()
      document.querySelector('#dialogueBox').innerHTML = `${emby.name} used HP Potion!`
      updateBagUI()
      setTimeout(() => {
        enemyTurn()
      }, 1500)
    } else if (type === 'ether' && window.playerData.ethers > 0) {
      // Restore 10 PP to the attack with lowest PP ratio
      const target = emby.attacks.reduce((lowest, a) => {
        return (a.pp / a.maxPp) < (lowest.pp / lowest.maxPp) ? a : lowest
      })
      if (target.pp >= target.maxPp) { showNotification("PP sudah penuh!"); return; }
      document.querySelector('#bottomContainer').style.pointerEvents = 'none'
      window.playerData.ethers--
      target.pp = Math.min(target.maxPp, target.pp + 10)
      emby.showFloatingText(`+10 PP ${target.name}`, 'blue')
      refreshAttackButtons()
      
      showMainMenu()
      document.querySelector('#dialogueBox').innerHTML = `${emby.name} used Ether on ${target.name}!`
      updateBagUI()
      setTimeout(() => {
        enemyTurn()
      }, 1500)
    } else if (type === 'pokeball' && window.playerData.pokeBalls > 0) {
      document.querySelector('#bottomContainer').style.pointerEvents = 'none'
      window.playerData.pokeBalls--
      showMainMenu()
      document.querySelector('#dialogueBox').innerHTML = `${emby.name} threw a PokeBall!`
      updateBagUI()
      throwPokeBall()
    } else {
      showNotification("Item habis!")
      return
    }
    
    // Save state
    saveState()
  }

  function throwPokeBall() {
    // Dynamic Scale PokeBall based on natural image width to be exactly 35px
    const targetSize = 35
    const ballScale = logoPokeballImage.width ? (targetSize / logoPokeballImage.width) : 0.08

    // Spawn PokeBall sprite
    const pokeball = new Sprite({
      position: { x: emby.position.x + 80, y: emby.position.y },
      image: logoPokeballImage,
      scale: ballScale
    })
    renderedSprites.push(pokeball)

    // Throw arc: GSAP animation
    // Move to peak first, then drop to enemy
    gsap.to(pokeball.position, {
      x: enemyMonster.position.x + (enemyMonster.width / 2) - 15,
      y: enemyMonster.position.y - 60,
      duration: 0.5,
      ease: 'power1.out',
      onComplete: () => {
        gsap.to(pokeball.position, {
          y: enemyMonster.position.y + enemyMonster.height - 30,
          duration: 0.4,
          ease: 'bounce.out',
          onComplete: () => {
            // Ball hits target, hide enemy (sucked in)
            audio.tackleHit.play()
            gsap.to(enemyMonster, {
              opacity: 0,
              duration: 0.3,
              onComplete: () => {
                // Start shaking sequence
                shakePokeBall(pokeball)
              }
            })
          }
        })
      }
    })
  }

  function shakePokeBall(pokeball) {
    let shakeCount = 0
    const maxShakes = 3

    function doShake() {
      if (shakeCount < maxShakes) {
        // Shake rotation
        gsap.to(pokeball, {
          rotation: 0.3,
          duration: 0.15,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            shakeCount++
            // Delay before next shake
            setTimeout(doShake, 600)
          }
        })
      } else {
        // Calculate catch rate based on enemy current health percentage
        const healthPercent = enemyMonster.health / enemyMonster.maxHealth
        const catchChance = 1 - healthPercent + 0.15 // Lower HP = higher chance
        const success = Math.random() < catchChance

        if (success) {
          // Captured!
          document.querySelector('#dialogueBox').innerHTML = `Captured wild ${enemyMonster.name}!`
          audio.victory.play()
          
          // Add captured Pokemon to Player Team (max 6)
          if (window.playerData.team.length < 6) {
            window.playerData.team.push({
              name: enemyMonster.name,
              level: enemyMonster.level,
              exp: 0,
              health: enemyMonster.maxHealth,
              maxHealth: enemyMonster.maxHealth,
              attacks: JSON.parse(JSON.stringify(enemyMonster.attacks))
            })
            showNotification(`${enemyMonster.name} ditambahkan ke timmu!`)
          } else {
            showNotification(`Tim penuh! ${enemyMonster.name} dikirim ke PC Box.`)
          }
          
          // Remove PokeBall
          const index = renderedSprites.indexOf(pokeball)
          if (index > -1) renderedSprites.splice(index, 1)

          // Save state and end battle
          saveState()
          setTimeout(() => {
            endBattle()
          }, 2000)
        } else {
          // Broke free!
          gsap.to(pokeball, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
              // Remove PokeBall
              const index = renderedSprites.indexOf(pokeball)
              if (index > -1) renderedSprites.splice(index, 1)

              // Restore enemy opacity
              gsap.to(enemyMonster, {
                opacity: 1,
                duration: 0.3,
                onComplete: () => {
                  document.querySelector('#dialogueBox').innerHTML = `Oh no! Wild ${enemyMonster.name} broke free!`
                  setTimeout(() => {
                    enemyTurn()
                  }, 1500)
                }
              })
            }
          })
        }
      }
    }
    // Start shaking after a short delay
    setTimeout(doShake, 500)
  }

  function saveState() {
    // Sync current active pokemon stats back to team array
    const activeP = window.playerData.team[window.activePokemonIndex]
    if (activeP) {
      activeP.health = emby.health
      activeP.maxHealth = emby.maxHealth
      activeP.level = emby.level
      activeP.exp = emby.exp
      activeP.attacks = JSON.parse(JSON.stringify(emby.attacks))
    }

    // Backwards compatibility sync for save slot slot 0 (main Emby stats)
    const firstP = window.playerData.team[0]
    if (firstP) {
      window.playerData.level = firstP.level
      window.playerData.exp = firstP.exp
      window.playerData.maxHealth = firstP.maxHealth
      window.playerData.attackPP = {}
      firstP.attacks.forEach(a => {
        window.playerData.attackPP[a.name] = a.pp
      })
    }

    localStorage.setItem('pokemonData', JSON.stringify(window.playerData))
  }

  function enemyTurn() {
    if (enemyMonster.health <= 0) return;
    const selectedEnemyAttack = chooseEnemyAttack(enemyMonster)

    enemyMonster.attack({
      attack: selectedEnemyAttack,
      recipient: emby,
      renderedSprites,
      onComplete: () => {
        if (emby.health <= 0) {
          // Sync fainted state to team
          const activeP = window.playerData.team[window.activePokemonIndex]
          if (activeP) activeP.health = 0

          // Check if there are other conscious Pokemon
          const hasSurvivors = window.playerData.team.some(p => p.health > 0)
          if (hasSurvivors) {
            document.querySelector('#dialogueBox').innerHTML = `${emby.name} pingsan! Pilih Pokemon lain!`
            setTimeout(() => {
              showPokemonMenu()
            }, 1500)
          } else {
            processLoss()
          }
        } else {
          // Re-enable menus
          document.querySelector('#bottomContainer').style.pointerEvents = 'auto'
          showMainMenu()
        }
      }
    })
  }

  function processWin() {
    enemyMonster.faint()
    
    const expGain = enemyMonster.expReward
    document.querySelector('#dialogueBox').style.display = 'flex'
    document.querySelector('#dialogueBox').innerHTML = `${emby.name} gained ${expGain} EXP!`
    emby.exp += expGain
    
    const activeP = window.playerData.team[window.activePokemonIndex]
    if (activeP) {
      activeP.exp = emby.exp
    }

    const expNeeded = emby.level * 100
    let expPercent = (emby.exp / expNeeded) * 100
    
    if (emby.exp >= expNeeded) {
      emby.exp -= expNeeded
      emby.level++
      emby.maxHealth += 20
      emby.health = emby.maxHealth
      
      if (activeP) {
        activeP.level = emby.level
        activeP.exp = emby.exp
        activeP.maxHealth = emby.maxHealth
        activeP.health = emby.health
      }
      
      setTimeout(() => {
        document.querySelector('#dialogueBox').innerHTML = `${emby.name} leveled up to Lv. ${emby.level}!`
        document.querySelector('#playerLevel').innerHTML = 'Lv. ' + emby.level
        document.querySelector('#playerHealthText').innerHTML = emby.health + '/' + emby.maxHealth
        gsap.to('#playerHealthBar', { width: '100%' })
        gsap.to('#playerExpBar', { width: '0%', duration: 0 })
        
        setTimeout(() => {
          endBattle()
        }, 1500)
      }, 1500)
    } else {
      gsap.to('#playerExpBar', { width: expPercent + '%' })
      setTimeout(() => {
        endBattle()
      }, 1500)
    }
    
    // Save state after battle
    saveState()
  }

  function processLoss() {
    emby.faint()
    saveState()
    setTimeout(() => {
      endBattle()
    }, 1500)
  }

  function endBattle() {
    gsap.to('#overlappingDiv', {
      opacity: 1,
      onComplete: () => {
        cancelAnimationFrame(battleAnimationId)
        animate()
        document.querySelector('#userInterface').style.display = 'none'
        gsap.to('#overlappingDiv', { opacity: 0 })
        battle.initiated = false
        audio.Map.play()
        document.querySelector('#bottomContainer').style.pointerEvents = 'auto'
      }
    })
  }
}
function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle)
  battleBackground.draw()

  renderedSprites.forEach((sprite) => {
    sprite.draw()
  })
}

animate()

// Remove dialogue box click listener since turns are fully automatic now

const tutorialHTML = `
  <div id="tutorialOverlay" style="
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  ">
    <div id="tutorialBox" style="
      background: white;
      padding: 20px;
      border: 3px solid black;
      font-family: 'Press Start 2P', cursive;
      font-size: 10px;
      max-width: 90vw;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      text-align: center;
    ">
      <h2 style="font-size: 14px;">📖 Panduan Bermain</h2>
      <p>🎮 Gunakan tombol arah (WASD / Virtual D-Pad) untuk bergerak.</p>
      <p>⚔ Jelajahi Rumput Untuk Melawan Para Musuh.</p>
      <p>🤝 Tekan Spasi / Tombol 🤝 untuk berbicara dengan karakter.</p>
      <button onclick="document.getElementById('tutorialOverlay').style.display = 'none'"
        style="margin-top: 10px; padding: 6px 12px; font-size: 10px; cursor: pointer;">Tutup</button>
    </div>

    <div style="
      position: absolute;
      bottom: 10px;
      right: 14px;
      font-size: 8px;
      color: white;
      opacity: 0.7;
      font-family: 'Press Start 2P', cursive;
    ">
      Made by Dailan Gibran & ITK
    </div>
  </div>
`;



document.body.insertAdjacentHTML('beforeend', tutorialHTML);
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('tutorialBox').style.display = 'block';
  }, 1000);
});
