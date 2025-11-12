'use client';

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Use your actual token from environment or test token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    "pk.eyJ1IjoiZGVtb3VzZXIiLCJhIjoiY2x4eXBtNm4zMDgwbjJycGd4NjVmbXpsayJ9.qV1BKmzN8YpJwD5CQ7IzpQ";

mapboxgl.accessToken = MAPBOX_TOKEN;

export default function MapTest() {
    const mapContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mapContainer.current) {
            console.log("❌ Container element is null");
            return;
        }

        console.log("✅ Container element:", mapContainer.current);

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [23.3219, 42.6977], // Sofia
            zoom: 10,
        });

        map.on("load", () => {
            console.log("✅ Map loaded successfully");
            // Force resize after load
            setTimeout(() => {
                map.resize();
                console.log("✅ Map resized");
            }, 500);
        });

        map.on("error", (e) => {
            console.error("❌ Map error:", e);
        });

        return () => {
            console.log("🧹 Cleaning up map");
            map.remove();
        };
    }, []);

    return (
        <div
            ref={mapContainer}
            style={{
                width: "100%",
                height: "100vh",
                background: "#ccc",
            }}
        />
    );
}


