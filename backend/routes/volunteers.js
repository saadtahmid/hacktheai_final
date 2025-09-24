import express from 'express';
import { body, validationResult } from 'express-validator';
import { getSupabase } from '../config/database.js';

const router = express.Router();

// Validation middleware for volunteer registration/update - Updated to match schema
const validateVolunteer = [
    body('availability_hours').isArray().optional(), // JSONB array in schema, optional for now
    body('vehicle_type').isIn(['bicycle', 'motorcycle', 'car', 'truck']).optional(),
    body('max_capacity_kg').isInt({ min: 1, max: 1000 }).optional(),
    body('coordinates').isObject().optional(), // PostGIS POINT
    body('address').isString().optional(),
    body('district').isString().optional(),
    body('division').isString().optional(),
    body('user_id').isUUID().optional() // Allow user_id to be passed
];



// GET /api/volunteers/:id - Get specific volunteer
router.get('/:id', async (req, res) => {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('user_profiles')
            .select(`
        *,
        user:users!user_profiles_user_id_fkey(full_name, phone, profile_image_url, role),
        deliveries:deliveries!deliveries_volunteer_id_fkey(
          *,
          match:matches(
            *,
            donation:donations(item_name, quantity),
            request:relief_requests(description, beneficiaries_count)
          )
        )
      `)
            .eq('user_id', req.params.id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Volunteer not found' });

        // Check if the user is actually a volunteer
        if (data.user && data.user.role !== 'volunteer') {
            return res.status(404).json({ success: false, error: 'User is not a volunteer' });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching volunteer:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch volunteer'
        });
    }
});

// POST /api/volunteers - Register as volunteer or update volunteer info
router.post('/', validateVolunteer, async (req, res) => {
    try {
        const supabase = getSupabase();
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const volunteerData = {
            ...req.body,
            is_available: true,
            created_at: new Date().toISOString()
        };

        // Upsert volunteer data to user_profiles
        const { data, error } = await supabase
            .from('user_profiles')
            .upsert(volunteerData, {
                onConflict: 'user_id'
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            data,
            message: 'Volunteer registration successful'
        });
    } catch (error) {
        console.error('Error registering volunteer:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to register volunteer'
        });
    }
});



// GET /api/volunteers/:id/deliveries - Get volunteer's delivery history
router.get('/:id/deliveries', async (req, res) => {
    try {
        const { status, limit = 50 } = req.query;

        const supabase = getSupabase();

        // First get the user profile ID from user_id
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', req.params.id)
            .single();

        if (profileError || !profile) {
            return res.status(404).json({
                success: false,
                error: 'Volunteer profile not found'
            });
        }

        let query = supabase
            .from('deliveries')
            .select(`
        *,
        match:matches(
          *,
          donation:donations(item_name, quantity, unit, category),
          request:relief_requests(description, beneficiaries_count, delivery_address)
        )
      `)
            .eq('volunteer_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (status) query = query.eq('status', status);

        const { data, error } = await query;

        if (error) throw error;

        res.json({
            success: true,
            data,
            volunteer_id: req.params.id
        });
    } catch (error) {
        console.error('Error fetching volunteer deliveries:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch deliveries'
        });
    }
});



export default router;