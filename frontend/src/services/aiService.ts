import axios from 'axios';
import type { AxiosResponse } from 'axios';

// AI Service Configuration
const AI_BASE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

// smythos Agent Endpoints
const smythos_ENDPOINTS = {
    validation: 'https://cmfw9wsphyeox2py58aajifs6.agent.a.smyth.ai/api/validate_donation',
    matching: 'https://cmfvkr7nrwgrgjxgt6sbvbocw.agent.a.smyth.ai/api/match_donation',
    routing: 'https://cmfiillu5dqt2o3wtgst76z6k.agent.a.smyth.ai/api/assign_volunteer',
    chat: 'https://cmfx281tk25mxo3wtwkiei2ry.agent.a.smyth.ai/api/chat',
    notification: import.meta.env.VITE_NOTIFICATION_AGENT_URL || `${AI_BASE_URL}/notify`
};

// Create axios instance for AI services
const aiClient = axios.create({
    baseURL: AI_BASE_URL,
    timeout: 30000, // 30 seconds for AI processing
    headers: {
        'Content-Type': 'application/json',
    },
});

// Create axios instance for smythos agents
const smythosClient = axios.create({
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// AI Service Response Types
interface AIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    confidence?: number;
    processingTime?: number;
}

// Validation Agent Types
interface ValidationRequest {
    type: 'donation' | 'request';
    content: {
        itemName: string;
        category: string;
        quantity: number;
        description?: string;
        location: string;
        urgency: string;
        contactInfo: string;
    };
    metadata?: {
        timestamp: string;
        userType: string;
        previousSubmissions?: number;
    };
}

interface ValidationResult {
    isValid: boolean;
    confidence: number;
    issues: string[];
    suggestions: string[];
    riskLevel: 'low' | 'medium' | 'high';
    autoApprove: boolean;
}

// Matching Agent Types - Updated for smythos format
interface MatchingRequest {
    triggerType: 'newDonation' | 'newRequest';
    primaryItem: {
        id: string;
        type: 'donation' | 'request';
        itemName: string;
        category: string;
        quantity: number;
        urgency: string;
        location: {
            address: string;
            coordinates: { lat: number; lng: number };
            district?: string;
            division?: string;
        };
        expiryDate?: string;
        createdAt: string;
    };
    constraints: {
        maxDistance: number;
        urgencyWeight: number;
        categoryStrict: boolean;
        quantityTolerance: number;
    };
}

interface MatchingResult {
    matches: Array<{
        id: string;
        score: number;
        distance: number;
        compatibility: number;
        urgencyMatch: number;
        quantityMatch?: number;
        estimatedDeliveryTime: string;
        reason: string;
    }>;
    totalMatches: number;
    processingTime: number;
    status?: string;
    timestamp?: string;
}

// Route Optimization Types
interface RouteOptimizationRequest {
    volunteerId: string;
    pickupLocations: Array<{
        id: string;
        lat: number;
        lng: number;
        address: string;
        itemWeight: number;
        priority: number;
    }>;
    deliveryLocations: Array<{
        id: string;
        lat: number;
        lng: number;
        address: string;
        urgency: string;
        timeWindow?: { start: string; end: string };
    }>;
    volunteerCapacity: {
        maxWeight: number;
        vehicleType: string;
        workingHours: { start: string; end: string };
    };
}

interface RouteOptimizationResult {
    optimizedRoute: Array<{
        stopId: string;
        type: 'pickup' | 'delivery';
        order: number;
        estimatedArrival: string;
        duration: number;
        instructions: string;
    }>;
    totalDistance: number;
    totalTime: number;
    efficiency: number;
    alternatives: number;
}

// Notification Agent Types
interface NotificationRequest {
    type: 'match_found' | 'pickup_assigned' | 'delivery_completed' | 'status_update';
    recipients: Array<{
        userId: string;
        userType: 'donor' | 'ngo' | 'volunteer';
        contactMethod: 'sms' | 'email' | 'push';
        language: 'en' | 'bn';
    }>;
    content: {
        title: string;
        message: string;
        actionUrl?: string;
        priority: 'low' | 'normal' | 'high' | 'urgent';
    };
    context?: {
        donationId?: string;
        requestId?: string;
        matchId?: string;
        deliveryId?: string;
    };
}

interface NotificationResult {
    sent: number;
    failed: number;
    details: Array<{
        userId: string;
        status: 'sent' | 'failed';
        error?: string;
    }>;
}

// AI Service Class
class AIService {
    // Validation Agent - Using Real smythos Endpoint
    async validateSubmission(request: ValidationRequest): Promise<AIResponse<ValidationResult>> {
        try {
            console.log('🤖 Calling smythos Validation Agent:', smythos_ENDPOINTS.validation);
            console.log('📤 Request payload:', JSON.stringify(request, null, 2));

            // Call the actual smythos validation agent
            const response: AxiosResponse<any> = await smythosClient.post(
                smythos_ENDPOINTS.validation,
                request
            );

            console.log('📥 Raw smythos response:', response.data);

            // Extract the actual validation result from smythos's nested response
            let validationResult: ValidationResult;

            if (response.data?.result?.Output?.result) {
                // smythos format: {"result": {"Output": {"result": {...}}}}
                const smythosResult = response.data.result.Output.result;
                validationResult = {
                    isValid: smythosResult.isValid || false,
                    confidence: smythosResult.confidence || 0,
                    issues: smythosResult.issues || [],
                    suggestions: smythosResult.suggestions || [],
                    riskLevel: smythosResult.riskLevel || 'medium',
                    autoApprove: smythosResult.autoApprove || false
                };
            } else if (response.data?.isValid !== undefined) {
                // Direct format (fallback compatibility)
                validationResult = response.data as ValidationResult;
            } else {
                // Unexpected format - use fallback
                throw new Error('Unexpected response format from smythos');
            }

            console.log('✅ Parsed validation result:', validationResult);

            // Log successful smythos integration
            console.log('🎉 smythos Validation Agent Successfully Integrated!');
            console.log(`📊 Confidence: ${(validationResult.confidence * 100).toFixed(1)}%`);
            console.log(`🔒 Risk Level: ${validationResult.riskLevel}`);
            console.log(`⚡ Auto-approve: ${validationResult.autoApprove ? 'Yes' : 'No'}`);

            return {
                success: true,
                data: validationResult,
                processingTime: response.headers['x-processing-time'] ?
                    parseInt(response.headers['x-processing-time']) : undefined
            };
        } catch (error: any) {
            console.error('❌ smythos Validation Agent Error:', error);
            console.log('🔄 Falling back to local validation logic');

            // Fallback validation logic for development
            const fallbackResult = this.fallbackValidation(request);
            return {
                success: true,
                data: fallbackResult,
                error: 'Using fallback validation - smythos service unavailable'
            };
        }
    }

    // Matching Agent - Using Real smythos Endpoint
    async findMatches(request: MatchingRequest): Promise<AIResponse<MatchingResult>> {
        try {
            console.log('🎯 Calling smythos Matching Agent:', smythos_ENDPOINTS.matching);
            console.log('📤 Request payload:', JSON.stringify(request, null, 2));

            // Call the actual smythos matching agent
            const response: AxiosResponse<any> = await smythosClient.post(
                smythos_ENDPOINTS.matching,
                request
            );

            console.log('📥 Raw smythos matching response:', response.data);

            // Extract the matching result from smythos's nested response
            let matchingResult: MatchingResult;

            if (response.data?.result?.Output?.matchResults) {
                // smythos format: {"result": {"Output": {"matchResults": {...}}}}
                const smythosResult = response.data.result.Output.matchResults;
                matchingResult = {
                    matches: smythosResult.matches || [],
                    totalMatches: smythosResult.totalMatches || 0,
                    processingTime: smythosResult.processingTime || 0,
                    status: smythosResult.status || 'success',
                    timestamp: smythosResult.timestamp
                };
            } else if (response.data?.matches) {
                // Direct format (fallback compatibility)
                matchingResult = response.data as MatchingResult;
            } else {
                // Unexpected format - use fallback
                throw new Error('Unexpected response format from smythos matching agent');
            }

            console.log('✅ Parsed matching result:', matchingResult);
            console.log('🎉 smythos Matching Agent Successfully Integrated!');
            console.log(`📊 Found ${matchingResult.totalMatches} matches`);
            console.log(`⏱️ Processing time: ${matchingResult.processingTime}ms`);

            return {
                success: true,
                data: matchingResult,
                processingTime: matchingResult.processingTime
            };
        } catch (error: any) {
            console.error('❌ smythos Matching Agent Error:', error);
            console.log('🔄 Falling back to local matching logic');

            // Fallback matching logic for development
            const fallbackResult = this.fallbackMatching(request);
            return {
                success: true,
                data: fallbackResult,
                error: 'Using fallback matching - smythos service unavailable'
            };
        }
    }

    // AI Routing Agent - Volunteer Assignment
    async assignVolunteer(request: {
        matchId: string;
        donationLocation: { lat: number; lng: number; address: string };
        deliveryLocation: { lat: number; lng: number; address: string };
        itemDetails: {
            category: string;
            quantity: number;
            urgency: string;
            weight?: number;
        };
        constraints?: {
            maxDistance?: number;
            vehicleType?: string;
            timeWindow?: { start: string; end: string };
        };
    }): Promise<AIResponse<{
        assignedVolunteer: {
            id: string;
            name: string;
            phone: string;
            vehicleType: string;
            distanceToPickup?: number;
            estimatedPickupTime?: string;
            estimatedDeliveryTime?: string;
            // Legacy fields for compatibility
            capacity?: number;
            estimatedDistance?: number;
            estimatedDuration?: number;
            aiReasoning?: string;
            confidence?: number;
        };
        simpleRoute: {
            pickup: { address: string; eta: string };
            delivery: { address: string; eta: string };
            totalDistance: number;
            totalTime: string;
            optimization?: string;
        };
        status?: string;
        matchId?: string;
    }>> {
        try {
            console.log('🚚 Calling smythos Routing Agent:', smythos_ENDPOINTS.routing);

            // Transform the request to match smythos agent's expected format
            const smythosRequest = {
                matchId: request.matchId,
                donationLocation: {
                    address: request.donationLocation.address,
                    coordinates: {
                        lat: request.donationLocation.lat,
                        lng: request.donationLocation.lng
                    }
                },
                deliveryLocation: {
                    address: request.deliveryLocation.address,
                    coordinates: {
                        lat: request.deliveryLocation.lat,
                        lng: request.deliveryLocation.lng
                    }
                },
                itemDetails: {
                    category: request.itemDetails.category,
                    weight: request.itemDetails.weight ||
                        (request.itemDetails.category === 'water' ? request.itemDetails.quantity * 1.5 :
                            request.itemDetails.category === 'food' ? request.itemDetails.quantity :
                                request.itemDetails.quantity * 0.5),
                    urgency: request.itemDetails.urgency
                },
                constraints: {
                    maxDistance: request.constraints?.maxDistance || 15,
                    preferredVehicle: request.constraints?.vehicleType || 'motorcycle'
                }
            };

            console.log('📤 Transformed request payload:', JSON.stringify(smythosRequest, null, 2));

            // Call the actual smythos routing agent
            const response: AxiosResponse<any> = await smythosClient.post(
                smythos_ENDPOINTS.routing,
                smythosRequest
            );

            console.log('📥 Raw smythos routing response:', response.data);

            // Extract the routing result from smythos's nested response
            let routingResult: any;

            if (response.data?.result?.Output?.assignmentResult) {
                // smythos format: {"result": {"Output": {"assignmentResult": {...}}}}
                routingResult = response.data.result.Output.assignmentResult;
            } else if (response.data?.outputs?.[0]?.outputs?.[0]?.results) {
                // Alternative smythos format
                const results = response.data.outputs[0].outputs[0].results;
                routingResult = typeof results === 'string' ? JSON.parse(results) : results;

                // Handle nested Output wrapper
                if (routingResult.Output?.assignmentResult) {
                    routingResult = routingResult.Output.assignmentResult;
                }
            } else if (response.data?.assignedVolunteer) {
                // Direct format (fallback compatibility)
                routingResult = response.data;
            } else {
                // Unexpected format - use fallback
                throw new Error('Unexpected response format from smythos routing agent');
            }

            console.log('✅ Parsed routing result:', routingResult);
            console.log('🎉 smythos Routing Agent Successfully Integrated!');
            console.log(`🚚 Assigned volunteer: ${routingResult.assignedVolunteer?.name || 'Unknown'}`);
            console.log(`📏 Route distance: ${routingResult.simpleRoute?.totalDistance || 'Unknown'} km`);

            return {
                success: true,
                data: routingResult,
                processingTime: response.headers['x-processing-time'] ?
                    parseInt(response.headers['x-processing-time']) : undefined
            };
        } catch (error: any) {
            console.error('❌ smythos Routing Agent Error:', error);
            console.log('🔄 Falling back to local routing logic');

            // Fallback routing logic for development
            const fallbackResult = this.fallbackVolunteerAssignment(request);
            return {
                success: true,
                data: fallbackResult,
                error: 'Using fallback routing - smythos service unavailable'
            };
        }
    }

    // Route Optimization Agent
    async optimizeRoute(request: RouteOptimizationRequest): Promise<AIResponse<RouteOptimizationResult>> {
        try {
            const response: AxiosResponse<RouteOptimizationResult> = await aiClient.post('/optimize-route', request);
            return {
                success: true,
                data: response.data,
                processingTime: response.headers['x-processing-time']
            };
        } catch (error: any) {
            console.error('Route Optimization Agent Error:', error);

            // Fallback route optimization
            const fallbackResult = this.fallbackRouteOptimization(request);
            return {
                success: true,
                data: fallbackResult,
                error: 'Using fallback routing - AI service unavailable'
            };
        }
    }

    // Notification Agent
    async sendNotifications(request: NotificationRequest): Promise<AIResponse<NotificationResult>> {
        try {
            const response: AxiosResponse<NotificationResult> = await aiClient.post('/notify', request);
            return {
                success: true,
                data: response.data,
                processingTime: response.headers['x-processing-time']
            };
        } catch (error: any) {
            console.error('Notification Agent Error:', error);

            // Fallback notification logic
            const fallbackResult = this.fallbackNotification(request);
            return {
                success: true,
                data: fallbackResult,
                error: 'Using fallback notifications - AI service unavailable'
            };
        }
    }

    // Fallback Methods for Development
    private fallbackValidation(request: ValidationRequest): ValidationResult {
        const { content } = request;
        const issues: string[] = [];
        const suggestions: string[] = [];

        // Basic validation rules
        if (!content.itemName || content.itemName.length < 3) {
            issues.push('Item name too short');
            suggestions.push('Please provide a more descriptive item name');
        }

        if (content.quantity <= 0) {
            issues.push('Invalid quantity');
            suggestions.push('Please specify a positive quantity');
        }

        if (!content.location || content.location.length < 5) {
            issues.push('Location information insufficient');
            suggestions.push('Please provide a complete address');
        }

        const isValid = issues.length === 0;
        const confidence = isValid ? 0.85 : Math.max(0.3, 0.8 - issues.length * 0.2);

        return {
            isValid,
            confidence,
            issues,
            suggestions,
            riskLevel: issues.length > 2 ? 'high' : issues.length > 0 ? 'medium' : 'low',
            autoApprove: isValid && confidence > 0.8
        };
    }

    private fallbackMatching(_request: MatchingRequest): MatchingResult {
        // Mock matching results for development (based on actual smythos format)
        const mockMatches = [
            {
                id: '53920072-4b8b-4c23-8820-41ebca6de44f',
                score: 0.85,
                distance: 8.13,
                compatibility: 1,
                urgencyMatch: 0.3,
                quantityMatch: 1,
                estimatedDeliveryTime: '60 minutes',
                reason: 'Perfect category match, within distance limit, low urgency alignment'
            },
            {
                id: 'match_2',
                score: 0.78,
                distance: 4.1,
                compatibility: 0.82,
                urgencyMatch: 0.75,
                quantityMatch: 0.9,
                estimatedDeliveryTime: '4 hours',
                reason: 'Good match, moderate distance, suitable timing'
            }
        ];

        return {
            matches: mockMatches,
            totalMatches: mockMatches.length,
            processingTime: 3841,
            status: 'success',
            timestamp: new Date().toISOString()
        };
    }

    private fallbackRouteOptimization(request: RouteOptimizationRequest): RouteOptimizationResult {
        // Simple route optimization for development
        const allStops = [
            ...request.pickupLocations.map((loc, index) => ({
                stopId: loc.id,
                type: 'pickup' as const,
                order: index * 2 + 1,
                estimatedArrival: new Date(Date.now() + (index + 1) * 60 * 60 * 1000).toISOString(),
                duration: 15,
                instructions: `Pick up items from ${loc.address}`
            })),
            ...request.deliveryLocations.map((loc, index) => ({
                stopId: loc.id,
                type: 'delivery' as const,
                order: index * 2 + 2,
                estimatedArrival: new Date(Date.now() + (index + 2) * 60 * 60 * 1000).toISOString(),
                duration: 20,
                instructions: `Deliver items to ${loc.address}`
            }))
        ];

        return {
            optimizedRoute: allStops,
            totalDistance: 15.7,
            totalTime: 240,
            efficiency: 0.87,
            alternatives: 3
        };
    }

    private fallbackNotification(request: NotificationRequest): NotificationResult {
        // Mock notification sending for development
        console.log('Mock notification sent:', request);

        return {
            sent: request.recipients.length,
            failed: 0,
            details: request.recipients.map(recipient => ({
                userId: recipient.userId,
                status: 'sent' as const
            }))
        };
    }

    private fallbackVolunteerAssignment(request: any): any {
        // Mock volunteer assignment for development - matching actual smythos format
        console.log('Mock volunteer assignment:', request);

        return {
            assignedVolunteer: {
                id: "4a1e49aa-1095-479b-ab8a-009ef00b49da",
                name: "আহমেদ আলী",
                phone: "+8801712345001",
                vehicleType: "motorcycle",
                distanceToPickup: 8.1,
                estimatedPickupTime: "16 minutes",
                estimatedDeliveryTime: "30 minutes"
            },
            simpleRoute: {
                pickup: {
                    address: request.donationLocation?.address || 'Pickup location',
                    eta: "1:54 PM"
                },
                delivery: {
                    address: request.deliveryLocation?.address || 'Delivery location',
                    eta: "2:08 PM"
                },
                totalDistance: 14.9,
                totalTime: "30 minutes"
            },
            status: "assigned",
            matchId: request.matchId || "match_12345"
        };
    }

    // General Chat/Conversation method for floating chatbot - Using Real smythos Chat Agent
    async processMessage(request: {
        message: string;
        context: {
            userRole: string;
            language: string;
            conversationHistory: Array<{ text: string; sender: 'user' | 'bot'; timestamp: Date; id: number; }>;
        };
        sessionId?: string;
        userId?: string;
    }): Promise<AIResponse<{ message: string; suggestions?: string[]; actions?: string[]; }>> {
        try {
            console.log('💬 Calling smythos Chat Agent:', smythos_ENDPOINTS.chat);
            console.log('📤 Chat request payload:', JSON.stringify(request, null, 2));

            // Generate session ID if not provided
            const sessionId = request.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Convert conversation history to smythos format
            const conversationHistory = request.context.conversationHistory.map((msg, index) => ({
                id: msg.id || Date.now() + index,
                role: msg.sender === 'user' ? 'user' : 'bot',
                content: msg.text,
                language: request.context.language,
                timestamp: msg.timestamp.toISOString()
            }));

            // Prepare smythos chat request
            const smythosRequest = {
                userMessage: request.message,
                language: request.context.language,
                sessionId: sessionId,
                conversationHistory: conversationHistory,
                userContext: {
                    userId: request.userId || 'anonymous_user',
                    platform: 'jonoshongjog_relief_platform',
                    userRole: request.context.userRole,
                    capabilities: [
                        'donation_guidance',
                        'request_assistance',
                        'volunteer_coordination',
                        'disaster_info'
                    ]
                },
                responseRequirements: {
                    language: request.context.language,
                    tone: request.context.language === 'bn' ? 'respectful_bangla' : 'helpful_english',
                    includeEmojis: true,
                    maxLength: 300,
                    includeActionSuggestions: true,
                    culturalContext: request.context.language === 'bn' ? 'bangladesh_relief_distribution' : 'international_relief'
                }
            };

            // Call the actual smythos chat agent
            const response = await smythosClient.post(
                smythos_ENDPOINTS.chat,
                smythosRequest
            );

            console.log('📥 Raw smythos chat response:', response.data);

            // Extract the chat result from smythos's nested response
            let chatResult: { message: string; suggestions?: string[]; actions?: string[]; };

            if (response.data?.result?.Output?.result) {
                // smythos format: {"result": {"Output": {"result": {...}}}}
                const smythosResult = response.data.result.Output.result;
                chatResult = {
                    message: smythosResult.response || smythosResult.message || 'No response available',
                    suggestions: smythosResult.suggestions ? [smythosResult.suggestions] : undefined,
                    actions: smythosResult.actions || undefined
                };
            } else if (response.data?.response || response.data?.message) {
                // Direct format (fallback compatibility)
                chatResult = {
                    message: response.data.response || response.data.message,
                    suggestions: response.data.suggestions ? [response.data.suggestions] : undefined,
                    actions: response.data.actions || undefined
                };
            } else {
                // Unexpected format - use fallback
                throw new Error('Unexpected response format from smythos chat agent');
            }

            console.log('✅ Parsed chat result:', chatResult);
            console.log('🎉 smythos Chat Agent Successfully Integrated!');

            return {
                success: true,
                data: chatResult,
                processingTime: response.headers['x-processing-time'] ?
                    parseInt(response.headers['x-processing-time']) : undefined
            };

        } catch (error: any) {
            console.error('❌ smythos Chat Agent Error:', error);
            console.log('🔄 Falling back to intelligent mock responses');

            // Fallback to intelligent mock responses for development
            const fallbackResponse = this.generateIntelligentResponse({
                message: request.message,
                context: request.context
            });

            return {
                success: true,
                data: fallbackResponse,
                error: 'Using fallback chat responses - smythos service unavailable'
            };
        }
    }

    private generateIntelligentResponse(request: {
        message: string;
        context: {
            userRole: string;
            language: string;
            conversationHistory: Array<{ text: string; sender: 'user' | 'bot'; }>;
        };
    }): { message: string; suggestions?: string[]; } {
        const { message, context } = request;
        const { language } = context;
        const lowerMessage = message.toLowerCase();

        // Define response templates with proper typing
        const responses: Record<'bn' | 'en', Record<string, string[]>> = {
            bn: {
                donate: [
                    'দুর্দান্ত! আপনি কি ধরনের জিনিস দান করতে চান? খাবার, কাপড়, ওষুধ, নাকি অন্য কিছু?',
                    'আপনার দান করার ইচ্ছা দেখে খুব খুশি হলাম। কি ধরনের জিনিস দান করতে চাচ্ছেন?'
                ],
                request: [
                    'আপনার প্রয়োজনটি বুঝতে পেরেছি। আপনি কি ধরনের সাহায্য চান? খাদ্য, বস্ত্র, ওষুধ, নাকি অন্য কিছু?',
                    'আমরা আপনাকে সাহায্য করতে প্রস্তুত। আপনার কি ধরনের জিনিস প্রয়োজন?'
                ],
                volunteer: [
                    'স্বেচ্ছাসেবক হওয়ার জন্য ধন্যবাদ! আপনি কি ধরনের যানবাহন ব্যবহার করেন?',
                    'আপনার সেবার মনোভাব প্রশংসনীয়। আপনি কোন এলাকায় সেবা দিতে চান?'
                ],
                location: [
                    'আপনার অবস্থান জানাতে পারেন? এটি আমাদের নিকটতম সেবা খুঁজে পেতে সাহায্য করবে।',
                    'কোন এলাকায় আছেন? এটি জানলে আমরা আরো ভাল সেবা দিতে পারব।'
                ],
                help: [
                    'আমি আপনাকে এই বিষয়গুলোতে সাহায্য করতে পারি:\n১) দান করতে\n২) ত্রাণ চাইতে\n৩) স্বেচ্ছাসেবক হতে\n৪) অবস্থা জানতে',
                    'আমি জনসংযোগের AI সহায়ক। আপনি দান, ত্রাণ, স্বেচ্ছাসেবক বা যেকোনো বিষয়ে জানতে চাইলে বলুন।'
                ],
                greeting: [
                    'আসসালামু আলাইকুম! আমি জনসংযোগের AI সহায়ক। আপনি কিভাবে সাহায্য করতে পারি?',
                    'নমস্কার! আমি আপনাকে দান, ত্রাণ ও স্বেচ্ছাসেবামূলক কাজে সাহায্য করতে পারি।'
                ],
                thanks: [
                    'ধন্যবাদ! আমি এখানে আছি যখনই প্রয়োজন হবে।',
                    'আপনাকেও ধন্যবাদ। আর কিছু জানতে চান?'
                ]
            },
            en: {
                donate: [
                    'Great! What type of items would you like to donate? Food, clothes, medicine, or something else?',
                    'Wonderful that you want to help! What kind of items are you looking to donate?'
                ],
                request: [
                    'I understand you need assistance. What type of help do you need? Food, clothing, medicine, or something else?',
                    'We are ready to help you. What kind of items do you need?'
                ],
                volunteer: [
                    'Thank you for wanting to volunteer! What type of vehicle do you use?',
                    'Your willingness to serve is commendable. In which area would you like to volunteer?'
                ],
                location: [
                    'Could you please share your location? This will help us find the nearest service.',
                    'Which area are you in? Knowing this will help us serve you better.'
                ],
                help: [
                    'I can help you with:\n1) Donating items\n2) Requesting relief\n3) Volunteering\n4) Checking status',
                    'I am Jonoshongjog AI assistant. I can help with donations, relief requests, volunteering, and other queries.'
                ],
                greeting: [
                    'Hello! I am Jonoshongjog AI assistant. How can I help you today?',
                    'Welcome! I can help you with donations, relief requests, and volunteer opportunities.'
                ],
                thanks: [
                    'Thank you! I am here whenever you need help.',
                    'You\'re welcome! Is there anything else you\'d like to know?'
                ]
            }
        };

        // Determine response type based on message content
        let responseType = 'help';
        let suggestions: string[] = [];

        if (lowerMessage.includes('দান') || lowerMessage.includes('donate') || lowerMessage.includes('donation')) {
            responseType = 'donate';
            suggestions = language === 'bn'
                ? ['খাবার দান করতে চাই', 'কাপড় দান করতে চাই', 'ওষুধ দান করতে চাই']
                : ['I want to donate food', 'I want to donate clothes', 'I want to donate medicine'];
        } else if (lowerMessage.includes('সাহায্য') || lowerMessage.includes('ত্রাণ') || lowerMessage.includes('help') || lowerMessage.includes('request') || lowerMessage.includes('need')) {
            responseType = 'request';
            suggestions = language === 'bn'
                ? ['খাদ্য সাহায্য চাই', 'কাপড়ের প্রয়োজন', 'ওষুধের প্রয়োজন']
                : ['I need food assistance', 'I need clothes', 'I need medicine'];
        } else if (lowerMessage.includes('স্বেচ্ছাসেবক') || lowerMessage.includes('volunteer')) {
            responseType = 'volunteer';
            suggestions = language === 'bn'
                ? ['মোটরসাইকেল আছে', 'গাড়ি আছে', 'সাইকেল আছে']
                : ['I have a motorcycle', 'I have a car', 'I have a bicycle'];
        } else if (lowerMessage.includes('অবস্থান') || lowerMessage.includes('এলাকা') || lowerMessage.includes('location') || lowerMessage.includes('area')) {
            responseType = 'location';
        } else if (lowerMessage.includes('ধন্যবাদ') || lowerMessage.includes('thank')) {
            responseType = 'thanks';
        } else if (lowerMessage.includes('হ্যালো') || lowerMessage.includes('নমস্কার') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            responseType = 'greeting';
        }

        // Get appropriate response array with proper typing
        const langResponses = responses[language as 'bn' | 'en'] || responses['en'];
        const responseArray = langResponses[responseType] || langResponses.help;
        const selectedResponse = responseArray[Math.floor(Math.random() * responseArray.length)];

        return {
            message: selectedResponse,
            suggestions: suggestions.length > 0 ? suggestions : undefined
        };
    }
}

// Export singleton instance
export const aiService = new AIService();

// Export types for use in components
export type {
    ValidationRequest,
    ValidationResult,
    MatchingRequest,
    MatchingResult,
    RouteOptimizationRequest,
    RouteOptimizationResult,
    NotificationRequest,
    NotificationResult,
    AIResponse
};