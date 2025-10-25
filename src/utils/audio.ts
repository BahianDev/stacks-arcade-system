// Audio utility functions for retro game sounds
class AudioManager {
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private music: HTMLAudioElement | null = null;
  private mainMusic: HTMLAudioElement | null = null; // Landing page music
  private homepageMusic: HTMLAudioElement | null = null; // Homepage music
  private gameMusic: HTMLAudioElement | null = null; // Token Sniper game music
  private musicVolume = 0.5;
  private sfxVolume = 0.3;
  private audioContext: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private isMusicMuted = false;
  private isMainMusicLoaded = false;
  private isHomepageMusicLoaded = false;
  private isGameMusicLoaded = false;
  private musicStartPromise: Promise<boolean> | null = null;
  private homepageMusicStartPromise: Promise<boolean> | null = null;
  private gameMusicStartPromise: Promise<boolean> | null = null;

  // Load sound effect
  loadSound(name: string, url: string) {
    try {
      const audio = new Audio(url);
      audio.volume = this.sfxVolume;
      this.sounds[name] = audio;
    } catch (error) {
      console.warn(`Failed to load sound: ${name}`, error);
    }
  }

  // Play sound effect
  playSound(name: string) {
    try {
      if (this.sounds[name]) {
        const sound = this.sounds[name].cloneNode() as HTMLAudioElement;
        sound.volume = this.sfxVolume;
        sound.play().catch(e => console.warn(`Failed to play sound: ${name}`, e));
      }
    } catch (error) {
      console.warn(`Error playing sound: ${name}`, error);
    }
  }

  // Initialize and preload main music (landing page)
  async initializeMainMusic() {
    try {
      if (this.mainMusic) {
        return true; // Already initialized
      }

      console.log('Initializing main music...');
      
      this.mainMusic = new Audio();
      this.mainMusic.src = 'https://zrwxctrfycldinkwrjrd.supabase.co/storage/v1/object/sign/website-assets/audio/LandingMusic.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZTU0ZTRiZi0wNjk4LTQzOTQtOTllNi0wMjc0NmQ1ZTUzNTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWJzaXRlLWFzc2V0cy9hdWRpby9MYW5kaW5nTXVzaWMubXAzIiwiaWF0IjoxNzUxMTkxMjg0LCJleHAiOjIzNTAzNzUyODR9.C0HrEBOunVLsnJg9Y524e-AuhrkeobjIMsXEb__W4To';
      this.mainMusic.loop = true;
      this.mainMusic.volume = this.isMusicMuted ? 0 : this.musicVolume;
      this.mainMusic.preload = 'auto';
      this.mainMusic.crossOrigin = 'anonymous';
      
      return new Promise<boolean>((resolve) => {
        let resolved = false;
        
        const resolveOnce = (success: boolean) => {
          if (!resolved) {
            resolved = true;
            resolve(success);
          }
        };

        this.mainMusic!.addEventListener('canplaythrough', () => {
          console.log('Main music can play through');
          this.isMainMusicLoaded = true;
          resolveOnce(true);
        }, { once: true });
        
        this.mainMusic!.addEventListener('loadeddata', () => {
          console.log('Main music data loaded');
          if (this.mainMusic!.readyState >= 2) {
            this.isMainMusicLoaded = true;
            resolveOnce(true);
          }
        });
        
        this.mainMusic!.addEventListener('error', (e) => {
          console.warn('Failed to load main music:', e);
          resolveOnce(false);
        }, { once: true });

        setTimeout(() => {
          if (this.mainMusic && this.mainMusic.readyState >= 2) {
            console.log('Main music loaded via timeout check');
            this.isMainMusicLoaded = true;
            resolveOnce(true);
          } else {
            console.warn('Main music loading timeout');
            resolveOnce(false);
          }
        }, 3000);

        this.mainMusic!.load();
      });
      
    } catch (error) {
      console.warn('Failed to initialize main music:', error);
      return false;
    }
  }

  // Initialize and preload homepage music
  async initializeHomepageMusic() {
    try {
      if (this.homepageMusic) {
        return true; // Already initialized
      }

      console.log('Initializing homepage music...');
      
      this.homepageMusic = new Audio();
      this.homepageMusic.src = 'https://zrwxctrfycldinkwrjrd.supabase.co/storage/v1/object/sign/website-assets/audio/Homepage.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZTU0ZTRiZi0wNjk4LTQzOTQtOTllNi0wMjc0NmQ1ZTUzNTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWJzaXRlLWFzc2V0cy9hdWRpby9Ib21lcGFnZS5tcDMiLCJpYXQiOjE3NTExOTE2MzcsImV4cCI6MjA2NjU1MTYzN30.pbGTbRZiw8u42KMOvivj0Nh4x_VsiuZW3TqGpA2Q6sA';
      this.homepageMusic.loop = true;
      this.homepageMusic.volume = this.isMusicMuted ? 0 : this.musicVolume;
      this.homepageMusic.preload = 'auto';
      this.homepageMusic.crossOrigin = 'anonymous';
      
      return new Promise<boolean>((resolve) => {
        let resolved = false;
        
        const resolveOnce = (success: boolean) => {
          if (!resolved) {
            resolved = true;
            resolve(success);
          }
        };

        this.homepageMusic!.addEventListener('canplaythrough', () => {
          console.log('Homepage music can play through');
          this.isHomepageMusicLoaded = true;
          resolveOnce(true);
        }, { once: true });
        
        this.homepageMusic!.addEventListener('loadeddata', () => {
          console.log('Homepage music data loaded');
          if (this.homepageMusic!.readyState >= 2) {
            this.isHomepageMusicLoaded = true;
            resolveOnce(true);
          }
        });
        
        this.homepageMusic!.addEventListener('error', (e) => {
          console.warn('Failed to load homepage music:', e);
          resolveOnce(false);
        }, { once: true });

        setTimeout(() => {
          if (this.homepageMusic && this.homepageMusic.readyState >= 2) {
            console.log('Homepage music loaded via timeout check');
            this.isHomepageMusicLoaded = true;
            resolveOnce(true);
          } else {
            console.warn('Homepage music loading timeout');
            resolveOnce(false);
          }
        }, 3000);

        this.homepageMusic!.load();
      });
      
    } catch (error) {
      console.warn('Failed to initialize homepage music:', error);
      return false;
    }
  }

  // Initialize and preload game music (Token Sniper)
  async initializeGameMusic() {
    try {
      if (this.gameMusic) {
        return true; // Already initialized
      }

      console.log('Initializing game music...');
      
      this.gameMusic = new Audio();
      this.gameMusic.src = 'https://zrwxctrfycldinkwrjrd.supabase.co/storage/v1/object/sign/website-assets/token-sniper/Audio/Bg%20Token%20SNiper.wav?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZTU0ZTRiZi0wNjk4LTQzOTQtOTllNi0wMjc0NmQ1ZTUzNTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWJzaXRlLWFzc2V0cy90b2tlbi1zbmlwZXIvQXVkaW8vQmcgVG9rZW4gU05pcGVyLndhdiIsImlhdCI6MTc1MjEzNTA2OSwiZXhwIjo0OTA1NzM1MDY5fQ.ZqPdoTtKI0itVexrXKbf_25ary6RvOsTCF_5YOIiIB4';
      this.gameMusic.loop = true;
      this.gameMusic.volume = this.isMusicMuted ? 0 : this.musicVolume;
      this.gameMusic.preload = 'auto';
      this.gameMusic.crossOrigin = 'anonymous';
      
      return new Promise<boolean>((resolve) => {
        let resolved = false;
        
        const resolveOnce = (success: boolean) => {
          if (!resolved) {
            resolved = true;
            resolve(success);
          }
        };

        this.gameMusic!.addEventListener('canplaythrough', () => {
          console.log('Game music can play through');
          this.isGameMusicLoaded = true;
          resolveOnce(true);
        }, { once: true });
        
        this.gameMusic!.addEventListener('loadeddata', () => {
          console.log('Game music data loaded');
          if (this.gameMusic!.readyState >= 2) {
            this.isGameMusicLoaded = true;
            resolveOnce(true);
          }
        });
        
        this.gameMusic!.addEventListener('error', (e) => {
          console.warn('Failed to load game music:', e);
          resolveOnce(false);
        }, { once: true });

        setTimeout(() => {
          if (this.gameMusic && this.gameMusic.readyState >= 2) {
            console.log('Game music loaded via timeout check');
            this.isGameMusicLoaded = true;
            resolveOnce(true);
          } else {
            console.warn('Game music loading timeout');
            resolveOnce(false);
          }
        }, 3000);

        this.gameMusic!.load();
      });
      
    } catch (error) {
      console.warn('Failed to initialize game music:', error);
      return false;
    }
  }

  // Start main music (landing page)
  async startMainMusic() {
    try {
      console.log('Attempting to start main music...');
      
      if (this.musicStartPromise) {
        return await this.musicStartPromise;
      }

      this.musicStartPromise = this._startMainMusicInternal();
      const result = await this.musicStartPromise;
      this.musicStartPromise = null;
      return result;
      
    } catch (error) {
      console.warn('Failed to start main music:', error);
      this.musicStartPromise = null;
      return false;
    }
  }

  private async _startMainMusicInternal(): Promise<boolean> {
    // CRITICAL FIX: Stop ALL other music first
    this.stopHomepageMusic();
    this.stopMusic();

    if (!this.mainMusic) {
      const initialized = await this.initializeMainMusic();
      if (!initialized) {
        return false;
      }
    }

    if (!this.mainMusic) {
      return false;
    }

    try {
      this.mainMusic.currentTime = 0;
      this.mainMusic.volume = this.isMusicMuted ? 0 : this.musicVolume;
      this.mainMusic.muted = false;
      
      const playPromise = this.mainMusic.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log('Main music started successfully');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.warn('Direct play failed, trying workaround:', error);
      
      try {
        this.mainMusic.muted = true;
        this.mainMusic.volume = this.musicVolume;
        
        const mutedPlayPromise = this.mainMusic.play();
        if (mutedPlayPromise !== undefined) {
          await mutedPlayPromise;
        }
        
        setTimeout(() => {
          if (this.mainMusic && !this.isMusicMuted) {
            this.mainMusic.muted = false;
            console.log('Main music unmuted after workaround');
          }
        }, 100);
        
        console.log('Main music started with muted workaround');
        return true;
        
      } catch (mutedError) {
        console.warn('Failed to start main music even with muted workaround:', mutedError);
        return false;
      }
    }
  }

  // Start homepage music
  async startHomepageMusic() {
    try {
      console.log('Attempting to start homepage music...');
      
      if (this.homepageMusicStartPromise) {
        return await this.homepageMusicStartPromise;
      }

      this.homepageMusicStartPromise = this._startHomepageMusicInternal();
      const result = await this.homepageMusicStartPromise;
      this.homepageMusicStartPromise = null;
      return result;
      
    } catch (error) {
      console.warn('Failed to start homepage music:', error);
      this.homepageMusicStartPromise = null;
      return false;
    }
  }

  private async _startHomepageMusicInternal(): Promise<boolean> {
    // CRITICAL FIX: Stop ALL other music first
    this.stopMainMusic();
    this.stopMusic();

    if (!this.homepageMusic) {
      const initialized = await this.initializeHomepageMusic();
      if (!initialized) {
        return false;
      }
    }

    if (!this.homepageMusic) {
      return false;
    }

    try {
      this.homepageMusic.currentTime = 0;
      this.homepageMusic.volume = this.isMusicMuted ? 0 : this.musicVolume;
      this.homepageMusic.muted = false;
      
      const playPromise = this.homepageMusic.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log('Homepage music started successfully');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.warn('Direct play failed, trying workaround:', error);
      
      try {
        this.homepageMusic.muted = true;
        this.homepageMusic.volume = this.musicVolume;
        
        const mutedPlayPromise = this.homepageMusic.play();
        if (mutedPlayPromise !== undefined) {
          await mutedPlayPromise;
        }
        
        setTimeout(() => {
          if (this.homepageMusic && !this.isMusicMuted) {
            this.homepageMusic.muted = false;
            console.log('Homepage music unmuted after workaround');
          }
        }, 100);
        
        console.log('Homepage music started with muted workaround');
        return true;
        
      } catch (mutedError) {
        console.warn('Failed to start homepage music even with muted workaround:', mutedError);
        return false;
      }
    }
  }

  // Start game music (Token Sniper)
  async startGameMusic() {
    try {
      console.log('Attempting to start game music...');
      
      if (this.gameMusicStartPromise) {
        return await this.gameMusicStartPromise;
      }

      this.gameMusicStartPromise = this._startGameMusicInternal();
      const result = await this.gameMusicStartPromise;
      this.gameMusicStartPromise = null;
      return result;
      
    } catch (error) {
      console.warn('Failed to start game music:', error);
      this.gameMusicStartPromise = null;
      return false;
    }
  }

  private async _startGameMusicInternal(): Promise<boolean> {
    // Stop ALL other music first
    this.stopMainMusic();
    this.stopHomepageMusic();
    this.stopMusic(); // Stop any existing game music

    if (!this.gameMusic) {
      const initialized = await this.initializeGameMusic();
      if (!initialized) {
        return false;
      }
    }

    if (!this.gameMusic) {
      return false;
    }

    try {
      this.gameMusic.currentTime = 0;
      this.gameMusic.volume = this.isMusicMuted ? 0 : this.musicVolume;
      this.gameMusic.muted = false;
      
      const playPromise = this.gameMusic.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log('Game music started successfully');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.warn('Direct play failed, trying workaround:', error);
      
      try {
        this.gameMusic.muted = true;
        this.gameMusic.volume = this.musicVolume;
        
        const mutedPlayPromise = this.gameMusic.play();
        if (mutedPlayPromise !== undefined) {
          await mutedPlayPromise;
        }
        
        setTimeout(() => {
          if (this.gameMusic && !this.isMusicMuted) {
            this.gameMusic.muted = false;
            console.log('Game music unmuted after workaround');
          }
        }, 100);
        
        console.log('Game music started with muted workaround');
        return true;
        
      } catch (mutedError) {
        console.warn('Failed to start game music even with muted workaround:', mutedError);
        return false;
      }
    }
  }

  // Stop main music
  stopMainMusic() {
    try {
      if (this.mainMusic) {
        this.mainMusic.pause();
        this.mainMusic.currentTime = 0;
        console.log('Main music stopped');
      }
    } catch (error) {
      console.warn('Error stopping main music:', error);
    }
  }

  // Stop homepage music
  stopHomepageMusic() {
    try {
      if (this.homepageMusic) {
        this.homepageMusic.pause();
        this.homepageMusic.currentTime = 0;
        console.log('Homepage music stopped');
      }
    } catch (error) {
      console.warn('Error stopping homepage music:', error);
    }
  }

  // Stop game music
  stopGameMusic() {
    try {
      if (this.gameMusic) {
        this.gameMusic.pause();
        this.gameMusic.currentTime = 0;
        console.log('Game music stopped');
      }
    } catch (error) {
      console.warn('Error stopping game music:', error);
    }
  }

  // CRITICAL FIX: Separate toggle functions for each music type
  toggleMainMusic() {
    this.isMusicMuted = !this.isMusicMuted;
    console.log('Toggling main music, muted:', this.isMusicMuted);
    
    if (this.mainMusic) {
      if (this.isMusicMuted) {
        this.mainMusic.volume = 0;
      } else {
        this.mainMusic.volume = this.musicVolume;
        if (this.mainMusic.paused) {
          this.startMainMusic().catch(error => {
            console.warn('Failed to restart main music when unmuting:', error);
          });
        }
      }
    }
    
    return !this.isMusicMuted;
  }

  toggleHomepageMusic() {
    this.isMusicMuted = !this.isMusicMuted;
    console.log('Toggling homepage music, muted:', this.isMusicMuted);
    
    if (this.homepageMusic) {
      if (this.isMusicMuted) {
        this.homepageMusic.volume = 0;
      } else {
        this.homepageMusic.volume = this.musicVolume;
        if (this.homepageMusic.paused) {
          this.startHomepageMusic().catch(error => {
            console.warn('Failed to restart homepage music when unmuting:', error);
          });
        }
      }
    }
    
    return !this.isMusicMuted;
  }

  toggleGameMusic() {
    this.isMusicMuted = !this.isMusicMuted;
    console.log('Toggling game music, muted:', this.isMusicMuted);
    
    if (this.gameMusic) {
      if (this.isMusicMuted) {
        this.gameMusic.volume = 0;
      } else {
        this.gameMusic.volume = this.musicVolume;
        if (this.gameMusic.paused) {
          this.startGameMusic().catch(error => {
            console.warn('Failed to restart game music when unmuting:', error);
          });
        }
      }
    }
    
    return !this.isMusicMuted;
  }

  // Legacy toggle function - works for whichever music is currently active
  toggleMusic() {
    // Check which music is currently playing and toggle that one
    if (this.mainMusic && !this.mainMusic.paused) {
      return this.toggleMainMusic();
    } else if (this.homepageMusic && !this.homepageMusic.paused) {
      return this.toggleHomepageMusic();
    } else if (this.gameMusic && !this.gameMusic.paused) {
      return this.toggleGameMusic();
    } else {
      // Default to main music toggle
      return this.toggleMainMusic();
    }
  }

  // Check if main music is playing
  isMainMusicPlaying() {
    return !this.isMusicMuted && (this.mainMusic && !this.mainMusic.paused);
  }

  // Check if homepage music is playing
  isHomepageMusicPlaying() {
    return !this.isMusicMuted && (this.homepageMusic && !this.homepageMusic.paused);
  }

  // Check if game music is playing
  isGameMusicPlaying() {
    return !this.isMusicMuted && (this.gameMusic && !this.gameMusic.paused);
  }

  // Get music playing state (any music)
  isMusicPlaying() {
    return !this.isMusicMuted && (
      (this.mainMusic && !this.mainMusic.paused) ||
      (this.homepageMusic && !this.homepageMusic.paused) ||
      (this.gameMusic && !this.gameMusic.paused)
    );
  }

  // Get music muted state
  isMusicMuted_() {
    return this.isMusicMuted;
  }

  // Play enter sound effect
  playEnterSound() {
    try {
      const enterAudio = new Audio('https://zrwxctrfycldinkwrjrd.supabase.co/storage/v1/object/sign/website-assets/audio/Enter.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZTU0ZTRiZi0wNjk4LTQzOTQtOTllNi0wMjc0NmQ1ZTUzNTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWJzaXRlLWFzc2V0cy9hdWRpby9FbnRlci5tcDMiLCJpYXQiOjE3NTExOTEzMTMsImV4cCI6MjA2NjU1MTMxM30.SAXgSjcQqLfC3DtGCIS3kKfyoGbCoWvD-sNb9YrjPfI');
      enterAudio.volume = this.sfxVolume;
      enterAudio.play().catch(e => console.warn('Failed to play enter sound:', e));
    } catch (error) {
      console.warn('Error playing enter sound:', error);
    }
  }

  // Start background music with Matrix-style ambient sounds (for game)
  startBackgroundMusic() {
    try {
      // Use the new game music instead of generated ambient sounds
      this.startGameMusic().catch(error => {
        console.warn('Failed to start game music:', error);
      });
    } catch (error) {
      console.warn('Error starting background music:', error);
    }
  }

  // Stop background music and clean up all audio resources
  stopMusic() {
    try {
      // Stop game music
      this.stopGameMusic();

      // Stop all oscillators
      this.oscillators.forEach(oscillator => {
        try {
          oscillator.stop();
          oscillator.disconnect();
        } catch (error) {
          // Oscillator might already be stopped
        }
      });

      // Disconnect all gain nodes
      this.gainNodes.forEach(gainNode => {
        try {
          gainNode.disconnect();
        } catch (error) {
          // Gain node might already be disconnected
        }
      });

      // Close audio context
      if (this.audioContext) {
        this.audioContext.close().catch(error => {
          console.warn('Error closing audio context:', error);
        });
        this.audioContext = null;
      }

      // Clear arrays
      this.oscillators = [];
      this.gainNodes = [];

    } catch (error) {
      console.warn('Error stopping music:', error);
    }
  }

  // Create retro beep sound programmatically
  createBeep(frequency: number, duration: number, volume: number = 0.3) {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);

      // Clean up after sound finishes
      setTimeout(() => {
        try {
          oscillator.disconnect();
          gainNode.disconnect();
          audioContext.close();
        } catch (error) {
          // Already cleaned up
        }
      }, duration * 1000 + 100);

    } catch (error) {
      console.warn('Web Audio API not supported', error);
    }
  }

  // Create explosion sound with multiple frequencies

  // Retro sound effects using Web Audio API
  playShoot() {
    try {
      const shotAudio = new Audio('https://zrwxctrfycldinkwrjrd.supabase.co/storage/v1/object/sign/website-assets/token-sniper/Audio/Shot.wav?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZTU0ZTRiZi0wNjk4LTQzOTQtOTllNi0wMjc0NmQ1ZTUzNTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWJzaXRlLWFzc2V0cy90b2tlbi1zbmlwZXIvQXVkaW8vU2hvdC53YXYiLCJpYXQiOjE3NTIxMzUwMzEsImV4cCI6NDkwNTczNTAzMX0.w-DszPTkuEqyKLu3dV4Hx4AD8e1zsNiG5Lg0l9fJLeU');
      shotAudio.volume = this.sfxVolume;
      shotAudio.play().catch(e => console.warn('Failed to play shot sound:', e));
    } catch (error) {
      console.warn('Error playing shot sound:', error);
    }
  }

  playHit() {
    try {
      // Use a simple hit sound effect - you can replace this with a proper audio file later
      const hitAudio = new Audio();
      hitAudio.volume = this.sfxVolume * 0.5;
      // For now, just a very brief click sound using data URL
      hitAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      hitAudio.play().catch(e => console.warn('Failed to play hit sound:', e));
    } catch (error) {
      console.warn('Error playing hit sound:', error);
    }
  }

  playLevelComplete() {
    try {
      // Simple level complete sound - you can replace with proper audio file later
      const completeAudio = new Audio();
      completeAudio.volume = this.sfxVolume * 0.7;
      completeAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      completeAudio.play().catch(e => console.warn('Failed to play level complete sound:', e));
    } catch (error) {
      console.warn('Error playing level complete sound:', error);
    }
  }

  playGameOver() {
    try {
      // Simple game over sound - you can replace with proper audio file later
      const gameOverAudio = new Audio();
      gameOverAudio.volume = this.sfxVolume * 0.8;
      gameOverAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      gameOverAudio.play().catch(e => console.warn('Failed to play game over sound:', e));
    } catch (error) {
      console.warn('Error playing game over sound:', error);
    }
  }

  // Word Up keyboard sounds
  playKeyboardClick() {
    try {
      const keyboardAudio = new Audio('https://zrwxctrfycldinkwrjrd.supabase.co/storage/v1/object/sign/website-assets/wordup/Audio/Keyboardclick.wav?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZTU0ZTRiZi0wNjk4LTQzOTQtOTllNi0wMjc0NmQ1ZTUzNTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWJzaXRlLWFzc2V0cy93b3JkdXAvQXVkaW8vS2V5Ym9hcmRjbGljay53YXYiLCJpYXQiOjE3NTQ1NDU5NDYsImV4cCI6MjA2OTkwNTk0Nn0.VzU1_Bjh_hk0wxQQ2jjZLJhYFczoMLk5P5Zbm1xjz14');
      keyboardAudio.volume = this.sfxVolume;
      keyboardAudio.play().catch(e => console.warn('Failed to play keyboard click sound:', e));
    } catch (error) {
      console.warn('Error playing keyboard click sound:', error);
    }
  }

  playKeyboardSpecial() {
    try {
      const keyboardSpecialAudio = new Audio('https://zrwxctrfycldinkwrjrd.supabase.co/storage/v1/object/sign/website-assets/wordup/Audio/Keyboardclicka.wav?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZTU0ZTRiZi0wNjk4LTQzOTQtOTllNi0wMjc0NmQ1ZTUzNTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWJzaXRlLWFzc2V0cy93b3JkdXAvQXVkaW8vS2V5Ym9hcmRjbGlja2Eud2F2IiwiaWF0IjoxNzU0NTQ2MDAwLCJleHAiOjIwNjk5MDYwMDB9.tOoGX4s-kuCHH2sOlmWDq8uInBGK7daZOuRku2xDc0M');
      keyboardSpecialAudio.volume = this.sfxVolume;
      keyboardSpecialAudio.play().catch(e => console.warn('Failed to play keyboard special sound:', e));
    } catch (error) {
      console.warn('Error playing keyboard special sound:', error);
    }
  }
}

export const audioManager = new AudioManager();