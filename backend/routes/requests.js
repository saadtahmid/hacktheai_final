import express from 'express';
import { body, validationResult } from 'express-validator';
import { getSupabase } from '../config/database.js';

const router = express.Router();

// Validation middleware - Updated to match actual schema
const validateRequest = [
    body('category').isIn(['food', 'clothes', 'medicine', 'blankets', 'water', 'hygiene', 'other']),
    body('item_name').notEmpty().trim().isLength({ min: 2, max: 255 }),
    body('description').notEmpty().trim().isLength({ min: 10, max: 2000 }),
    body('quantity').isFloat({ min: 0.1 }),
    body('unit').notEmpty().trim(),
    body('urgency').isIn(['low', 'medium', 'high', 'critical']),
    body('beneficiaries_count').isInt({ min: 1 }),
    body('delivery_address').notEmpty().trim(),
    body('delivery_coordinates').isObject(),
    body('deadline').isISO8601()
];



// ✅ USED: POST /api/requests - Create new relief request
router.post('/', validateRequest, async (req, res) => {
    try {
        const supabase = getSupabase();
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        // Handle coordinate conversion like in donations.js
        let deliveryCoordinates = req.body.delivery_coordinates;
        if (deliveryCoordinates && typeof deliveryCoordinates === 'object') {
            if (deliveryCoordinates.lat !== undefined && deliveryCoordinates.lng !== undefined) {
                deliveryCoordinates = `(${deliveryCoordinates.lng},${deliveryCoordinates.lat})`;
            }
        }

        // Map request data to match actual schema fields
        const requestData = {
            ngo_id: req.body.ngo_id || req.body.requester_id, // Handle both field names
            category: req.body.category,
            item_name: req.body.item_name,
            description: req.body.description,
            quantity: req.body.quantity,
            unit: req.body.unit,
            urgency: req.body.urgency,
            beneficiaries_count: req.body.beneficiaries_count,
            target_demographic: req.body.target_demographic || 'families',
            emergency_type: req.body.emergency_type || 'general',
            delivery_address: req.body.delivery_address,
            delivery_coordinates: deliveryCoordinates,
            deadline: req.body.deadline,
            status: 'pending_validation',
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('relief_requests')
            .insert(requestData)
            .select()
            .single();

        if (error) throw error;

        // TODO: Trigger AI validation agent here
        // await callValidationAgent(data.id, 'request');

        res.status(201).json({
            success: true,
            data,
            message: 'Request submitted for validation'
        });
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create request'
        });
    }
});


export default router;