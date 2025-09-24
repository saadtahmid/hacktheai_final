import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import 'leaflet/dist/leaflet.css';

let DefaultIcon = L.divIcon({
    html: `<div style="background-color: #3b82f6; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [25, 25],
    className: 'custom-div-icon'
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapLocation {
    id: string;
    lat: number;
    lng: number;
    title: string;
    description: string;
    type: 'pickup' | 'delivery' | 'volunteer';
    status?: string;
}

interface LeafletMapProps {
    locations: MapLocation[];
    volunteerLocation?: { lat: number; lng: number };
    isTracking?: boolean;
    className?: string;
    zoom?: number;
    center?: { lat: number; lng: number };
}

const LeafletMapComponent: React.FC<LeafletMapProps> = ({
    locations = [],
    volunteerLocation,
    isTracking = false,
    className = '',
    zoom = 13,
    center = { lat: 23.8103, lng: 90.4125 } // Default to Dhaka, Bangladesh
}) => {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const volunteerMarkerRef = useRef<L.Marker | null>(null);
    const { theme } = useTheme();
    const [mapError, setMapError] = useState<string | null>(null);

    // Custom marker icons
    const createCustomIcon = (type: MapLocation['type'], isActive: boolean = false) => {
        const colors = {
            pickup: '#f59e0b', // Amber
            delivery: '#10b981', // Green
            volunteer: '#3b82f6' // Blue
        };

        const size = type === 'volunteer' ? 30 : 25;
        const pulseClass = isActive && type === 'volunteer' ? 'animate-pulse' : '';

        return L.divIcon({
            html: `
        <div class="${pulseClass}" style="
          background-color: ${colors[type]}; 
          width: ${size}px; 
          height: ${size}px; 
          border-radius: 50%; 
          border: 3px solid white; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">
          ${type === 'pickup' ? '📦' : type === 'delivery' ? '🏠' : '🚗'}
        </div>
      `,
            iconSize: [size, size],
            className: 'custom-div-icon'
        });
    };

    // Initialize map
    useEffect(() => {
        if (!containerRef.current) return;

        try {
            // Create map
            const map = L.map(containerRef.current, {
                zoomControl: true,
                attributionControl: true
            }).setView([center.lat, center.lng], zoom);

            // Add tile layer - using OpenStreetMap (free!)
            const tileLayer = theme === 'dark'
                ? L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                })
                : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                });

            tileLayer.addTo(map);

            mapRef.current = map;
            setMapError(null);

            return () => {
                if (map) {
                    map.remove();
                    mapRef.current = null;
                }
            };
        } catch (error) {
            console.error('Error initializing map:', error);
            setMapError('Failed to initialize map. Please try again.');
        }
    }, [theme, center.lat, center.lng, zoom]);

    // Update locations markers
    useEffect(() => {
        if (!mapRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => {
            mapRef.current?.removeLayer(marker);
        });
        markersRef.current = [];

        // Add new markers - with validation for valid coordinates
        const validLocations = locations.filter(location =>
            location.lat !== undefined &&
            location.lng !== undefined &&
            !isNaN(location.lat) &&
            !isNaN(location.lng) &&
            location.lat !== null &&
            location.lng !== null
        );

        validLocations.forEach(location => {
            if (!mapRef.current) return;

            try {
                const marker = L.marker([location.lat, location.lng], {
                    icon: createCustomIcon(location.type)
                }).addTo(mapRef.current);

                // Add popup
                const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-weight: bold;">
              ${location.title}
            </h3>
            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">
              ${location.description}
            </p>
            <div style="display: flex; justify-content: space-between; margin-top: 8px;">
              <span style="background: ${location.type === 'pickup' ? '#fef3c7' : '#d1fae5'}; 
                           color: ${location.type === 'pickup' ? '#92400e' : '#065f46'};
                           padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                ${location.type === 'pickup' ? '📦 Pickup' : '🏠 Delivery'}
              </span>
              ${location.status ? `<span style="color: #6b7280; font-size: 12px;">${location.status}</span>` : ''}
            </div>
          </div>
        `;

                marker.bindPopup(popupContent);
                markersRef.current.push(marker);
            } catch (error) {
                console.error('Error creating marker for location:', location, error);
            }
        });

        // Fit map to show all markers if there are any
        if (markersRef.current.length > 0) {
            try {
                const group = new L.FeatureGroup(markersRef.current);
                mapRef.current.fitBounds(group.getBounds().pad(0.1));
            } catch (error) {
                console.error('Error fitting bounds:', error);
            }
        }
    }, [locations]);

    // Update volunteer location
    useEffect(() => {
        if (!mapRef.current) return;

        // Remove existing volunteer marker
        if (volunteerMarkerRef.current) {
            mapRef.current.removeLayer(volunteerMarkerRef.current);
            volunteerMarkerRef.current = null;
        }

        // Add new volunteer marker with validation
        if (volunteerLocation &&
            volunteerLocation.lat !== undefined &&
            volunteerLocation.lng !== undefined &&
            !isNaN(volunteerLocation.lat) &&
            !isNaN(volunteerLocation.lng) &&
            volunteerLocation.lat !== null &&
            volunteerLocation.lng !== null) {

            try {
                const volunteerMarker = L.marker([volunteerLocation.lat, volunteerLocation.lng], {
                    icon: createCustomIcon('volunteer', isTracking)
                }).addTo(mapRef.current);

                volunteerMarker.bindPopup(`
          <div style="min-width: 180px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-weight: bold;">
              🚗 Your Location
            </h3>
            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">
              Lat: ${volunteerLocation.lat.toFixed(6)}
            </p>
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
              Lng: ${volunteerLocation.lng.toFixed(6)}
            </p>
            <div style="display: flex; justify-content: center;">
              <span style="background: ${isTracking ? '#dcfce7' : '#f3f4f6'}; 
                           color: ${isTracking ? '#16a34a' : '#6b7280'};
                           padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                ${isTracking ? '🟢 Active Tracking' : '⚫ Tracking Stopped'}
              </span>
            </div>
          </div>
        `);

                volunteerMarkerRef.current = volunteerMarker;

                // Center map on volunteer location if tracking
                if (isTracking) {
                    mapRef.current.setView([volunteerLocation.lat, volunteerLocation.lng], zoom);
                }
            } catch (error) {
                console.error('Error creating volunteer marker:', error);
            }
        }
    }, [volunteerLocation, isTracking, zoom]);

    if (mapError) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`${className} bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center`}
            >
                <div className="text-center p-8">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Map Loading Error
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        {mapError}
                    </p>
                    <button
                        onClick={() => setMapError(null)}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className={className}>
            {/* Map Legend */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-sm"
            >
                <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Legend</h4>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-xs">📦</div>
                        <span className="text-gray-600 dark:text-gray-400">Pickup Points</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-xs">🏠</div>
                        <span className="text-gray-600 dark:text-gray-400">Delivery Points</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-xs">🚗</div>
                        <span className="text-gray-600 dark:text-gray-400">Your Location</span>
                    </div>
                </div>
            </motion.div>

            {/* Map Container */}
            <motion.div
                ref={containerRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full rounded-lg overflow-hidden"
                style={{ minHeight: '400px' }}
            />

            {/* Status Overlay */}
            {isTracking && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute bottom-4 left-4 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2"
                >
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    Live Tracking Active
                </motion.div>
            )}
        </div>
    );
};

export default LeafletMapComponent;