'use client';

import { useState, useEffect } from 'react';
import { Play, Pause } from '@phosphor-icons/react';
import { audioManager } from '@/lib/audio-manager';
import styles from './AudioPlayer.module.scss';

interface AudioPlayerProps {
  src: string;
  label?: string;
}

export function AudioPlayer({ src, label = 'Ambience' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(audioManager.isPlaying);
  const [volume, setVolumeState] = useState(audioManager.volume);

  useEffect(() => {
    audioManager.initialize(src);
    setIsPlaying(audioManager.isPlaying);
    setVolumeState(audioManager.volume);

    const unsubscribe = audioManager.subscribe((playing) => {
      setIsPlaying(playing);
    });

    return unsubscribe;
  }, [src]);

  const togglePlay = () => {
    const wasJustInitialized = audioManager.initialize(src);

    if (wasJustInitialized && !audioManager.isPlaying) {
      audioManager.play();
      return;
    }

    audioManager.toggle();
  };
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolumeState(newVolume);
    audioManager.setVolume(newVolume);
  };

  return (
    <div className={styles.audioPlayer}>
      <button
        onClick={togglePlay}
        className={styles.playButton}
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause size={18} weight="fill" />
        ) : (
          <Play size={18} weight="fill" />
        )}
      </button>

      {isPlaying ? (
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={audioManager.isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className={styles.volumeSlider}
          aria-label="Volume"
        />
      ) : (
        <span className={styles.label}>{label}</span>
      )}
    </div>
  );
}

