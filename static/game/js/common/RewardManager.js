// RewardManager.js
export default class RewardManager {
  constructor() {
    if (RewardManager._instance) return RewardManager._instance;
    this.stars = 0;
    this.badges = new Set();
    this.journal = [];
    this.sceneProgress = 0;
    RewardManager._instance = this;
  }

  static get instance() {
    return new RewardManager();
  }

  awardStar(n = 1) {
    this.stars += n;
    // clamp if you want max stars
    return this.stars;
  }

  earnBadge(badgeKey) {
    this.badges.add(badgeKey);
  }

  addJournalEntry({ word, meaning, imgKey, audioKey, badgeKey = null }) {
    this.journal.push({ word, meaning, imgKey, audioKey, badgeKey });
  }

  advanceScene() {
    this.sceneProgress++;
    return this.sceneProgress;
  }
}
