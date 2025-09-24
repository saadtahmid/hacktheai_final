import express from 'express';
import { body, validationResult } from 'express-validator';
import { getSupabase } from '../config/database.js';
import fetch from 'node-fetch';

const router = express.Router();

// Langflow AI Chatbot Agent Configuration
const LANGFLOW_CHATBOT_ENDPOINT = process.env.LANGFLOW_CHATBOT_URL || 'https://your-langflow-url.agent.a.smyth.ai/api/chat_assistant';
const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY || '';

// In-memory chat sessions (in production, use Redis or database)
const chatSessions = new Map();

// Validation middleware for chat messages
const validateChatMessage = [
    body('message').notEmpty().trim().isLength({ min: 1, max: 1000 }),
    body('user_id').notEmpty().trim(),
    body('session_id').notEmpty().trim(),
    body('language').isIn(['en', 'bn']).optional()
];

// POST /api/chat/message - Send message to AI assistant
router.post('/message', validateChatMessage, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { message, user_id, session_id, language = 'bn', context } = req.body;

        // Get or create chat session
        if (!chatSessions.has(session_id)) {
            chatSessions.set(session_id, {
                id: session_id,
                user_id,
                messages: [],
                context: context || {},
                created_at: new Date().toISOString()
            });
        }

        const session = chatSessions.get(session_id);

        // Add user message to session
        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: message,
            language,
            timestamp: new Date().toISOString()
        };

        session.messages.push(userMessage);

        // Call real Langflow AI Chatbot Agent
        let aiResponse = await callLangflowChatbotAgent(message, language, session);

        // Add AI response to session
        const assistantMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: aiResponse.text,
            language,
            timestamp: new Date().toISOString(),
            suggestions: aiResponse.suggestions || [],
            actions: aiResponse.actions || []
        };

        session.messages.push(assistantMessage);
        session.updated_at = new Date().toISOString();

        res.json({
            success: true,
            data: {
                session_id,
                message: assistantMessage,
                session_info: {
                    message_count: session.messages.length,
                    context: session.context
                }
            }
        });
    } catch (error) {
        console.error('Error processing chat message:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process message'
        });
    }
});

// GET /api/chat/sessions/:session_id - Get chat session history
router.get('/sessions/:session_id', async (req, res) => {
    try {
        const { session_id } = req.params;
        const session = chatSessions.get(session_id);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Chat session not found'
            });
        }

        res.json({
            success: true,
            data: session
        });
    } catch (error) {
        console.error('Error fetching chat session:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch chat session'
        });
    }
});

// POST /api/chat/voice-to-text - Convert voice to text (Bangla support)
router.post('/voice-to-text', async (req, res) => {
    try {
        const { audio_data, language = 'bn' } = req.body;

        if (!audio_data) {
            return res.status(400).json({
                success: false,
                error: 'Audio data is required'
            });
        }

        // TODO: Integrate with speech-to-text service (Google Cloud Speech, Azure, etc.)
        // For now, return mock transcription
        const mockTranscription = language === 'bn'
            ? 'আমার কিছু খাবার দান করতে চাই'
            : 'I want to donate some food';

        res.json({
            success: true,
            data: {
                transcription: mockTranscription,
                language,
                confidence: 0.95
            }
        });
    } catch (error) {
        console.error('Error converting voice to text:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to convert voice to text'
        });
    }
});

// POST /api/chat/text-to-voice - Convert text to speech (Bangla support)
router.post('/text-to-voice', async (req, res) => {
    try {
        const { text, language = 'bn', voice_type = 'female' } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text is required'
            });
        }

        // TODO: Integrate with text-to-speech service
        // For now, return mock audio URL
        res.json({
            success: true,
            data: {
                audio_url: `https://mock-tts-service.com/audio/${Date.now()}.mp3`,
                text,
                language,
                voice_type,
                duration_seconds: Math.ceil(text.length / 10) // Mock duration
            }
        });
    } catch (error) {
        console.error('Error converting text to voice:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to convert text to voice'
        });
    }
});

// POST /api/chat/analyze-intent - Analyze user intent for smart responses
router.post('/analyze-intent', async (req, res) => {
    try {
        const { message, language = 'bn', context } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // TODO: Call AI intent analysis agent
        const intent = analyzeMessageIntent(message, language);

        res.json({
            success: true,
            data: intent
        });
    } catch (error) {
        console.error('Error analyzing intent:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze intent'
        });
    }
});

// DELETE /api/chat/sessions/:session_id - Clear chat session
router.delete('/sessions/:session_id', async (req, res) => {
    try {
        const { session_id } = req.params;
        const deleted = chatSessions.delete(session_id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Chat session not found'
            });
        }

        res.json({
            success: true,
            message: 'Chat session cleared successfully'
        });
    } catch (error) {
        console.error('Error clearing chat session:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear chat session'
        });
    }
});

// Helper functions

/**
 * Call Langflow AI Chatbot Agent for intelligent conversation
 */
async function callLangflowChatbotAgent(message, language, session) {
    try {
        console.log('🤖 Calling Langflow Chatbot Agent...');

        // Prepare conversation context for AI
        const conversationContext = {
            userMessage: message,
            language: language,
            sessionId: session.id,
            conversationHistory: session.messages.slice(-6), // Last 6 messages for context
            userContext: {
                userId: session.user_id,
                platform: 'jonoshongjog_relief_platform',
                capabilities: ['donation_guidance', 'request_assistance', 'volunteer_coordination', 'disaster_info']
            },
            responseRequirements: {
                language: language,
                tone: language === 'bn' ? 'respectful_bangla' : 'helpful_english',
                includeEmojis: true,
                maxLength: 300,
                includeActionSuggestions: true,
                culturalContext: 'bangladesh_relief_distribution'
            }
        };

        const response = await fetch(LANGFLOW_CHATBOT_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LANGFLOW_API_KEY}`,
                'User-Agent': 'Jonoshongjog-Relief-Platform/1.0'
            },
            body: JSON.stringify({
                input_value: JSON.stringify(conversationContext),
                input_type: 'json',
                output_type: 'json'
            }),
            timeout: 12000 // 12 second timeout
        });

        if (!response.ok) {
            throw new Error(`Langflow API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Handle Langflow response format
        let aiResult;
        if (data.outputs && data.outputs[0] && data.outputs[0].outputs && data.outputs[0].outputs[0]) {
            const output = data.outputs[0].outputs[0];
            aiResult = typeof output.results === 'string' ? JSON.parse(output.results) : output.results;
        } else if (data.result) {
            aiResult = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        } else {
            throw new Error('Invalid Langflow response format');
        }

        console.log('✅ AI Chatbot Response received');

        return {
            text: aiResult.response || aiResult.message || 'আমি বুঝতে পারছি না। আবার বলুন।',
            suggestions: aiResult.suggestions || [],
            actions: aiResult.actions || [],
            intent: aiResult.detected_intent || { category: 'general', confidence: 0.5 },
            confidence: aiResult.confidence || 0.8,
            aiGenerated: true
        };

    } catch (error) {
        console.error('🚨 Langflow Chatbot API Error:', error);

        // Fallback to simple rule-based response
        console.log('⚠️  Using fallback chatbot response...');
        return await generateMockAIResponse(message, language, session);
    }
}

async function generateMockAIResponse(message, language, session) {
    const intent = analyzeMessageIntent(message, language);

    const responses = {
        bn: {
            donation: {
                text: 'আপনি কি ধরনের জিনিস দান করতে চান? খাবার, কাপড়, ওষুধ নাকি অন্য কিছু?',
                suggestions: ['খাবার', 'কাপড়', 'ওষুধ', 'কম্বল'],
                actions: ['show_donation_form']
            },
            request: {
                text: 'আপনার কোন এলাকার জন্য সাহায্য দরকার? আমি আশেপাশের দাতাদের খুঁজে দিতে পারি।',
                suggestions: ['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী'],
                actions: ['show_request_form']
            },
            volunteer: {
                text: 'স্বেচ্ছাসেবক হিসেবে আপনি কি ধরনের সহায়তা করতে পারবেন?',
                suggestions: ['খাবার পৌঁছানো', 'কাপড় বিতরণ', 'যানবাহন সহায়তা'],
                actions: ['show_volunteer_registration']
            },
            general: {
                text: 'আমি আপনাকে দান, সাহায্যের অনুরোধ, বা স্বেচ্ছাসেবা নিয়ে সাহায্য করতে পারি। কিভাবে সহায়তা করতে পারি?',
                suggestions: ['দান করতে চাই', 'সাহায্য চাই', 'স্বেচ্ছাসেবক হতে চাই'],
                actions: ['show_main_menu']
            }
        },
        en: {
            donation: {
                text: 'What type of items would you like to donate? Food, clothes, medicine, or something else?',
                suggestions: ['Food', 'Clothes', 'Medicine', 'Blankets'],
                actions: ['show_donation_form']
            },
            request: {
                text: 'Which area needs assistance? I can help find nearby donors.',
                suggestions: ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi'],
                actions: ['show_request_form']
            },
            volunteer: {
                text: 'How would you like to help as a volunteer?',
                suggestions: ['Food delivery', 'Clothes distribution', 'Transportation'],
                actions: ['show_volunteer_registration']
            },
            general: {
                text: 'I can help you with donations, relief requests, or volunteering. How can I assist you?',
                suggestions: ['I want to donate', 'I need help', 'I want to volunteer'],
                actions: ['show_main_menu']
            }
        }
    };

    const langResponses = responses[language] || responses.en;
    return langResponses[intent.category] || langResponses.general;
}

function analyzeMessageIntent(message, language) {
    const lowerMessage = message.toLowerCase();

    // Simple keyword-based intent detection (replace with proper NLP)
    const intents = {
        donation: {
            bn: ['দান', 'দিতে চাই', 'খাবার দেব', 'কাপড় দেব', 'সাহায্য করব'],
            en: ['donate', 'give', 'want to help', 'have food', 'have clothes']
        },
        request: {
            bn: ['সাহায্য চাই', 'দরকার', 'খাবার লাগবে', 'কাপড় লাগবে', 'বন্যা'],
            en: ['need help', 'require', 'need food', 'need clothes', 'flood', 'disaster']
        },
        volunteer: {
            bn: ['স্বেচ্ছাসেবক', 'পৌঁছাতে পারি', 'সাহায্য করতে পারি', 'গাড়ি আছে'],
            en: ['volunteer', 'can deliver', 'can help', 'have vehicle', 'transport']
        }
    };

    for (const [category, keywords] of Object.entries(intents)) {
        const langKeywords = keywords[language] || keywords.en;
        if (langKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return {
                category,
                confidence: 0.8,
                language
            };
        }
    }

    return {
        category: 'general',
        confidence: 0.5,
        language
    };
}

export default router;