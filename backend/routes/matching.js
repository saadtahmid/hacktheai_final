import express from 'express';
import { getSupabase } from '../config/database.js';
import fetch from 'node-fetch';

const router = express.Router();


// ✅ USED: POST /api/matching/create - Create a match (AI-powered or manual)
router.post('/create', async (req, res) => {
    try {
        const { donation_id, request_id, volunteer_id, matching_score, ai_reasoning } = req.body;

        const supabase = getSupabase();
        // Validate that donation, request exist and are available
        const [donationCheck, requestCheck] = await Promise.all([
            supabase.from('donations').select('id, status').eq('id', donation_id).single(),
            supabase.from('relief_requests').select('id, status').eq('id', request_id).single()
        ]);

        if (donationCheck.error || !donationCheck.data) {
            return res.status(404).json({ success: false, error: 'Donation not found' });
        }
        if (requestCheck.error || !requestCheck.data) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }

        // Accept multiple valid donation statuses for matching
        const validDonationStatuses = ['pending_validation', 'available'];
        if (!validDonationStatuses.includes(donationCheck.data.status)) {
            return res.status(400).json({
                success: false,
                error: `Donation status '${donationCheck.data.status}' is not eligible for matching. Valid statuses: ${validDonationStatuses.join(', ')}`
            });
        }
        // Accept multiple valid request statuses for matching
        const validRequestStatuses = ['pending_validation', 'active', 'partially_matched'];
        if (!validRequestStatuses.includes(requestCheck.data.status)) {
            return res.status(400).json({
                success: false,
                error: `Request status '${requestCheck.data.status}' is not eligible for matching. Valid statuses: ${validRequestStatuses.join(', ')}`
            });
        }

        // Validate volunteer if provided
        let volunteerData = null;
        if (volunteer_id) {
            const { data: volData, error: volunteerError } = await supabase
                .from('user_profiles')
                .select(`
                    *,
                    user:users!user_profiles_user_id_fkey(role)
                `)
                .eq('user_id', volunteer_id)
                .eq('users.role', 'volunteer')
                .single();

            if (volunteerError || !volData) {
                return res.status(400).json({ success: false, error: 'Volunteer not found' });
            }
            volunteerData = volData;
        }

        // Create the match
        const matchData = {
            donation_id,
            request_id,
            assigned_volunteer_id: volunteer_id || null,
            status: volunteer_id ? 'assigned' : 'suggested',
            compatibility_score: matching_score || null,
            matched_by: 'ai_agent',
            assigned_at: volunteer_id ? new Date().toISOString() : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data: match, error: matchError } = await supabase
            .from('matches')
            .insert(matchData)
            .select()
            .single();

        if (matchError) throw matchError;

        // Update donation and request statuses
        await Promise.all([
            supabase.from('donations').update({ status: 'matched' }).eq('id', donation_id),
            supabase.from('relief_requests').update({ status: 'partially_matched' }).eq('id', request_id)
        ]);

        // Create delivery record if volunteer assigned
        if (volunteer_id && volunteerData) {
            await supabase.from('deliveries').insert({
                match_id: match.id,
                volunteer_id: volunteerData.id, // Use profile ID
                status: 'assigned',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        // TODO: Send AI-powered notifications to all parties (not implemented yet)
        // await sendMatchNotifications(match, donationCheck.data, requestCheck.data);
        console.log('📧 Notifications system not implemented yet - skipping notification for match:', match.id);

        res.status(201).json({
            success: true,
            data: match,
            message: volunteer_id ? 'Match created and volunteer assigned' : 'Match created, pending volunteer assignment'
        });
    } catch (error) {
        console.error('Error creating match:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create match'
        });
    }
});

// Update match with volunteer assignment
router.put('/:matchId/volunteer', async (req, res) => {
    try {
        const { matchId } = req.params;
        const { volunteer_id } = req.body;
        const supabase = getSupabase();

        // Validate inputs
        if (!matchId || !volunteer_id) {
            return res.status(400).json({
                success: false,
                error: 'Match ID and volunteer ID are required'
            });
        }

        // Verify the match exists
        const { data: match, error: matchError } = await supabase
            .from('matches')
            .select('*')
            .eq('id', matchId)
            .single();

        if (matchError || !match) {
            return res.status(404).json({
                success: false,
                error: 'Match not found'
            });
        }
        // Log volunteer_id for debugging and its type
        console.log('Volunteer ID:', volunteer_id, 'Type:', typeof volunteer_id);

        // Verify the volunteer exists and get their profile
        const { data: volunteerCheck, error: volunteerError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', volunteer_id)
            .single();

        if (volunteerError || !volunteerCheck) {
            return res.status(400).json({
                success: false,
                error: 'Volunteer profile not found for ID: ' + volunteer_id
            });
        }

        // Update the match with volunteer assignment
        const { data: updatedMatch, error: updateError } = await supabase
            .from('matches')
            .update({
                assigned_volunteer_id: volunteer_id, // Use the profile ID directly
                status: 'assigned',
                updated_at: new Date().toISOString()
            })
            .eq('id', matchId)
            .select('*')
            .single();

        if (updateError) {
            throw updateError;
        }

        console.log('✅ Match updated with volunteer assignment:', updatedMatch);

        res.status(200).json({
            success: true,
            data: updatedMatch,
            message: 'Volunteer assigned to match successfully'
        });

    } catch (error) {
        console.error('Error updating match with volunteer:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to assign volunteer to match'
        });
    }
});


export default router;