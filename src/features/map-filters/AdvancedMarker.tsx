'use client';

import { useEffect, useRef, useMemo } from 'react';

interface AdvancedMarkerProps {
    position: { lat: number; lng: number };
    map?: google.maps.Map | null;
    title?: string;
    onClick?: () => void;
    content?: HTMLElement | null;
}

export function AdvancedMarker({ position, map, title, onClick, content }: AdvancedMarkerProps) {
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
    const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);

    useEffect(() => {
        if (!map || typeof window === 'undefined' || !window.google?.maps?.marker?.AdvancedMarkerElement) {
            return;
        }

        // Create marker only if it doesn't exist
        if (!markerRef.current) {
            const marker = new window.google.maps.marker.AdvancedMarkerElement({
                map,
                position,
                title,
                content: content || undefined
            });

            markerRef.current = marker;

            // Add click listener
            if (onClick) {
                clickListenerRef.current = marker.addListener('click', onClick);
            }
        } else {
            // Update existing marker
            markerRef.current.position = position;
            markerRef.current.title = title || '';
            if (content) {
                markerRef.current.content = content;
            }
        }

        // Cleanup
        return () => {
            if (clickListenerRef.current) {
                window.google.maps.event.removeListener(clickListenerRef.current);
                clickListenerRef.current = null;
            }
            if (markerRef.current) {
                markerRef.current.map = null;
                markerRef.current = null;
            }
        };
    }, [map, position, title, content]); // Removed onClick from deps to avoid recreation

    // Handle onClick changes separately
    useEffect(() => {
        if (!markerRef.current || !onClick) return;

        // Remove old listener
        if (clickListenerRef.current) {
            window.google.maps.event.removeListener(clickListenerRef.current);
        }

        // Add new listener
        if (markerRef.current) {
            clickListenerRef.current = markerRef.current.addListener('click', onClick);
        }

        return () => {
            if (clickListenerRef.current) {
                window.google.maps.event.removeListener(clickListenerRef.current);
                clickListenerRef.current = null;
            }
        };
    }, [onClick]);

    return null;
}
