import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, getThemeColors } from './ThemeProvider';
import { useTranslation } from './LanguageSwitcher';

interface DisasterInfo {
    id: string;
    name: string;
    emoji: string;
    description: string;
    statistics: {
        frequency: string;
        affected: string;
        damage: string;
    };
    howWeHelp: string[];
    recentExample?: string;
}

const NaturalDisasterInfo: React.FC = () => {
    const { isDark } = useTheme();
    const { language } = useTranslation();
    const colors = getThemeColors(isDark);
    const [selectedDisaster, setSelectedDisaster] = useState<string>('flood');

    // Disaster data with bilingual support
    const disasterData: { [key: string]: DisasterInfo[] } = {
        en: [
            {
                id: 'flood',
                name: 'Floods',
                emoji: '🌊',
                description: 'Bangladesh faces annual flooding affecting millions. Our platform enables rapid response and efficient distribution of emergency supplies.',
                statistics: {
                    frequency: 'Annual - affects 20% of country',
                    affected: '18 million people annually',
                    damage: '$2.8 billion economic loss/year'
                },
                howWeHelp: [
                    'Real-time flood zone mapping and volunteer deployment',
                    'Emergency supply coordination (food, water, medicine)',
                    'Safe evacuation route planning with GPS tracking',
                    'Post-flood rehabilitation resource matching'
                ],
                recentExample: '2020 Monsoon: Coordinated aid for 2.5 million flood victims'
            },
            {
                id: 'cyclone',
                name: 'Cyclones',
                emoji: '🌪️',
                description: 'Powerful cyclones threaten coastal Bangladesh regularly. Our system coordinates pre-emptive evacuations and rapid recovery efforts.',
                statistics: {
                    frequency: '2-3 major cyclones per year',
                    affected: '5-10 million people per event',
                    damage: '$1.5 billion average per cyclone'
                },
                howWeHelp: [
                    'Pre-cyclone evacuation coordination and shelter management',
                    'Emergency medical supply distribution to remote areas',
                    'Post-cyclone damage assessment and relief prioritization',
                    'Temporary shelter setup and family reunification'
                ],
                recentExample: 'Cyclone Amphan 2020: Mobilized 500+ volunteers in 24 hours'
            },
            {
                id: 'drought',
                name: 'Droughts',
                emoji: '🏜️',
                description: 'Extended dry periods affect agriculture and water supply. Our platform connects affected communities with water and food resources.',
                statistics: {
                    frequency: 'Every 2-3 years in northern regions',
                    affected: '3-5 million farmers annually',
                    damage: '30-50% crop loss during severe droughts'
                },
                howWeHelp: [
                    'Water tanker coordination and distribution scheduling',
                    'Drought-resistant seed distribution to farmers',
                    'Alternative livelihood support and job matching',
                    'Long-term water conservation project coordination'
                ],
                recentExample: '2019 Drought: Delivered water to 500+ villages in Rangpur'
            },
            {
                id: 'riverbank',
                name: 'River Erosion',
                emoji: '🏞️',
                description: 'River bank erosion displaces thousands annually. Our system helps coordinate relocation and rehabilitation efforts.',
                statistics: {
                    frequency: 'Continuous - 12,000 hectares lost/year',
                    affected: '50,000 people displaced annually',
                    damage: '1 million people at risk nationwide'
                },
                howWeHelp: [
                    'Emergency relocation assistance and temporary housing',
                    'Land rehabilitation and new settlement coordination',
                    'Livelihood restoration and skill development programs',
                    'Community infrastructure rebuilding projects'
                ],
                recentExample: 'Padma Erosion 2021: Relocated 100+ families safely'
            },
            {
                id: 'heatwave',
                name: 'Heat Waves',
                emoji: '🌡️',
                description: 'Rising temperatures pose health risks, especially to vulnerable populations. Our network provides cooling centers and health support.',
                statistics: {
                    frequency: 'Increasing - 3-4 severe events/year',
                    affected: '15+ million in urban areas',
                    damage: '1000+ heat-related illnesses annually'
                },
                howWeHelp: [
                    'Cooling center location and capacity management',
                    'Heat-related medical emergency response coordination',
                    'Water distribution in high-risk urban areas',
                    'Public awareness campaigns and health monitoring'
                ],
                recentExample: '2023 Heat Wave: Set up 50+ cooling centers in Dhaka'
            }
        ],
        bn: [
            {
                id: 'flood',
                name: 'বন্যা',
                emoji: '🌊',
                description: 'বাংলাদেশ প্রতিবছর বন্যার মুখোমুখি হয় যা লাখো মানুষকে প্রভাবিত করে। আমাদের প্ল্যাটফর্ম জরুরি সরবরাহের দ্রুত প্রতিক্রিয়া এবং দক্ষ বিতরণ সক্ষম করে।',
                statistics: {
                    frequency: 'বার্ষিক - দেশের ২০% এলাকা প্রভাবিত',
                    affected: 'বার্ষিক ১.৮ কোটি মানুষ',
                    damage: 'বছরে ২.৮ বিলিয়ন ডলার অর্থনৈতিক ক্ষতি'
                },
                howWeHelp: [
                    'রিয়েল-টাইম বন্যা অঞ্চল ম্যাপিং এবং স্বেচ্ছাসেবক মোতায়েন',
                    'জরুরি সরবরাহ সমন্বয় (খাদ্য, পানি, ওষুধ)',
                    'GPS ট্র্যাকিং সহ নিরাপদ সরিয়ে নেওয়ার রুট পরিকল্পনা',
                    'বন্যা-পরবর্তী পুনর্বাসন সম্পদ ম্যাচিং'
                ],
                recentExample: '২০২০ বর্ষা: ২৫ লাখ বন্যা দুর্গতের জন্য সাহায্য সমন্বয়'
            },
            {
                id: 'cyclone',
                name: 'ঘূর্ণিঝড়',
                emoji: '🌪️',
                description: 'শক্তিশালী ঘূর্ণিঝড় নিয়মিত উপকূলীয় বাংলাদেশকে হুমকি দেয়। আমাদের সিস্টেম পূর্ব-সতর্ক সরিয়ে নেওয়া এবং দ্রুত পুনরুদ্ধারের প্রচেষ্টা সমন্বয় করে।',
                statistics: {
                    frequency: 'বছরে ২-৩টি বড় ঘূর্ণিঝড়',
                    affected: 'প্রতি ঘটনায় ৫-১০ মিলিয়ন মানুষ',
                    damage: 'প্রতি ঘূর্ণিঝড়ে গড়ে ১.৫ বিলিয়ন ডলার'
                },
                howWeHelp: [
                    'ঘূর্ণিঝড়-পূর্ব সরিয়ে নেওয়া সমন্বয় এবং আশ্রয় ব্যবস্থাপনা',
                    'দূরবর্তী এলাকায় জরুরি চিকিৎসা সরবরাহ বিতরণ',
                    'ঘূর্ণিঝড়-পরবর্তী ক্ষয়ক্ষতি মূল্যায়ন এবং ত্রাণ অগ্রাধিকার',
                    'অস্থায়ী আশ্রয় স্থাপনা এবং পারিবারিক পুনর্মিলন'
                ],
                recentExample: 'ঘূর্ণিঝড় আম্ফান ২০২০: ২৪ ঘন্টায় ৫০০+ স্বেচ্ছাসেবক সংগঠিত'
            },
            {
                id: 'drought',
                name: 'খরা',
                emoji: '🏜️',
                description: 'দীর্ঘ শুষ্ক সময়কাল কৃষি এবং জল সরবরাহকে প্রভাবিত করে। আমাদের প্ল্যাটফর্ম ক্ষতিগ্রস্ত সম্প্রদায়গুলিকে জল এবং খাদ্য সম্পদের সাথে সংযুক্ত করে।',
                statistics: {
                    frequency: 'উত্তরাঞ্চলে প্রতি ২-৩ বছরে',
                    affected: 'বার্ষিক ৩-৫ মিলিয়ন কৃষক',
                    damage: 'গুরুতর খরায় ৩০-৫০% ফসলের ক্ষতি'
                },
                howWeHelp: [
                    'পানি ট্যাংকার সমন্বয় এবং বিতরণ সময়সূচী',
                    'কৃষকদের কাছে খরা-প্রতিরোধী বীজ বিতরণ',
                    'বিকল্প জীবিকা সহায়তা এবং চাকরি ম্যাচিং',
                    'দীর্ঘমেয়াদী জল সংরক্ষণ প্রকল্প সমন্বয়'
                ],
                recentExample: '২০১৯ খরা: রংপুরে ৫০০+ গ্রামে পানি সরবরাহ'
            },
            {
                id: 'riverbank',
                name: 'নদীভাঙন',
                emoji: '🏞️',
                description: 'নদী তীরের ভাঙন বার্ষিক হাজার হাজার মানুষকে বাস্তুচ্যুত করে। আমাদের সিস্টেম স্থানান্তর এবং পুনর্বাসনের প্রচেষ্টা সমন্বয় করতে সাহায্য করে।',
                statistics: {
                    frequency: 'ধারাবাহিক - বছরে ১২,০০০ হেক্টর হারায়',
                    affected: 'বার্ষিক ৫০,০০০ মানুষ বাস্তুচ্যুত',
                    damage: 'দেশব্যাপী ১০ লাখ মানুষ ঝুঁকিতে'
                },
                howWeHelp: [
                    'জরুরি স্থানান্তর সহায়তা এবং অস্থায়ী আবাসন',
                    'ভূমি পুনর্বাসন এবং নতুন বসতি সমন্বয়',
                    'জীবিকা পুনরুদ্ধার এবং দক্ষতা উন্নয়ন কর্মসূচি',
                    'সম্প্রদায়ের অবকাঠামো পুনর্নির্মাণ প্রকল্প'
                ],
                recentExample: 'পদ্মা ভাঙন ২০২১: ১০০+ পরিবার নিরাপদে স্থানান্তর'
            },
            {
                id: 'heatwave',
                name: 'তাপপ্রবাহ',
                emoji: '🌡️',
                description: 'ক্রমবর্ধমান তাপমাত্রা স্বাস্থ্য ঝুঁকি সৃষ্টি করে, বিশেষ করে দুর্বল জনগোষ্ঠীর জন্য। আমাদের নেটওয়ার্ক শীতল কেন্দ্র এবং স্বাস্থ্য সহায়তা প্রদান করে।',
                statistics: {
                    frequency: 'বৃদ্ধি - বছরে ৩-৪টি গুরুতর ঘটনা',
                    affected: 'শহুরে এলাকায় ১৫+ মিলিয়ন',
                    damage: 'বার্ষিক ১০০০+ তাপ-সম্পর্কিত অসুস্থতা'
                },
                howWeHelp: [
                    'শীতল কেন্দ্রের অবস্থান এবং ক্ষমতা ব্যবস্থাপনা',
                    'তাপ-সম্পর্কিত চিকিৎসা জরুরি প্রতিক্রিয়া সমন্বয়',
                    'উচ্চ ঝুঁকিপূর্ণ শহুরে এলাকায় পানি বিতরণ',
                    'জনসচেতনতা প্রচার এবং স্বাস্থ্য পর্যবেক্ষণ'
                ],
                recentExample: '২০২৩ তাপপ্রবাহ: ঢাকায় ৫০+ শীতল কেন্দ্র স্থাপন'
            }
        ]
    };

    const currentDisasters = disasterData[language] || disasterData.en;
    const selectedDisasterData = currentDisasters.find(d => d.id === selectedDisaster) || currentDisasters[0];

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.5 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.4 }
        },
        hover: {
            scale: 1.03,
            y: -5,
            transition: { duration: 0.2 }
        }
    };

    return (
        <motion.section
            className="py-20"
            style={{
                padding: '5rem 0',
                background: colors.bg.gradient
            }}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
        >
            <div
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}
            >
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    style={{ textAlign: 'center', marginBottom: '4rem' }}
                    variants={containerVariants}
                >
                    <motion.h2
                        className="text-4xl font-black mb-4 bangla-text"
                        style={{
                            fontSize: '2.5rem',
                            fontWeight: '900',
                            color: colors.text.primary,
                            marginBottom: '1rem',
                            lineHeight: '1.2'
                        }}
                        variants={itemVariants}
                    >
                        {language === 'bn' ? 'প্রাকৃতিক দুর্যোগ ও আমাদের সমাধান' : 'Natural Disasters & Our Solutions'}
                    </motion.h2>
                    <motion.p
                        className="text-xl max-w-4xl mx-auto bangla-text leading-relaxed"
                        style={{
                            fontSize: '1.25rem',
                            color: colors.text.secondary,
                            maxWidth: '56rem',
                            margin: '0 auto',
                            lineHeight: '1.6'
                        }}
                        variants={itemVariants}
                    >
                        {language === 'bn'
                            ? 'বাংলাদেশে প্রাকৃতিক দুর্যোগের মুখে কীভাবে আমাদের AI-চালিত প্ল্যাটফর্ম দ্রুত, কার্যকর ত্রাণ সহায়তা নিশ্চিত করে'
                            : 'How our AI-powered platform ensures rapid, effective disaster relief across Bangladesh\'s diverse natural challenges'
                        }
                    </motion.p>
                </motion.div>

                {/* Disaster Type Selector */}
                <motion.div
                    className="flex flex-wrap justify-center gap-3 mb-12"
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        marginBottom: '3rem'
                    }}
                    variants={containerVariants}
                >
                    {currentDisasters.map((disaster) => (
                        <motion.button
                            key={disaster.id}
                            onClick={() => setSelectedDisaster(disaster.id)}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.75rem',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                boxShadow: colors.shadow,
                                backgroundColor: selectedDisaster === disaster.id ? colors.green.primary : colors.bg.primary,
                                color: selectedDisaster === disaster.id ? 'white' : colors.text.primary,
                                border: `2px solid ${selectedDisaster === disaster.id ? colors.green.primary : colors.border.primary}`,
                                cursor: 'pointer'
                            }}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span style={{ fontSize: '1.25rem' }}>{disaster.emoji}</span>
                            <span className="bangla-text">{disaster.name}</span>
                        </motion.button>
                    ))}
                </motion.div>

                {/* Main Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedDisaster}
                        className="grid lg:grid-cols-2 gap-12 items-start"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                            gap: '3rem',
                            alignItems: 'start'
                        }}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        {/* Left Column - Disaster Info */}
                        <motion.div
                            className="bg-white rounded-2xl shadow-xl p-8 border-2"
                            style={{
                                backgroundColor: colors.bg.primary,
                                borderRadius: '1rem',
                                boxShadow: colors.shadow,
                                padding: '2rem',
                                border: `2px solid ${colors.border.primary}`
                            }}
                            variants={cardVariants}
                            whileHover="hover"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                                    style={{
                                        width: '4rem',
                                        height: '4rem',
                                        backgroundColor: colors.green.bg,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem'
                                    }}
                                >
                                    {selectedDisasterData.emoji}
                                </div>
                                <div>
                                    <h3
                                        className="text-2xl font-bold bangla-text"
                                        style={{
                                            fontSize: '1.5rem',
                                            fontWeight: '700',
                                            color: colors.text.primary
                                        }}
                                    >
                                        {selectedDisasterData.name}
                                    </h3>
                                    <p
                                        className="text-sm font-medium"
                                        style={{
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: colors.green.primary
                                        }}
                                    >
                                        {language === 'bn' ? 'প্রাকৃতিক দুর্যোগ' : 'Natural Disaster'}
                                    </p>
                                </div>
                            </div>

                            <p
                                className="text-lg leading-relaxed mb-8 bangla-text"
                                style={{
                                    fontSize: '1rem',
                                    color: colors.text.secondary,
                                    marginBottom: '2rem',
                                    lineHeight: '1.6'
                                }}
                            >
                                {selectedDisasterData.description}
                            </p>

                            {/* Statistics */}
                            <div className="space-y-4 mb-8">
                                <h4
                                    className="text-lg font-bold bangla-text"
                                    style={{
                                        fontSize: '1.125rem',
                                        fontWeight: '700',
                                        color: colors.text.primary,
                                        marginBottom: '1rem'
                                    }}
                                >
                                    {language === 'bn' ? '📊 পরিসংখ্যান' : '📊 Key Statistics'}
                                </h4>
                                {Object.entries(selectedDisasterData.statistics).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex justify-between items-center py-2 border-b"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.5rem 0',
                                            borderBottom: `1px solid ${colors.border.primary}`
                                        }}
                                    >
                                        <span
                                            className="font-medium bangla-text"
                                            style={{
                                                fontWeight: '500',
                                                color: colors.text.secondary
                                            }}
                                        >
                                            {key === 'frequency' ? (language === 'bn' ? 'ঘটনার হার' : 'Frequency') :
                                                key === 'affected' ? (language === 'bn' ? 'ক্ষতিগ্রস্ত' : 'Affected') :
                                                    language === 'bn' ? 'ক্ষয়ক্ষতি' : 'Damage'}:
                                        </span>
                                        <span
                                            className="font-bold text-sm"
                                            style={{
                                                fontWeight: '700',
                                                fontSize: '0.875rem',
                                                color: colors.green.primary
                                            }}
                                        >
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Example */}
                            {selectedDisasterData.recentExample && (
                                <div
                                    className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500"
                                    style={{
                                        backgroundColor: colors.green.bg,
                                        borderRadius: '0.5rem',
                                        padding: '1rem',
                                        borderLeft: `4px solid ${colors.green.primary}`
                                    }}
                                >
                                    <p
                                        className="text-sm font-medium bangla-text"
                                        style={{
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: colors.text.primary
                                        }}
                                    >
                                        <strong>{language === 'bn' ? '🏆 সাম্প্রতিক সাফল্য:' : '🏆 Recent Success:'}</strong> {selectedDisasterData.recentExample}
                                    </p>
                                </div>
                            )}
                        </motion.div>

                        {/* Right Column - How We Help */}
                        <motion.div
                            className="bg-white rounded-2xl shadow-xl p-8 border-2"
                            style={{
                                backgroundColor: colors.bg.tertiary,
                                borderRadius: '1rem',
                                boxShadow: colors.shadow,
                                padding: '2rem',
                                border: `2px solid ${colors.green.border}`
                            }}
                            variants={cardVariants}
                            whileHover="hover"
                        >
                            <h4
                                className="text-2xl font-bold mb-6 bangla-text flex items-center gap-3"
                                style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: colors.text.primary,
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}
                            >
                                <span
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                                    style={{
                                        width: '2rem',
                                        height: '2rem',
                                        backgroundColor: colors.green.primary,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    AI
                                </span>
                                {language === 'bn' ? 'আমরা কীভাবে সাহায্য করি' : 'How Jonoshongjog Helps'}
                            </h4>

                            <div className="space-y-4">
                                {selectedDisasterData.howWeHelp.map((helpItem, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex items-start gap-4 p-4 rounded-lg hover:bg-green-50 transition-colors duration-300"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '1rem',
                                            padding: '1rem',
                                            borderRadius: '0.5rem',
                                            transition: 'background-color 0.3s ease',
                                            backgroundColor: 'transparent'
                                        }}
                                        variants={itemVariants}
                                        whileHover={{
                                            backgroundColor: colors.green.bg,
                                            scale: 1.02
                                        }}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                                            style={{
                                                width: '2rem',
                                                height: '2rem',
                                                backgroundColor: colors.green.primary,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: '700',
                                                fontSize: '0.875rem',
                                                flexShrink: 0
                                            }}
                                        >
                                            {index + 1}
                                        </div>
                                        <p
                                            className="text-sm leading-relaxed bangla-text"
                                            style={{
                                                fontSize: '0.875rem',
                                                color: colors.text.primary,
                                                lineHeight: '1.5'
                                            }}
                                        >
                                            {helpItem}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Call to Action */}
                            <motion.div
                                className="mt-8 p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white text-center"
                                style={{
                                    marginTop: '2rem',
                                    padding: '1.5rem',
                                    background: `linear-gradient(to right, ${colors.green.primary}, #059669)`,
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    textAlign: 'center'
                                }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <p
                                    className="text-lg font-bold mb-3 bangla-text"
                                    style={{
                                        fontSize: '1.125rem',
                                        fontWeight: '700',
                                        marginBottom: '0.75rem'
                                    }}
                                >
                                    {language === 'bn'
                                        ? '🚨 জরুরি সময়ে আমাদের সাথে থাকুন'
                                        : '🚨 Be Prepared - Join Our Network'
                                    }
                                </p>
                                <p
                                    className="text-sm bangla-text"
                                    style={{ fontSize: '0.875rem' }}
                                >
                                    {language === 'bn'
                                        ? 'দুর্যোগের আগে প্রস্তুত থাকুন। আমাদের নেটওয়ার্কে যোগ দিয়ে কমিউনিটিকে সাহায্য করুন।'
                                        : 'Join thousands of volunteers, donors, and organizations in our disaster preparedness network.'
                                    }
                                </p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>

                {/* Impact Summary */}
                <motion.div
                    className="mt-16 bg-white rounded-2xl shadow-xl p-8 text-center"
                    style={{
                        marginTop: '4rem',
                        backgroundColor: colors.bg.primary,
                        borderRadius: '1rem',
                        boxShadow: colors.shadow,
                        padding: '2rem',
                        textAlign: 'center',
                        border: `2px solid ${colors.border.accent}`
                    }}
                    variants={cardVariants}
                    whileInView="visible"
                    whileHover="hover"
                >
                    <h3
                        className="text-2xl font-bold mb-6 bangla-text"
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: colors.text.primary,
                            marginBottom: '1.5rem'
                        }}
                    >
                        {language === 'bn' ? '🌟 সম্মিলিত প্রভাব' : '🌟 Collective Impact'}
                    </h3>
                    <div
                        className="grid md:grid-cols-4 gap-6"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '1.5rem'
                        }}
                    >
                        {[
                            {
                                number: '5M+',
                                label: language === 'bn' ? 'জীবন সুরক্ষিত' : 'Lives Protected',
                                emoji: '🛡️'
                            },
                            {
                                number: '72 hrs',
                                label: language === 'bn' ? 'গড় সাড়া সময়' : 'Avg Response Time',
                                emoji: '⚡'
                            },
                            {
                                number: '95%',
                                label: language === 'bn' ? 'ত্রাণ নির্ভুলতা' : 'Relief Accuracy',
                                emoji: '🎯'
                            },
                            {
                                number: '24/7',
                                label: language === 'bn' ? 'AI সহায়তা' : 'AI Assistance',
                                emoji: '🤖'
                            }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover={{ scale: 1.1 }}
                            >
                                <div
                                    style={{
                                        fontSize: '2rem',
                                        marginBottom: '0.5rem'
                                    }}
                                >
                                    {stat.emoji}
                                </div>
                                <div
                                    className="text-2xl font-black mb-1"
                                    style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '900',
                                        color: colors.green.primary,
                                        marginBottom: '0.25rem'
                                    }}
                                >
                                    {stat.number}
                                </div>
                                <div
                                    className="text-sm font-medium bangla-text"
                                    style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: colors.text.secondary
                                    }}
                                >
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.section>
    );
};

export default NaturalDisasterInfo;