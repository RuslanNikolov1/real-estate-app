'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from '@phosphor-icons/react';
import styles from './AudioPlayer.module.scss';

interface AudioPlayerProps {
  src: string;
  label?: string;
}

export function AudioPlayer({ src, label = 'Ambience' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioInitialized) return;

    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // Set initial volume and play on first initialization
    audio.volume = isMuted ? 0 : volume;
    audio.play().catch((error) => {
      console.error('Error playing audio:', error);
    });

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioInitialized]);

  useEffect(() => {
    if (!audioInitialized) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted, audioInitialized]);

  const togglePlay = () => {
    if (!audioInitialized) {
      // Initialize audio on first click
      setAudioInitialized(true);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
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
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className={styles.volumeSlider}
          aria-label="Volume"
        />
      ) : (
        <span className={styles.label}>{label}</span>
      )}

      {audioInitialized && <audio ref={audioRef} src={src} loop />}
    </div>
  );
}

