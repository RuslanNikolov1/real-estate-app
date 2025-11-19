'use client';

import { OverlayView } from "@react-google-maps/api";

interface WrappingLabelProps {
    position: google.maps.LatLngLiteral;
    text: string;
    zoom?: number;
}

export function WrappingLabel({
    position,
    text,
    zoom = 13,
}: WrappingLabelProps) {
    const minZoom = 8;
    const maxZoom = 18;
    const clampedZoom = Math.min(Math.max(zoom, minZoom), maxZoom);

    const zoomProgress = (clampedZoom - minZoom) / (maxZoom - minZoom); // 0 -> 1
    const scaleFactor = 0.65 + zoomProgress * 0.45; // 0.65x at min zoom, 1.1x at max zoom

    const baseFontSize = 9;
    const maxFontSize = 14;
    const fontSize = baseFontSize + (maxFontSize - baseFontSize) * scaleFactor;

    const baseWidth = 80;
    const maxWidth = 120;
    const computedWidth = baseWidth + (maxWidth - baseWidth) * scaleFactor;

    const color = '#4a4a4a'; // medium gray

    return (
        <OverlayView
            position={position}
            mapPaneName={OverlayView.MARKER_LAYER}
        >
            <div
                style={{
                    position: "absolute",
                    transform: "translate(-50%, -72%)",

                    // --- TEXT WRAPPING FIX ---
                    maxWidth: `${computedWidth}px`,
                    whiteSpace: "normal",
                    overflowWrap: "normal",
                    wordBreak: "normal",
                    textAlign: "center",
                    lineHeight: "1.2",

                    // --- LIMIT TO 2 ROWS ---
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",

                    // --- DESIGN ---
                    background: "transparent", // NO BACKGROUND
                    padding: "0",
                    border: "none",
                    boxShadow: "none",
                    fontSize: `${fontSize}px`,
                    fontWeight: 600,
                    color,
                }}
            >
                {text}
            </div>
        </OverlayView>
    );
}
