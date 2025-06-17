// static/game/js/common/DialogueHelper.js

/**
 * Install a bubble-style dialogue helper into a Phaser scene.
 * Usage:
 *   import { installBubbleHelper } from '../common/DialogueHelper.js';
 *   installBubbleHelper(this);
 *   this.showBubbleDialogue('Raven', 'Hello!', { x: 100, y: 200 }, 3000);
 */
export function installBubbleHelper(scene) {
  scene.showBubbleDialogue = (speaker, text, pos, durationOverride = null) => {
    // Remove existing bubble if present
    if (scene.dialogueGroup) {
      scene.dialogueGroup.destroy(true);
    }
    if (scene.dialogueTimer) {
      scene.dialogueTimer.remove(false);
    }

    const bubbleWidth = 300;
    const bubbleHeight = 80;
    const padding = 10;

    // Draw rounded rectangle
    const bubble = scene.add.graphics();
    bubble.fillStyle(0x000000, 0.8);
    bubble.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 15);

    // Draw triangle pointer
    bubble.fillTriangle(
      bubbleWidth / 2 - 10, bubbleHeight,
      bubbleWidth / 2 + 10, bubbleHeight,
      bubbleWidth / 2, bubbleHeight + 15
    );

    // Add text
    const dialogueText = scene.add.text(padding, padding, `${speaker}:\n${text}`, {
      font: '18px serif',
      color: '#ffffff',
      wordWrap: { width: bubbleWidth - 2 * padding }
    });

    // Group bubble and text
    scene.dialogueGroup = scene.add.container(pos.x, pos.y, [bubble, dialogueText]);
    scene.dialogueGroup.setDepth(100);

    // Auto-destroy after duration
    const duration = durationOverride ?? (1000 + text.length * 50);
    scene.dialogueTimer = scene.time.delayedCall(duration, () => {
      scene.dialogueGroup.destroy(true);
      scene.dialogueGroup = null;
    });
  };
}
