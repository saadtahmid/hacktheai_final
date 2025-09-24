import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../components/LanguageSwitcher';
import { useTheme, getThemeColors } from '../components/ThemeProvider';

interface ValidationResult {
    isValid: boolean;
    confidence: number;
    issues: string[];
    suggestions: string[];
    riskLevel: 'low' | 'medium' | 'high';
    autoApprove: boolean;
}

interface MatchingResults {
    success: boolean;
    data?: {
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
    };
    error?: string;
}

interface RoutingResult {
    assignedVolunteer: {
        id: string;
        name: string;
        phone: string;
        vehicleType: string;
        distanceToPickup: number;
        estimatedPickupTime: string;
        estimatedDeliveryTime: string;
    };
    simpleRoute: {
        pickup: { address: string; eta: string };
        delivery: { address: string; eta: string };
        totalDistance: number;
        totalTime: string;
    };
    deliveryId: string;
    status: string;
}

interface ConfirmationState {
    type: 'donation' | 'request';
    data: any;
    message: string;
    validationResult?: ValidationResult;
    matchingResults?: MatchingResults & { routingResult?: RoutingResult };
    matchingError?: string;
}

const ConfirmationPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { language } = useTranslation();
    const { isDark } = useTheme();
    const colors = getThemeColors(isDark);

    const state = location.state as ConfirmationState | null;

    if (!state) {
        // Redirect to home if no state
        React.useEffect(() => {
            navigate('/', { replace: true });
        }, [navigate]);
        return null;
    }

    const { type, data, message, validationResult, matchingResults, matchingError } = state;

    return (
        <div className="min-h-screen flex items-center justify-center px-4"
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                background: colors.bg.gradient
            }}>

            <div className="max-w-2xl w-full"
                style={{ maxWidth: '42rem', width: '100%' }}>

                {/* Success Card */}
                <div className="rounded-xl shadow-xl p-8 text-center"
                    style={{
                        backgroundColor: colors.bg.primary,
                        borderRadius: '0.75rem',
                        boxShadow: colors.shadow,
                        padding: '2rem',
                        textAlign: 'center'
                    }}>

                    {/* Success Icon */}
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{
                            width: '4rem',
                            height: '4rem',
                            borderRadius: '50%',
                            backgroundColor: colors.green.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                        <svg className="w-8 h-8"
                            style={{ width: '2rem', height: '2rem', color: colors.green.primary }}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-black mb-4 bangla-text"
                        style={{
                            fontSize: '1.875rem',
                            fontWeight: '900',
                            marginBottom: '1rem',
                            color: colors.text.primary
                        }}>
                        {language === 'bn' ? '✅ সফলভাবে জমা দেওয়া হয়েছে!' : '✅ Successfully Submitted!'}
                    </h1>

                    {/* Message */}
                    <p className="text-lg mb-6 bangla-text"
                        style={{
                            fontSize: '1.125rem',
                            marginBottom: '1.5rem',
                            color: colors.text.secondary,
                            lineHeight: '1.6'
                        }}>
                        {message}
                    </p>

                    {/* Validation Results */}
                    {validationResult && (
                        <div className={`rounded-lg p-6 mb-6 border-l-4 ${validationResult.isValid
                            ? 'bg-green-50 border-green-400'
                            : 'bg-orange-50 border-orange-400'
                            }`}
                            style={{
                                borderRadius: '0.5rem',
                                padding: '1.5rem',
                                marginBottom: '1.5rem',
                                backgroundColor: validationResult.isValid ? colors.green.bg : '#fff7ed',
                                borderLeft: `4px solid ${validationResult.isValid ? colors.green.primary : '#f59e0b'}`
                            }}>

                            <h3 className="text-lg font-bold mb-4 bangla-text"
                                style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '700',
                                    marginBottom: '1rem',
                                    color: validationResult.isValid ? colors.green.primary : '#d97706'
                                }}>
                                {language === 'bn' ? '🤖 AI যাচাইকরণ ফলাফল' : '🤖 AI Validation Results'}
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4 text-left"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '1rem',
                                    textAlign: 'left'
                                }}>

                                {/* Status */}
                                <div>
                                    <div className="text-sm font-medium mb-1 bangla-text"
                                        style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                                        {language === 'bn' ? 'স্ট্যাটাস:' : 'Status:'}
                                    </div>
                                    <div className={`inline-flex items-center px-2 py-1 rounded text-sm ${validationResult.isValid
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-orange-100 text-orange-800'
                                        }`}>
                                        {validationResult.isValid
                                            ? (language === 'bn' ? 'বৈধ' : 'Valid')
                                            : (language === 'bn' ? 'পর্যালোচনা প্রয়োজন' : 'Needs Review')
                                        }
                                    </div>
                                </div>

                                {/* Confidence */}
                                <div>
                                    <div className="text-sm font-medium mb-1 bangla-text"
                                        style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                                        {language === 'bn' ? 'বিশ্বস্ততা:' : 'Confidence:'}
                                    </div>
                                    <div className="text-lg font-bold"
                                        style={{ fontSize: '1.125rem', fontWeight: '700' }}>
                                        {Math.round(validationResult.confidence * 100)}%
                                    </div>
                                </div>

                                {/* Risk Level */}
                                <div>
                                    <div className="text-sm font-medium mb-1 bangla-text"
                                        style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                                        {language === 'bn' ? 'ঝুঁকির স্তর:' : 'Risk Level:'}
                                    </div>
                                    <span className={`px-2 py-1 rounded text-sm text-white ${validationResult.riskLevel === 'low' ? 'bg-green-500' :
                                        validationResult.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}>
                                        {validationResult.riskLevel.toUpperCase()}
                                    </span>
                                </div>

                                {/* Auto Approve */}
                                <div>
                                    <div className="text-sm font-medium mb-1 bangla-text"
                                        style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                                        {language === 'bn' ? 'স্বয়ংক্রিয় অনুমোদন:' : 'Auto Approved:'}
                                    </div>
                                    <div className="text-lg">
                                        {validationResult.autoApprove ? '✅' : '❌'}
                                    </div>
                                </div>
                            </div>

                            {/* Issues */}
                            {validationResult.issues && validationResult.issues.length > 0 && (
                                <div className="mt-4">
                                    <div className="text-sm font-medium mb-2 bangla-text"
                                        style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                        {language === 'bn' ? '⚠️ সমস্যাসমূহ:' : '⚠️ Issues Found:'}
                                    </div>
                                    <ul className="text-sm list-disc list-inside space-y-1 bangla-text"
                                        style={{ fontSize: '0.875rem', listStyleType: 'disc', paddingLeft: '1rem' }}>
                                        {validationResult.issues.map((issue, index) => (
                                            <li key={index} style={{ marginBottom: '0.25rem' }}>{issue}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Suggestions */}
                            {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                                <div className="mt-4">
                                    <div className="text-sm font-medium mb-2 bangla-text"
                                        style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                        {language === 'bn' ? '💡 পরামর্শ:' : '💡 Suggestions:'}
                                    </div>
                                    <ul className="text-sm list-disc list-inside space-y-1 bangla-text"
                                        style={{ fontSize: '0.875rem', listStyleType: 'disc', paddingLeft: '1rem' }}>
                                        {validationResult.suggestions.map((suggestion, index) => (
                                            <li key={index} style={{ marginBottom: '0.25rem' }}>{suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Matching Results */}
                    {matchingResults && matchingResults.success && matchingResults.data && (
                        <div className="rounded-lg p-4 text-center mb-6"
                            style={{
                                backgroundColor: colors.green.bg,
                                border: `2px solid ${colors.green.border}`,
                                borderRadius: '0.75rem',
                                padding: '1.5rem',
                                marginBottom: '1.5rem',
                                textAlign: 'center'
                            }}>
                            <h3 className="text-lg font-bold mb-4 bangla-text"
                                style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    marginBottom: '1rem',
                                    color: colors.text.primary
                                }}>
                                {language === 'bn' ? '🎯 AI ম্যাচিং ফলাফল' : '🎯 AI Matching Results'}
                            </h3>

                            <div className="text-center mb-4">
                                <div className="text-3xl mb-2" style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>
                                    🎉
                                </div>
                                <div className="text-xl font-bold text-green-600 bangla-text"
                                    style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.green.primary }}>
                                    {language === 'bn'
                                        ? `${matchingResults.data.totalMatches}টি সম্ভাব্য ম্যাচ পাওয়া গেছে!`
                                        : `${matchingResults.data.totalMatches} Potential Matches Found!`
                                    }
                                </div>
                                <div className="text-sm text-gray-600 mt-2 bangla-text"
                                    style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: colors.text.secondary }}>
                                    {language === 'bn'
                                        ? `প্রক্রিয়াকরণ সময়: ${matchingResults.data.processingTime}ms`
                                        : `Processing time: ${matchingResults.data.processingTime}ms`
                                    }
                                </div>
                            </div>

                            {/* Best Match Details */}
                            {matchingResults.data.matches && matchingResults.data.matches.length > 0 && (
                                <div className="bg-white rounded-lg p-4 text-left"
                                    style={{
                                        backgroundColor: colors.bg.primary,
                                        borderRadius: '0.5rem',
                                        padding: '1rem',
                                        textAlign: 'left'
                                    }}>
                                    <h4 className="font-bold mb-3 bangla-text"
                                        style={{ fontWeight: '700', marginBottom: '0.75rem', color: colors.text.primary }}>
                                        {language === 'bn' ? '🏆 সেরা ম্যাচ:' : '🏆 Best Match:'}
                                    </h4>

                                    {(() => {
                                        const bestMatch = matchingResults.data.matches[0];
                                        return (
                                            <div className="grid md:grid-cols-2 gap-3"
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                                    gap: '0.75rem'
                                                }}>
                                                <div>
                                                    <span className="text-sm font-medium bangla-text"
                                                        style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                                                        {language === 'bn' ? 'স্কোর:' : 'Score:'}
                                                    </span>
                                                    <div className="text-lg font-bold text-green-600"
                                                        style={{ fontSize: '1.125rem', fontWeight: '700', color: colors.green.primary }}>
                                                        {Math.round(bestMatch.score * 100)}%
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium bangla-text"
                                                        style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                                                        {language === 'bn' ? 'দূরত্ব:' : 'Distance:'}
                                                    </span>
                                                    <div className="text-lg font-bold"
                                                        style={{ fontSize: '1.125rem', fontWeight: '700' }}>
                                                        {bestMatch.distance} km
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium bangla-text"
                                                        style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                                                        {language === 'bn' ? 'সামঞ্জস্য:' : 'Compatibility:'}
                                                    </span>
                                                    <div className="text-lg font-bold"
                                                        style={{ fontSize: '1.125rem', fontWeight: '700' }}>
                                                        {Math.round(bestMatch.compatibility * 100)}%
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium bangla-text"
                                                        style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                                                        {language === 'bn' ? 'ডেলিভারি সময়:' : 'Delivery Time:'}
                                                    </span>
                                                    <div className="text-lg font-bold"
                                                        style={{ fontSize: '1.125rem', fontWeight: '700' }}>
                                                        {bestMatch.estimatedDeliveryTime}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <div className="mt-3 p-2 bg-gray-50 rounded"
                                        style={{
                                            marginTop: '0.75rem',
                                            padding: '0.5rem',
                                            backgroundColor: colors.bg.secondary,
                                            borderRadius: '0.25rem'
                                        }}>
                                        <span className="text-sm font-medium bangla-text"
                                            style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                                            {language === 'bn' ? 'কারণ:' : 'Reason:'}
                                        </span>
                                        <p className="text-sm mt-1 bangla-text"
                                            style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                            {matchingResults.data.matches[0].reason}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Volunteer Assignment Results */}
                            {matchingResults && (matchingResults as any).routingResult && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg"
                                    style={{
                                        marginTop: '1rem',
                                        padding: '1rem',
                                        backgroundColor: '#eff6ff',
                                        borderRadius: '0.5rem',
                                        border: '1px solid #3b82f6'
                                    }}>
                                    <h4 className="font-bold mb-3 text-blue-800 bangla-text"
                                        style={{ fontWeight: '700', marginBottom: '0.75rem', color: '#1e40af' }}>
                                        {language === 'bn' ? '🚚 স্বেচ্ছাসেবক নিযুক্ত হয়েছেন!' : '🚚 Volunteer Assigned!'}
                                    </h4>

                                    {(() => {
                                        const routing = (matchingResults as any).routingResult;
                                        return (
                                            <div className="space-y-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                <div className="grid grid-cols-2 gap-4"
                                                    style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                                        gap: '1rem'
                                                    }}>
                                                    <div>
                                                        <span className="text-sm font-medium bangla-text"
                                                            style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                                                            {language === 'bn' ? 'নাম:' : 'Name:'}
                                                        </span>
                                                        <div className="text-lg font-bold text-blue-700"
                                                            style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1d4ed8' }}>
                                                            {routing.assignedVolunteer.name}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium bangla-text"
                                                            style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                                                            {language === 'bn' ? 'যানবাহন:' : 'Vehicle:'}
                                                        </span>
                                                        <div className="text-lg font-bold"
                                                            style={{ fontSize: '1.125rem', fontWeight: '700' }}>
                                                            {routing.assignedVolunteer.vehicleType}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium bangla-text"
                                                            style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                                                            {language === 'bn' ? 'দূরত্ব:' : 'Distance:'}
                                                        </span>
                                                        <div className="text-lg font-bold"
                                                            style={{ fontSize: '1.125rem', fontWeight: '700' }}>
                                                            {routing.assignedVolunteer.distanceToPickup} km
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium bangla-text"
                                                            style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                                                            {language === 'bn' ? 'আনুমানিক সময়:' : 'Estimated Time:'}
                                                        </span>
                                                        <div className="text-lg font-bold"
                                                            style={{ fontSize: '1.125rem', fontWeight: '700' }}>
                                                            {routing.assignedVolunteer.estimatedPickupTime}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-3 p-3 bg-white rounded border-l-4 border-blue-500"
                                                    style={{
                                                        marginTop: '0.75rem',
                                                        padding: '0.75rem',
                                                        backgroundColor: 'white',
                                                        borderRadius: '0.25rem',
                                                        borderLeft: '4px solid #3b82f6'
                                                    }}>
                                                    <div className="text-sm font-medium mb-2 bangla-text"
                                                        style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                                        {language === 'bn' ? '📍 পিকআপ ও ডেলিভারি:' : '📍 Pickup & Delivery:'}
                                                    </div>
                                                    <div className="text-sm space-y-1"
                                                        style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                        <div>
                                                            <strong>{language === 'bn' ? 'সংগ্রহ:' : 'Pickup:'}</strong> {routing.simpleRoute.pickup.eta}
                                                        </div>
                                                        <div>
                                                            <strong>{language === 'bn' ? 'বিতরণ:' : 'Delivery:'}</strong> {routing.simpleRoute.delivery.eta}
                                                        </div>
                                                        <div>
                                                            <strong>{language === 'bn' ? 'মোট দূরত্ব:' : 'Total Distance:'}</strong> {routing.simpleRoute.totalDistance} km
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Matching Error */}
                    {matchingError && (
                        <div className="rounded-lg p-4 text-center mb-6"
                            style={{
                                backgroundColor: '#fef3cd',
                                border: '2px solid #f59e0b',
                                borderRadius: '0.75rem',
                                padding: '1.5rem',
                                marginBottom: '1.5rem',
                                textAlign: 'center'
                            }}>
                            <div className="text-lg font-bold mb-2 bangla-text"
                                style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem', color: '#f59e0b' }}>
                                {language === 'bn' ? '⚠️ ম্যাচিং সমস্যা' : '⚠️ Matching Issue'}
                            </div>
                            <p className="text-sm bangla-text" style={{ fontSize: '0.875rem' }}>
                                {language === 'bn'
                                    ? 'ম্যাচিং প্রক্রিয়ায় সমস্যা হয়েছে, কিন্তু আপনার দান সফলভাবে জমা হয়েছে।'
                                    : 'There was an issue with matching, but your donation was submitted successfully.'
                                }
                            </p>
                        </div>
                    )}

                    {/* Submission Details */}
                    <div className="rounded-lg p-4 text-left mb-6"
                        style={{
                            backgroundColor: colors.bg.secondary,
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            textAlign: 'left'
                        }}>
                        <h3 className="text-lg font-bold mb-3 bangla-text"
                            style={{
                                fontSize: '1.125rem',
                                fontWeight: '700',
                                marginBottom: '0.75rem',
                                color: colors.text.primary
                            }}>
                            {language === 'bn' ? '📋 জমাদান বিবরণ' : '📋 Submission Details'}
                        </h3>

                        {data && (
                            <div className="space-y-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div className="flex justify-between">
                                    <span className="font-medium bangla-text" style={{ fontWeight: '500' }}>
                                        {language === 'bn' ? 'আইডি:' : 'ID:'}
                                    </span>
                                    <span className="text-gray-600">#{data.id}</span>
                                </div>
                                {data.item_name && (
                                    <div className="flex justify-between">
                                        <span className="font-medium bangla-text" style={{ fontWeight: '500' }}>
                                            {language === 'bn' ? 'পণ্য:' : 'Item:'}
                                        </span>
                                        <span>{data.item_name}</span>
                                    </div>
                                )}
                                {data.category && (
                                    <div className="flex justify-between">
                                        <span className="font-medium bangla-text" style={{ fontWeight: '500' }}>
                                            {language === 'bn' ? 'ধরন:' : 'Category:'}
                                        </span>
                                        <span className="capitalize">{data.category}</span>
                                    </div>
                                )}
                                {data.status && (
                                    <div className="flex justify-between">
                                        <span className="font-medium bangla-text" style={{ fontWeight: '500' }}>
                                            {language === 'bn' ? 'অবস্থা:' : 'Status:'}
                                        </span>
                                        <span className={`px-2 py-1 rounded text-sm ${data.status === 'available' ? 'bg-green-100 text-green-800' :
                                            data.status === 'pending_validation' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {data.status === 'available'
                                                ? (language === 'bn' ? 'উপলব্ধ' : 'Available')
                                                : data.status === 'pending_validation'
                                                    ? (language === 'bn' ? 'যাচাইয়ের অপেক্ষায়' : 'Pending Validation')
                                                    : data.status
                                            }
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            justifyContent: 'center'
                        }}>

                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors bangla-text"
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: colors.green.primary,
                                color: 'white',
                                borderRadius: '0.5rem',
                                border: 'none',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease'
                            }}
                        >
                            {language === 'bn' ? '🏠 হোম পেজে ফিরে যান' : '🏠 Back to Home'}
                        </button>

                        <button
                            onClick={() => navigate(type === 'donation' ? '/donor' : '/ngo')}
                            className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors bangla-text"
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: `2px solid ${colors.green.primary}`,
                                color: colors.green.primary,
                                backgroundColor: 'transparent',
                                borderRadius: '0.5rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease'
                            }}
                        >
                            {type === 'donation'
                                ? (language === 'bn' ? '➕ আরো দান করুন' : '➕ Make Another Donation')
                                : (language === 'bn' ? '➕ আরো অনুরোধ করুন' : '➕ Make Another Request')
                            }
                        </button>
                    </div>

                </div>

                {/* Next Steps */}
                {validationResult && (
                    <div className="mt-6 rounded-lg p-4"
                        style={{
                            marginTop: '1.5rem',
                            backgroundColor: colors.bg.secondary,
                            border: `1px solid ${colors.border.primary}`,
                            borderRadius: '0.5rem',
                            padding: '1rem'
                        }}>
                        <h3 className="text-lg font-bold mb-2 bangla-text"
                            style={{
                                fontSize: '1.125rem',
                                fontWeight: '700',
                                marginBottom: '0.5rem',
                                color: colors.text.primary
                            }}>
                            {language === 'bn' ? '🚀 পরবর্তী পদক্ষেপ' : '🚀 What Happens Next'}
                        </h3>
                        <div className="text-sm bangla-text space-y-2"
                            style={{ fontSize: '0.875rem', color: colors.text.secondary }}>
                            {validationResult.autoApprove ? (
                                <>
                                    <p>
                                        {language === 'bn'
                                            ? '✅ আপনার দান স্বয়ংক্রিয়ভাবে অনুমোদিত হয়েছে এবং এখন প্রাপকদের সাথে ম্যাচিং শুরু হবে।'
                                            : '✅ Your donation has been auto-approved and will now be matched with recipients.'
                                        }
                                    </p>
                                    <p>
                                        {language === 'bn'
                                            ? '📞 উপযুক্ত প্রাপক পাওয়া গেলে আমরা আপনাকে জানাবো।'
                                            : '📞 We will notify you when a suitable recipient is found.'
                                        }
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p>
                                        {language === 'bn'
                                            ? '👥 আপনার দান ম্যানুয়াল যাচাইয়ের জন্য পাঠানো হয়েছে।'
                                            : '👥 Your donation has been sent for manual verification.'
                                        }
                                    </p>
                                    <p>
                                        {language === 'bn'
                                            ? '⏱️ যাচাইকরণ সাধারণত ২৪ ঘন্টার মধ্যে সম্পূর্ণ হয়।'
                                            : '⏱️ Verification typically completes within 24 hours.'
                                        }
                                    </p>
                                    <p>
                                        {language === 'bn'
                                            ? '📧 অনুমোদনের পর আমরা আপনাকে ইমেইল করবো।'
                                            : '📧 We will email you once approved.'
                                        }
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ConfirmationPage;