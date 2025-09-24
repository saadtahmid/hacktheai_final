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

        // Send AI-powered notifications to all parties
        await sendMatchNotifications(match, donationCheck.data, requestCheck.data);

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


export default router;