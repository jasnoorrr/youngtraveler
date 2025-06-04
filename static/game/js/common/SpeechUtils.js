// static/game/js/common/SpeechUtils.js

/**
 * Speak the given text using the Web Speech API.
 * Prefers the 'Brian' voice if available; otherwise uses the first available voice.
 * @param {string} text - The text to speak.
 */
export function speak(text) {
  // Cancel any existing utterance
  window.speechSynthesis.cancel();

  // Create a new utterance for the given text
  const utterance = new SpeechSynthesisUtterance(text);

  // Get the list of available voices
  const voices = window.speechSynthesis.getVoices();

  // Select Brian if available, otherwise fall back to the first one
  utterance.voice = voices.find(v => v.name === 'Brian') || voices[0];

  // Adjust speaking characteristics
  utterance.rate   = 1.5; // Speed (0.1 to 10)
  utterance.pitch  = 1.0; // Pitch (0 to 2)
  utterance.volume = 1.0; // Volume (0 to 1)

  // Speak the utterance
  window.speechSynthesis.speak(utterance);
}

// Helper to ensure voices are loaded (call once at app startup)
export function initVoices() {
  // Some browsers load voices asynchronously; trigger load
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
