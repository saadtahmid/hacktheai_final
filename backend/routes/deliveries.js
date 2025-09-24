import express from 'express';
import { getSupabase } from '../config/database.js';

const router = express.Router();

// POST /api/deliveries - Create delivery from match with volunteer assignment
router.post('/', async (req, res) => {
    try {
        const {
            match_id,
            volunteer_id,
            pickup_location,
            pickup_coordinates,
            delivery_location,
            delivery_coordinates,
            scheduled_pickup,
            scheduled_delivery,
            special_instructions
        } = req.body;

        if (!match_id) {
            return res.status(400).json({
                success: false,
                error: 'match_id is required'
            });
        }

        console.log('📦 Creating delivery with data:', {
            match_id,
            volunteer_id,
            pickup_location,
            delivery_location
        });

        const supabase = getSupabase();

        // Verify the match exists and get match details
        const { data: match, error: matchError } = await supabase
            .from('matches')
            .select(`
                *,
                donation:donations(*),
                request:relief_requests(*)
            `)
            .eq('id', match_id)
            .single();

        if (matchError || !match) {
            return res.status(404).json({
                success: false,
                error: 'Match not found'
            });
        }

        // Debug: Check what volunteer profiles exist
        const { data: allVolunteers, error: debugError } = await supabase
            .from('user_profiles')
            .select('id, user_id, vehicle_type')
            .not('vehicle_type', 'is', null)
            .limit(5);

        console.log('🔍 Available volunteer profiles:', allVolunteers);
        console.log('🔍 Debug error:', debugError);

        // If volunteer provided, verify it exists in user_profiles table
        let volunteerProfileId = null;
        if (volunteer_id) {
            console.log('🔍 Checking if volunteer profile ID exists:', volunteer_id);

            const { data: volunteerProfile, error: volunteerError } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('id', volunteer_id)
                .single();

            console.log('🔍 Volunteer lookup result:', { volunteerProfile, volunteerError });

            if (volunteerError || !volunteerProfile) {
                console.log('❌ Volunteer profile not found for ID:', volunteer_id);
                return res.status(400).json({
                    success: false,
                    error: `Volunteer profile not found for ID: ${volunteer_id}. Available volunteers: ${allVolunteers?.length || 0}`
                });
            }
            volunteerProfileId = volunteer_id; // Use directly since it's already the profile ID
            console.log('✅ Found volunteer profile ID:', volunteerProfileId);
        }

        // Create delivery record
        const deliveryData = {
            match_id,
            volunteer_id: volunteerProfileId,
            pickup_location: pickup_location || null,
            pickup_coordinates: pickup_coordinates || null,
            delivery_location: delivery_location || null,
            delivery_coordinates: delivery_coordinates || null,
            scheduled_pickup: scheduled_pickup || null,
            scheduled_delivery: scheduled_delivery || null,
            special_instructions: special_instructions || null,
            status: volunteerProfileId ? 'assigned' : 'pending_assignment'
        };

        console.log('📦 Inserting delivery data:', JSON.stringify(deliveryData, null, 2));

        const { data: delivery, error: deliveryError } = await supabase
            .from('deliveries')
            .insert(deliveryData)
            .select()
            .single();

        if (deliveryError) {
            throw deliveryError;
        }

        // Update match status if volunteer assigned
        if (volunteerProfileId) {
            await supabase
                .from('matches')
                .update({
                    status: 'assigned',
                    assigned_volunteer_id: volunteerProfileId,
                    assigned_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', match_id);
        }

        res.status(201).json({
            success: true,
            data: delivery,
            message: volunteerProfileId ?
                'Delivery created and volunteer assigned' :
                'Delivery created, pending volunteer assignment'
        });

    } catch (error) {
        console.error('Error creating delivery:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create delivery'
        });
    }
});

// GET /api/deliveries - Get deliveries with filters
router.get('/', async (req, res) => {
    try {
        const {
            status,
            volunteer_id,
            match_id,
            limit = 50
        } = req.query;

        const supabase = getSupabase();
        let query = supabase
            .from('deliveries')
            .select(`
                *,
                match:matches(
                    *,
                    donation:donations(*),
                    request:relief_requests(*)
                ),
                volunteer:user_profiles(
                    *,
                    user:users(full_name, phone)
                )
            `)
            .order('created_at', { ascending: false })
            .limit(parseInt(limit));

        if (status) {
            query = query.eq('status', status);
        }
        if (volunteer_id) {
            query = query.eq('volunteer_id', volunteer_id);
        }
        if (match_id) {
            query = query.eq('match_id', match_id);
        }

        const { data: deliveries, error } = await query;

        if (error) throw error;

        res.json({
            success: true,
            data: deliveries
        });

    } catch (error) {
        console.error('Error fetching deliveries:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch deliveries'
        });
    }
});

// GET /api/deliveries/volunteer/:volunteerId - Get deliveries for specific volunteer
router.get('/volunteer/:volunteerId', async (req, res) => {
    try {
        const { volunteerId } = req.params;
        const supabase = getSupabase();

        // First check if volunteerId is already a profile ID or a user ID
        let profileId = volunteerId;

        // Try to find by profile ID first
        let { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('id, user_id')
            .eq('id', volunteerId)
            .single();

        // If not found by profile ID, try by user_id
        if (profileError || !profile) {
            const { data: profileByUserId, error: userIdError } = await supabase
                .from('user_profiles')
                .select('id, user_id')
                .eq('user_id', volunteerId)
                .single();

            if (userIdError || !profileByUserId) {
                return res.status(404).json({
                    success: false,
                    error: 'Volunteer profile not found'
                });
            }

            profile = profileByUserId;
            profileId = profile.id;
        }

        // Get deliveries assigned to this volunteer profile
        const { data: deliveries, error } = await supabase
            .from('deliveries')
            .select(`
                *,
                match:matches(
                    *,
                    donation:donations(
                        id, item_name, category, quantity, unit, 
                        pickup_address, pickup_coordinates
                    ),
                    request:relief_requests(
                        id, item_name, delivery_address, 
                        delivery_coordinates, urgency, beneficiaries_count
                    )
                )
            `)
            .eq('volunteer_id', profileId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform the data for frontend consumption
        const transformedDeliveries = (deliveries || []).map(delivery => ({
            id: delivery.id,
            match_id: delivery.match_id,
            status: delivery.status,
            pickup_location: delivery.pickup_location,
            delivery_location: delivery.delivery_location,
            scheduled_pickup: delivery.scheduled_pickup,
            scheduled_delivery: delivery.scheduled_delivery,
            special_instructions: delivery.special_instructions,
            created_at: delivery.created_at,
            donation: delivery.match?.donation ? {
                id: delivery.match.donation.id,
                item_name: delivery.match.donation.item_name,
                category: delivery.match.donation.category,
                quantity: delivery.match.donation.quantity,
                unit: delivery.match.donation.unit,
                pickup_address: delivery.match.donation.pickup_address || delivery.pickup_location,
                pickup_coordinates: delivery.match.donation.pickup_coordinates || delivery.pickup_coordinates
            } : null,
            request: delivery.match?.request ? {
                id: delivery.match.request.id,
                item_name: delivery.match.request.item_name,
                delivery_address: delivery.match.request.delivery_address || delivery.delivery_location,
                delivery_coordinates: delivery.match.request.delivery_coordinates || delivery.delivery_coordinates,
                urgency: delivery.match.request.urgency,
                beneficiaries_count: delivery.match.request.beneficiaries_count
            } : null
        }));

        res.json({
            success: true,
            data: transformedDeliveries
        });

    } catch (error) {
        console.error('Error fetching volunteer deliveries:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch volunteer deliveries'
        });
    }
});

// GET /api/deliveries/:id - Get specific delivery
router.get('/:id', async (req, res) => {
    try {
        const supabase = getSupabase();

        const { data: delivery, error } = await supabase
            .from('deliveries')
            .select(`
                *,
                match:matches(
                    *,
                    donation:donations(*),
                    request:relief_requests(*)
                ),
                volunteer:user_profiles(
                    *,
                    user:users(full_name, phone)
                )
            `)
            .eq('id', req.params.id)
            .single();

        if (error || !delivery) {
            return res.status(404).json({
                success: false,
                error: 'Delivery not found'
            });
        }

        res.json({
            success: true,
            data: delivery
        });

    } catch (error) {
        console.error('Error fetching delivery:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch delivery'
        });
    }
});

// PUT /api/deliveries/:id/status - Update delivery status
router.put('/:id/status', async (req, res) => {
    try {
        const { status, location, notes } = req.body;

        const validStatuses = ['assigned', 'in_transit_to_pickup', 'picked_up', 'in_transit_to_delivery', 'delivered', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Valid options: ${validStatuses.join(', ')}`
            });
        }

        const supabase = getSupabase();
        const updates = {
            status,
            updated_at: new Date().toISOString()
        };

        // Add location if provided
        if (location && location.lat && location.lng) {
            updates.current_location = `(${location.lat},${location.lng})`;
            updates.last_location_update = new Date().toISOString();
        }

        // Add timestamp based on status
        if (status === 'picked_up') {
            updates.pickup_actual_at = new Date().toISOString();
            updates.pickup_notes = notes || null;
        } else if (status === 'delivered' || status === 'completed') {
            updates.delivery_actual_at = new Date().toISOString();
            updates.delivery_notes = notes || null;
        }

        const { data: delivery, error } = await supabase
            .from('deliveries')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        // TODO: Send notifications about status change
        // await createNotification({
        //     type: 'delivery_status_update',
        //     delivery_id: req.params.id,
        //     status
        // });

        res.json({
            success: true,
            data: delivery,
            message: `Delivery status updated to ${status}`
        });

    } catch (error) {
        console.error('Error updating delivery status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update delivery status'
        });
    }
});

// POST /api/deliveries/:id/assign-volunteer - Assign volunteer to delivery
router.post('/:id/assign-volunteer', async (req, res) => {
    try {
        const { volunteer_id, volunteer_profile_id } = req.body;

        if (!volunteer_id && !volunteer_profile_id) {
            return res.status(400).json({
                success: false,
                error: 'Either volunteer_id or volunteer_profile_id is required'
            });
        }

        const supabase = getSupabase();

        // Get volunteer profile ID if not provided
        let profileId = volunteer_profile_id;
        if (volunteer_id && !volunteer_profile_id) {
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('user_id', volunteer_id)
                .single();

            if (profileError || !profile) {
                return res.status(400).json({
                    success: false,
                    error: 'Volunteer profile not found'
                });
            }
            profileId = profile.id;
        }

        // Update delivery with volunteer assignment
        const { data: delivery, error: deliveryError } = await supabase
            .from('deliveries')
            .update({
                volunteer_id: profileId,
                status: 'assigned',
                updated_at: new Date().toISOString()
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (deliveryError) throw deliveryError;

        // Update the associated match
        await supabase
            .from('matches')
            .update({
                assigned_volunteer_id: profileId,
                status: 'assigned',
                assigned_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', delivery.match_id);

        res.json({
            success: true,
            data: delivery,
            message: 'Volunteer assigned to delivery successfully'
        });

    } catch (error) {
        console.error('Error assigning volunteer:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to assign volunteer to delivery'
        });
    }
});

// POST /api/deliveries/:id/confirm - Dummy delivery confirmation for hackathon
router.post('/:id/confirm', async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const { confirmation_notes, recipient_signature, photo_url } = req.body;

        // This is a dummy implementation for the hackathon
        // In a real system, we would update the database status
        console.log('📋 DUMMY DELIVERY CONFIRMATION:', {
            deliveryId,
            confirmation_notes,
            recipient_signature,
            photo_url,
            timestamp: new Date().toISOString()
        });

        // Return success response without actually updating database
        res.json({
            success: true,
            message: 'Delivery confirmed successfully! (This is a demo implementation)',
            data: {
                delivery_id: deliveryId,
                confirmed_at: new Date().toISOString(),
                status: 'confirmed_demo',
                notes: confirmation_notes
            }
        });

    } catch (error) {
        console.error('Error confirming delivery:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to confirm delivery'
        });
    }
});

export default router;