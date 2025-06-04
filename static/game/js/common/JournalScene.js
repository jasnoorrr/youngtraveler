import RewardManager from './RewardManager.js';

export default class JournalScene extends Phaser.Scene {
  constructor() { super('JournalScene'); }

  create() {
    this.add.rectangle(500,300,800,500,0x000000,0.8);
    this.add.text(500,100,'Your Journal',{font:'26px serif'}).setOrigin(0.5);

    const entries = RewardManager.instance.journal;
    entries.forEach((e,i) => {
      const y = 150 + i*40;
      this.add.text(150,y, `${e.word} = ${e.meaning}`, {font:'20px serif'});
      if (e.imgKey) this.add.image(400,y, e.imgKey).setScale(0.1);
      if (e.audioKey) {
        const btn = this.add.text(700,y,'🔊',{font:'20px serif', backgroundColor:'#fff'})
          .setInteractive()
          .on('pointerdown',()=> this.sound.play(e.audioKey));
      }
    });

    // close on click
    this.input.once('pointerdown', ()=> this.scene.stop());
  }
}
