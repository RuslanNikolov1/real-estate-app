'use client';

import { OverlayView } from "@react-google-maps/api";

export function WrappingLabel({
    position,
    text,
}: {
    position: google.maps.LatLngLiteral;
    text: string;
}) {
    return (
        <OverlayView
            position={position}
            mapPaneName={OverlayView.MARKER_LAYER}
        >
            <div
                style={{
                    position: "absolute",
                    transform: "translate(-50%, -100%)",

                    // --- TEXT WRAPPING FIX ---
                    maxWidth: "110px",
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
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#222",
                }}
            >
                {text}
            </div>
        </OverlayView>
    );
}
