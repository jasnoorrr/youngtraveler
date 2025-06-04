// static/game/js/episode1/scene8_Feast.js

import { speak }      from '../common/SpeechUtils.js';
import RewardManager  from '../common/RewardManager.js';

export default class Scene8_Feast extends Phaser.Scene {
  constructor() {
    super('scene8_Feast');
  }

  preload() {
    this.load.image('traveler1', '/static/game/assets/traveler1.png');
    this.load.image('traveler2', '/static/game/assets/traveler2.png');
    this.load.image('raven',     '/static/game/assets/raven.png');
    this.load.image('feastBg',    '/static/game/assets/feast_bg.png');   // platter/table background
    this.load.image('berry',      '/static/game/assets/berry.png');
    this.load.image('salmonFish', '/static/game/assets/salmonfish.png');
    this.load.audio('hakał',      '/static/game/assets/audio/hakal.mp3');
    this.load.audio('tsaa',       '/static/game/assets/audio/huckleberry.m4a');
    this.load.audio('talukw',     '/static/game/assets/audio/salmon.m4a');
  }

  create(data) {
    // 1) Advance progress to Scene 8/9
    RewardManager.instance.advanceScene();
    this.events.emit('updateProgress', RewardManager.instance.sceneProgress);

    // 2) Raven instruction
    speak("Time for a feast! Drag your berries and salmon from above onto the platter.");

    // 3) Draw the platter background (centered at x=500, y=300, sized 1000×600)
    this.add.image(500, 300, 'feastBg').setDisplaySize(1000, 600);
    const travelerKey = data.characterKey || 'traveler1';
    this.traveler = this.add.sprite(100, 200, travelerKey) // adjust (x,y) to taste
      .setScale(0.6)
      .setAlpha(0);                                   // start invisible

    const travelerKey = data.characterKey || 'traveler1';
    this.traveler = this.add.sprite(100, 200, travelerKey) // adjust (x,y) to taste
      .setScale(0.6)
      .setAlpha(0);
    // 4) Tween the traveler to fade in
    this.tweens.add({
      targets: this.traveler,
      alpha:   1,
      duration: 800
    });

    // 5) Add Raven (start off-screen or invisible)
    this.raven = this.add.image(700, 150, 'raven')   // adjust (x,y) to taste
      .setScale(0.45)
      .setAlpha(0);

    // 6) Tween Raven: fade in + (optionally) move to “perch” position
    this.tweens.add({
      targets: this.raven,
      alpha: 1,
      y:     200,       // final “perch” y—tweak to suit your layout
      ease:  'Power1',
      duration: 1000
    });


    // 4) Draw a semi-transparent “bubble” at the top middle to hold draggable items
    const bubbleX = this.cameras.main.centerX;
    const bubbleY = 100;
    const bubbleRadius = 100;
    const bubble = this.add.circle(bubbleX, bubbleY, bubbleRadius, 0xffffff, 0.3);
    bubble.setStrokeStyle(2, 0xccccff, 0.6);

    // 5) Prepare counters
    this.berryCount = 0;
    this.salmonCount = 0;

    // 6) Create 3 berries inside the bubble
    const berryXs = [bubbleX - 60, bubbleX, bubbleX + 60];
    berryXs.forEach((xPos, index) => {
      const b = this.add.image(xPos, bubbleY - 20, 'berry')
        .setScale(0.1)
        .setInteractive({ useHandCursor: true })
        .setData('type', 'berry')
        .setData('inBubble', true);     // marker for bubble
      this.input.setDraggable(b);
    });

    // 7) Create 3 salmon icons inside the bubble
    const salmonXs = [bubbleX - 60, bubbleX, bubbleX + 60];
    salmonXs.forEach((xPos, index) => {
      const s = this.add.image(xPos, bubbleY + 40, 'salmonFish')
        .setScale(0.1)
        .setInteractive({ useHandCursor: true })
        .setData('type', 'salmon')
        .setData('inBubble', true);
      this.input.setDraggable(s);
    });

    // 8) Allow dragging: any icon follows pointer
    this.input.on('drag', (pointer, img, dragX, dragY) => {
      img.x = dragX;
      img.y = dragY;
      img.setData('inBubble', false);  // once dragged out, mark as no longer in bubble
    });

    // 9) When dragging ends, check if dropped onto platter area
    this.input.on('dragend', (pointer, img) => {
      // Compute distance from platter center (500, 300)
      const dx = img.x - 500;
      const dy = img.y - 500;
      if (dx * dx + dy * dy < 200 * 200) {
        // Snap onto platter and disable further dragging
        img.setScale(0.1).disableInteractive();

        const itemType = img.getData('type');
        if (itemType === 'berry') {
          this.berryCount++;
          // Play “Tsaa!” (berry) once
          speak("Tsaa!");
          RewardManager.instance.awardStar(1);
          RewardManager.instance.addJournalEntry({
            word:    'tsaa',
            meaning: 'berry',
            imgKey:  'berry',
            audioKey:'tsaa'
          });
          this.events.emit('updateStars', RewardManager.instance.stars);
        } else {
          this.salmonCount++;
          // Play “Talukw!” (salmon) once
          speak("Talukw!");
          RewardManager.instance.awardStar(1);
          RewardManager.instance.addJournalEntry({
            word:    'talukw',
            meaning: 'salmon',
            imgKey:  'salmonFish',
            audioKey:'talukw'
          });
          this.events.emit('updateStars', RewardManager.instance.stars);
        }

        // 10) Once all 6 items (3 berries + 3 salmon) are placed:
        if (this.berryCount === 3 && this.salmonCount === 3) {
          // Play “Hakał!” (feast) and then transition
          speak("Hakał!");
          this.time.delayedCall(1000, () => {
            speak("It was a delicious meal! Thanks a lot!");
            this.time.delayedCall(1000, () => {
              speak("And I also learned a lot! Tsaa, t’enäh, bäts, talukw, usjooh, Whundzahbun.");
              this.time.delayedCall(2000, () => {
                speak("Let’s celebrate! You did it! Ready for the next adventure?");
                // After Raven’s last line, go to Outro
                this.time.delayedCall(2000, () => {
                  this.scene.start('scene9_Outro', data);
                });
              });
            });
          });
        }
      } else {
        // If dropped outside the platter, snap back inside the bubble area:
        img.setData('inBubble', true);
        // Determine vertical offset so we place it back into the top bubble neatly
        const isBerry = img.getData('type') === 'berry';
        const destY = isBerry ? bubbleY - 20 : bubbleY + 40;
        // Snap back to original X if still inside bubble boundary, else clamp
        const minX = bubbleX - bubbleRadius + 20;
        const maxX = bubbleX + bubbleRadius - 20;
        img.x = Phaser.Math.Clamp(img.x, minX, maxX);
        img.y = destY;
      }
    });
  }
}
