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
    this.load.image('feastBg',    '/static/game/assets/feast_bg.png');
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

    // 4) Add traveler sprite
    const travelerKey = data.characterKey || 'traveler1';
    this.traveler = this.add.sprite(100, 200, travelerKey)
      .setScale(0.6)
      .setAlpha(0);

    // 5) Tween the traveler to fade in
    this.tweens.add({
      targets: this.traveler,
      alpha:   1,
      duration: 800
    });

    // 6) Add Raven (start off-screen or invisible)
    this.raven = this.add.image(700, 150, 'raven')
      .setScale(0.45)
      .setAlpha(0);

    // 7) Tween Raven: fade in + move to “perch” position
    this.tweens.add({
      targets: this.raven,
      alpha: 1,
      y:     200,
      ease:  'Power1',
      duration: 1000
    });

    // 8) Draw a semi-transparent “bubble” at the top middle to hold draggable items
    const bubbleX = this.cameras.main.centerX;
    const bubbleY = 100;
    const bubbleRadius = 100;
    const bubble = this.add.circle(bubbleX, bubbleY, bubbleRadius, 0xffffff, 0.3);
    bubble.setStrokeStyle(2, 0xccccff, 0.6);

    // 9) Prepare counters
    this.berryCount = 0;
    this.salmonCount = 0;

    // 10) Create 3 berries inside the bubble
    const berryXs = [bubbleX - 60, bubbleX, bubbleX + 60];
    berryXs.forEach((xPos) => {
      const b = this.add.image(xPos, bubbleY - 20, 'berry')
        .setScale(0.1)
        .setInteractive({ useHandCursor: true })
        .setData('type', 'berry')
        .setData('inBubble', true);
      this.input.setDraggable(b);
    });

    // 11) Create 3 salmon icons inside the bubble
    const salmonXs = [bubbleX - 60, bubbleX, bubbleX + 60];
    salmonXs.forEach((xPos) => {
      const s = this.add.image(xPos, bubbleY + 40, 'salmonFish')
        .setScale(0.1)
        .setInteractive({ useHandCursor: true })
        .setData('type', 'salmon')
        .setData('inBubble', true);
      this.input.setDraggable(s);
    });

    // 12) Allow dragging: any icon follows pointer
    this.input.on('drag', (pointer, img, dragX, dragY) => {
      img.x = dragX;
      img.y = dragY;
      img.setData('inBubble', false);
    });

    // 13) When dragging ends, check if dropped onto platter area
    this.input.on('dragend', (pointer, img) => {
      // Compute distance from platter center (500, 300)
      const dx = img.x - 500;
      const dy = img.y - 300;
      if (dx * dx + dy * dy < 200 * 200) {
        // Snap onto platter and disable further dragging
        img.setScale(0.1).disableInteractive();

        const itemType = img.getData('type');
        if (itemType === 'berry') {
          this.berryCount++;
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

        // 14) Once all 6 items are placed (3 berries + 3 salmon):
        if (this.berryCount === 3 && this.salmonCount === 3) {
          speak("Hakał!");
          this.time.delayedCall(1000, () => {
            speak("It was a delicious meal! Thanks a lot!");
            this.time.delayedCall(1000, () => {
              speak("And I also learned a lot! Tsaa, t’enäh, bäts, talukw, usjooh, Whundzahbun.");
              this.time.delayedCall(2000, () => {
                speak("Let’s celebrate! You did it! Ready for the next adventure?");
                this.time.delayedCall(2000, () => {
                  this.scene.start('scene9_Outro', data);
                });
              });
            });
          });
        }
      } else {
        // If dropped outside the platter, snap back into bubble
        img.setData('inBubble', true);
        const isBerry = img.getData('type') === 'berry';
        const destY = isBerry ? bubbleY - 20 : bubbleY + 40;
        const minX = bubbleX - bubbleRadius + 20;
        const maxX = bubbleX + bubbleRadius - 20;
        img.x = Phaser.Math.Clamp(img.x, minX, maxX);
        img.y = destY;
      }
    });
  }
}
