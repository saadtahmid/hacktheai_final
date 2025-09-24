import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getSupabase } from '../config/database.js';

const router = express.Router();

// Validation middleware
const validateRegister = [
    body('full_name').notEmpty().trim().isLength({ min: 2, max: 100 }),
    body('phone').isMobilePhone(['bn-BD']).withMessage('Please provide a valid Bangladeshi phone number'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('user_type').isIn(['donor', 'ngo', 'volunteer']),
    body('email').isEmail().optional()
];

const validateLogin = [
    body('phone').isMobilePhone(['bn-BD']).withMessage('Please provide a valid phone number'),
    body('password').notEmpty().withMessage('Password is required')
];

// POST /api/auth/register - Register new user
router.post('/register', validateRegister, async (req, res) => {
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

        const { full_name, phone, email, password, user_type } = req.body;

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('phone', phone)
            .single();

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'User with this phone number already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user (basic info only in users table)
        const userData = {
            full_name,
            phone,
            email: email || null,
            password_hash: hashedPassword,
            role: user_type  // Schema uses 'role' not 'user_type'
        };

        const { data: user, error } = await supabase
            .from('users')
            .insert(userData)
            .select('id, full_name, phone, email, role, created_at')
            .single();

        if (error) throw error;

        // Generate JWT token
        const token = jwt.sign(
            {
                user_id: user.id,
                phone: user.phone,
                user_type: user.role  // Use 'role' from schema
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Map role to user_type for frontend consistency
        const { role, ...userWithoutRole } = user;
        const userResponse = {
            ...userWithoutRole,
            user_type: role
        };

        res.status(201).json({
            success: true,
            data: {
                user: userResponse,
                token
            },
            message: 'User registered successfully'
        });
    } catch (error) {
        console.error('Registration error:', error);
        console.error('Error details:', error.message);
        console.error('Error code:', error.code);
        res.status(500).json({
            success: false,
            error: 'Failed to register user',
            details: error.message
        });
    }
});

// POST /api/auth/login - User login
router.post('/login', validateLogin, async (req, res) => {
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

        const { phone, password } = req.body;

        // Get user by phone
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('phone', phone)
            .single();

        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid phone number or password'
            });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid phone number or password'
            });
        }

        // Skip updating last login for now (column may not exist)
        // await supabase
        //     .schema('hackathon')
        //     .from('users')
        //     .update({ last_login_at: new Date().toISOString() })
        //     .eq('id', user.id);

        // Generate JWT token
        const token = jwt.sign(
            {
                user_id: user.id,
                phone: user.phone,
                user_type: user.role  // Use 'role' from schema
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Remove password from response and map role to user_type
        const { password_hash, role, ...userWithoutPassword } = user;
        const userResponse = {
            ...userWithoutPassword,
            user_type: role  // Map role to user_type for frontend consistency
        };

        res.json({
            success: true,
            data: {
                user: userResponse,
                token
            },
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to login'
        });
    }
});

// POST /api/auth/verify-phone - Verify phone number with OTP
router.post('/verify-phone', async (req, res) => {
    try {
        const supabase = getSupabase();
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                error: 'Phone number and OTP are required'
            });
        }

        // TODO: Implement actual OTP verification
        // For now, accept any 6-digit OTP
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid OTP format'
            });
        }

        // Update user verification status  
        const { data, error } = await supabase
            .from('users')
            .update({
                updated_at: new Date().toISOString()
            })
            .eq('phone', phone)
            .select('id, full_name, phone')
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data,
            message: 'Phone number verified successfully'
        });
    } catch (error) {
        console.error('Phone verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify phone number'
        });
    }
});

// POST /api/auth/send-otp - Send OTP for phone verification
router.post('/send-otp', async (req, res) => {
    try {
        const supabase = getSupabase();
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }

        // TODO: Implement actual SMS service integration
        // For now, return mock OTP (in production, don't return actual OTP)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        console.log(`Mock OTP for ${phone}: ${otp}`);

        res.json({
            success: true,
            message: 'OTP sent successfully',
            // Remove this in production!
            debug_otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send OTP'
        });
    }
});

// GET /api/auth/profile - Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { data: user, error } = await supabase
            .from('users')
            .select('id, full_name, phone, email, role')
            .eq('id', req.user.user_id)
            .single();

        if (error || !user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile'
        });
    }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { full_name, email } = req.body;

        const updateData = {};

        if (full_name) updateData.full_name = full_name;
        if (email) updateData.email = email;

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', req.user.user_id)
            .select('id, full_name, phone, email, role')
            .single();

        if (error) throw error;

        res.json({
            success: true,
            data,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
});

// POST /api/auth/change-password - Change user password
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                error: 'Current password and new password are required'
            });
        }

        if (new_password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'New password must be at least 6 characters'
            });
        }

        // Get current user
        const { data: user, error } = await supabase
            .from('users')
            .select('password_hash')
            .eq('id', req.user.user_id)
            .single();

        if (error || !user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Verify current password
        const validPassword = await bcrypt.compare(current_password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Hash new password
        const newHashedPassword = await bcrypt.hash(new_password, 10);

        // Update password
        const { error: updateError } = await supabase
            .from('users')
            .update({
                password_hash: newHashedPassword
            })
            .eq('id', req.user.user_id);

        if (updateError) throw updateError;

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to change password'
        });
    }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
}

export default router;