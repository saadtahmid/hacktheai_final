import { useState, useEffect, useCallback } from 'react';

export interface VolunteerLocation {
    lat: number;
    lng: number;
    timestamp: Date;
    accuracy?: number;
}

export interface DeliveryUpdate {
    taskId: string;
    status: 'assigned' | 'en_route_pickup' | 'at_pickup' | 'picked_up' | 'en_route_delivery' | 'at_delivery' | 'delivered' | 'completed';
    location?: VolunteerLocation;
    estimatedArrival?: Date;
    notes?: string;
}

interface UseRealTimeTrackingProps {
    volunteerId: string;
    isActive?: boolean;
    updateInterval?: number; // milliseconds
}

export const useRealTimeTracking = ({
    volunteerId,
    isActive = true,
    updateInterval = 30000 // 30 seconds
}: UseRealTimeTrackingProps) => {
    const [currentLocation, setCurrentLocation] = useState<VolunteerLocation | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isTracking, setIsTracking] = useState(false);

    // Get current location
    const getCurrentLocation = useCallback((): Promise<VolunteerLocation> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser.'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location: VolunteerLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        timestamp: new Date(),
                        accuracy: position.coords.accuracy
                    };
                    resolve(location);
                },
                (error) => {
                    let errorMessage = 'Unknown location error';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied by user.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out.';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000 // 1 minute
                }
            );
        });
    }, []);

    // Update location on backend
    const updateLocationOnServer = useCallback(async (location: VolunteerLocation) => {
        try {
            // This would be your API call to update volunteer location
            // await apiService.updateVolunteerLocation(volunteerId, location);
            console.log('Location updated:', location);
        } catch (error) {
            console.error('Failed to update location on server:', error);
        }
    }, [volunteerId]);

    // Send delivery status update
    const updateDeliveryStatus = useCallback(async (update: DeliveryUpdate) => {
        try {
            // This would be your API call to update delivery status
            // await apiService.updateDeliveryStatus(update);
            console.log('Delivery status updated:', update);

            // Update location if provided
            if (update.location) {
                setCurrentLocation(update.location);
                await updateLocationOnServer(update.location);
            }
        } catch (error) {
            console.error('Failed to update delivery status:', error);
        }
    }, [updateLocationOnServer]);

    // Start location tracking
    const startTracking = useCallback(async () => {
        if (!isActive) return;

        try {
            setIsTracking(true);
            setLocationError(null);

            const location = await getCurrentLocation();
            setCurrentLocation(location);
            await updateLocationOnServer(location);
        } catch (error) {
            setLocationError(error instanceof Error ? error.message : 'Failed to get location');
            setIsTracking(false);
        }
    }, [isActive, getCurrentLocation, updateLocationOnServer]);

    // Stop location tracking
    const stopTracking = useCallback(() => {
        setIsTracking(false);
        setLocationError(null);
    }, []);

    // Auto-update location
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && isTracking) {
            interval = setInterval(async () => {
                try {
                    const location = await getCurrentLocation();
                    setCurrentLocation(location);
                    await updateLocationOnServer(location);
                } catch (error) {
                    console.error('Failed to update location:', error);
                }
            }, updateInterval);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isActive, isTracking, updateInterval, getCurrentLocation, updateLocationOnServer]);

    // Calculate distance between two points (Haversine formula)
    const calculateDistance = useCallback((point1: VolunteerLocation, point2: { lat: number; lng: number }): number => {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = (point2.lat - point1.lat) * Math.PI / 180;
        const dLng = (point2.lng - point1.lng) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in kilometers
    }, []);

    // Estimate arrival time based on distance and average speed
    const estimateArrivalTime = useCallback((
        destination: { lat: number; lng: number },
        averageSpeedKmh: number = 25 // Average city driving speed
    ): Date | null => {
        if (!currentLocation) return null;

        const distance = calculateDistance(currentLocation, destination);
        const timeHours = distance / averageSpeedKmh;
        const arrivalTime = new Date(Date.now() + timeHours * 60 * 60 * 1000);

        return arrivalTime;
    }, [currentLocation, calculateDistance]);

    return {
        currentLocation,
        locationError,
        isTracking,
        startTracking,
        stopTracking,
        updateDeliveryStatus,
        calculateDistance,
        estimateArrivalTime,
        getCurrentLocation
    };
};