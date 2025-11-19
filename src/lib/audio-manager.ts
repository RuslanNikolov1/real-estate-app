type AudioManagerListener = (isPlaying: boolean) => void;

interface PersistedAudioState {
  played: boolean;
  currentTime: number;
  volume: number;
  sessionId?: string | null;
}

const STORAGE_KEY = 'audioPlayerState';
const SESSION_STORAGE_KEY = 'audioPlayerSessionId';

class AudioManager {
  private audio: HTMLAudioElement | null = null;
  private listeners = new Set<AudioManagerListener>();
  private _isPlaying = false;
  private _volume = 1;
  private _isMuted = false;
  private initialized = false;
  private sessionId: string | null = null;

  initialize(src: string): boolean {
    if (this.initialized) return false;
    if (typeof window === 'undefined') return false;

    this.ensureSessionId();

    const savedState = this.loadState();

    this.audio = new Audio(src);
    this.audio.loop = true;
    this._volume = savedState?.volume ?? this._volume;
    this._isMuted = this._volume === 0;
    this.audio.volume = this._isMuted ? 0 : this._volume;
    this.initialized = true;

    const applySavedTime = () => {
      if (!savedState || !this.audio) return;
      const time = savedState.currentTime ?? 0;
      try {
        this.audio.currentTime = time;
      } catch {
        // ignore seek errors
      }
    };

    if (this.audio.readyState >= 1) {
      applySavedTime();
    } else {
      this.audio.addEventListener('loadedmetadata', applySavedTime, { once: true });
    }

    this.audio.addEventListener('play', () => {
      this._isPlaying = true;
      this.saveState();
      this.notifyListeners();
    });

    this.audio.addEventListener('pause', () => {
      this._isPlaying = false;
      this.saveState();
      this.notifyListeners();
    });

    this.audio.addEventListener('ended', () => {
      this._isPlaying = false;
      this.saveState();
      this.notifyListeners();
    });

    this.audio.addEventListener('timeupdate', () => {
      this.saveState();
    });

    const shouldAutoResume =
      savedState?.played && savedState.sessionId && savedState.sessionId === this.sessionId;

    if (shouldAutoResume) {
      this.play();
    } else {
      this._isPlaying = false;
      this.saveState();
      this.notifyListeners();
    }

    return true;
  }

  play() {
    if (!this.audio || !this.initialized) return;
    this._isPlaying = true;
    this.notifyListeners();

    this.audio.play().catch((error) => {
      console.error('Error playing audio:', error);
      this._isPlaying = false;
      this.notifyListeners();
    });
  }

  pause() {
    if (!this.audio || !this.initialized) return;
    this._isPlaying = false;
    this.audio.pause();
    this.saveState();
    this.notifyListeners();
  }

  toggle() {
    if (!this.initialized) return;
    if (this._isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  setVolume(volume: number) {
    this._volume = volume;
    this._isMuted = volume === 0;
    if (this.audio && this.initialized) {
      this.audio.volume = volume;
    }
    this.saveState();
  }

  get isPlaying() {
    return this._isPlaying;
  }

  get volume() {
    return this._volume;
  }

  get isMuted() {
    return this._isMuted;
  }

  get isInitialized() {
    return this.initialized;
  }

  subscribe(listener: AudioManagerListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this._isPlaying));
  }

  private loadState(): PersistedAudioState | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PersistedAudioState;
    } catch (error) {
      console.error('Failed to load audio state', error);
      return null;
    }
  }

  private saveState() {
    if (typeof window === 'undefined') return;
    if (!this.audio) return;

    const state: PersistedAudioState = {
      played: this._isPlaying,
      currentTime: this.audio.currentTime,
      volume: this._volume,
      sessionId: this.sessionId,
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save audio state', error);
    }
  }

  private ensureSessionId() {
    if (this.sessionId) return;
    if (typeof window === 'undefined') return;

    try {
      let existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!existing) {
        existing =
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2);
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, existing);
      }
      this.sessionId = existing;
    } catch (error) {
      console.error('Failed to initialize audio session id', error);
      this.sessionId = null;
    }
  }
}

export const audioManager = new AudioManager();

