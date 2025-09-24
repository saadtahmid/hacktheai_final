import express from 'express';
import { body, validationResult } from 'express-validator';
import { getSupabase } from '../config/database.js';

const router = express.Router();

// Validation middleware - matching hackathon.item_category and hackathon.urgency_level enums
const validateDonation = [
    body('item_name').notEmpty().trim().isLength({ min: 3, max: 255 }),
    body('category').isIn(['food', 'clothes', 'medicine', 'blankets', 'water', 'hygiene', 'other']),
    body('quantity').isFloat({ min: 0.1 }),
    body('unit').notEmpty().trim().isLength({ min: 1, max: 50 }),
    body('urgency').isIn(['low', 'medium', 'high', 'critical']),
    body('pickup_address').notEmpty().trim(),
    body('pickup_coordinates').isObject()
];


// ✅ USED: POST /api/donations - Create new donation
router.post('/', validateDonation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        // Map frontend field names to schema field names
        const { images, pickup_coordinates, validation_result, ...bodyData } = req.body;

        // Convert coordinates to PostgreSQL POINT format for PostGIS
        let coordinates = null;
        if (pickup_coordinates && pickup_coordinates.lat && pickup_coordinates.lng) {
            // PostgreSQL POINT format: (longitude,latitude) - note the order!
            coordinates = `(${pickup_coordinates.lng},${pickup_coordinates.lat})`;
        }

        // Determine initial status based on validation result (matching schema enum values)
        let initialStatus = 'pending_validation';
        if (validation_result && validation_result.autoApprove) {
            initialStatus = 'available';
        } else if (validation_result && validation_result.riskLevel === 'high') {
            initialStatus = 'cancelled'; // Using schema enum value instead of 'rejected'
        }

        // Store validation results as AI processing metadata (not in main table)
        let validationScore = null;
        let validationNotes = null;
        let validatedBy = null;

        if (validation_result) {
            validationScore = validation_result.confidence || null;
            validationNotes = validation_result.issues?.length > 0 ? validation_result.issues.join('; ') : null;
            validatedBy = 'ai_agent';
        }

        const donationData = {
            ...bodyData,
            pickup_coordinates: coordinates,
            photos: images || [], // Map 'images' to 'photos' as per schema
            status: initialStatus,
            validation_score: validationScore,
            validation_notes: validationNotes,
            validated_by: validatedBy,
            validated_at: validation_result ? new Date().toISOString() : null,
            created_at: new Date().toISOString()
        };

        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('donations')
            .insert(donationData)
            .select()
            .single();

        if (error) throw error;

        // TODO: Trigger AI validation agent here
        // await callValidationAgent(data.id);

        res.status(201).json({
            success: true,
            data,
            message: 'Donation submitted for validation'
        });
    } catch (error) {
        console.error('Error creating donation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create donation'
        });
    }
});



export default router;