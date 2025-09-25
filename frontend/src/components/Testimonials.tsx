import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, getThemeColors } from './ThemeProvider';
import { useTranslation } from './LanguageSwitcher';

interface Testimonial {
    id: number;
    name: string;
    role: string;
    organization?: string;
    message: string;
    avatar: string;
    rating: number;
    location: string;
    verified: boolean;
}

const Testimonials: React.FC = () => {
    const { isDark } = useTheme();
    const { language, t } = useTranslation();
    const colors = getThemeColors(isDark);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    // Sample testimonials data with Bengali and English versions
    const testimonials: { [key: string]: Testimonial[] } = {
        en: [
            {
                id: 1,
                name: "Dr. Rashida Khatun",
                role: "Relief Coordinator",
                organization: "Bangladesh Red Crescent",
                message: "Jonoshongjog transformed how we coordinate disaster relief. The AI matching system helped us reach 10,000+ families during the recent floods with 90% efficiency.",
                avatar: "👩‍⚕️",
                rating: 5,
                location: "Dhaka, Bangladesh",
                verified: true
            },
            {
                id: 2,
                name: "Mohammad Karim",
                role: "Volunteer",
                message: "The real-time GPS tracking and smart route optimization saved me 2 hours per delivery. I can now help 3x more families in need every day.",
                avatar: "🚗",
                rating: 5,
                location: "Sylhet, Bangladesh",
                verified: true
            },
            {
                id: 3,
                name: "Fatema Begum",
                role: "Community Donor",
                message: "As a small business owner, this platform made it easy to donate regularly. The transparency and direct impact reports give me confidence in every donation.",
                avatar: "👩‍💼",
                rating: 5,
                location: "Chittagong, Bangladesh",
                verified: true
            },
            {
                id: 4,
                name: "Abdul Rahman",
                role: "NGO Director",
                organization: "Grameen Foundation",
                message: "The bilingual AI assistant helped us serve both urban and rural communities effectively. Our distribution time reduced by 60%.",
                avatar: "👨‍💼",
                rating: 5,
                location: "Rangpur, Bangladesh",
                verified: true
            },
            {
                id: 5,
                name: "Nasir Ahmed",
                role: "Disaster Response Volunteer",
                message: "During Cyclone Amphan, this platform coordinated 500+ volunteers seamlessly. The mobile-first design worked perfectly even with poor network connectivity.",
                avatar: "🌪️",
                rating: 5,
                location: "Khulna, Bangladesh",
                verified: true
            }
        ],
        bn: [
            {
                id: 1,
                name: "ডাঃ রশিদা খাতুন",
                role: "ত্রাণ সমন্বয়কারী",
                organization: "বাংলাদেশ রেড ক্রিসেন্ট",
                message: "জনসংযোগ দুর্যোগ ত্রাণ সমন্বয়ের পদ্ধতি পরিবর্তন করেছে। AI ম্যাচিং সিস্টেম সাম্প্রতিক বন্যায় ১০,০০০+ পরিবারের কাছে ৯০% দক্ষতায় পৌঁছাতে সাহায্য করেছে।",
                avatar: "👩‍⚕️",
                rating: 5,
                location: "ঢাকা, বাংলাদেশ",
                verified: true
            },
            {
                id: 2,
                name: "মোহাম্মদ করিম",
                role: "স্বেচ্ছাসেবক",
                message: "রিয়েল-টাইম GPS ট্র্যাকিং এবং স্মার্ট রুট অপটিমাইজেশন আমার প্রতি ডেলিভারিতে ২ ঘন্টা বাঁচিয়েছে। এখন প্রতিদিন ৩ গুণ বেশি পরিবারকে সাহায্য করতে পারি।",
                avatar: "🚗",
                rating: 5,
                location: "সিলেট, বাংলাদেশ",
                verified: true
            },
            {
                id: 3,
                name: "ফাতেমা বেগম",
                role: "কমিউনিটি দাতা",
                message: "একজন ছোট ব্যবসায়ী হিসেবে এই প্ল্যাটফর্ম নিয়মিত দান করা সহজ করেছে। স্বচ্ছতা এবং প্রত্যক্ষ প্রভাব রিপোর্ট আমাকে প্রতিটি দানে আস্থা দেয়।",
                avatar: "👩‍💼",
                rating: 5,
                location: "চট্টগ্রাম, বাংলাদেশ",
                verified: true
            },
            {
                id: 4,
                name: "আব্দুল রহমান",
                role: "এনজিও পরিচালক",
                organization: "গ্রামীণ ফাউন্ডেশন",
                message: "দ্বিভাষিক AI সহায়ক আমাদের শহুরে এবং গ্রামীণ উভয় সম্প্রদায়কে কার্যকরভাবে সেবা দিতে সাহায্য করেছে। আমাদের বিতরণের সময় ৬০% কমেছে।",
                avatar: "👨‍💼",
                rating: 5,
                location: "রংপুর, বাংলাদেশ",
                verified: true
            },
            {
                id: 5,
                name: "নাসির আহমেদ",
                role: "দুর্যোগ সাড়া স্বেচ্ছাসেবক",
                message: "ঘূর্ণিঝড় আম্ফানের সময় এই প্ল্যাটফর্ম ৫০০+ স্বেচ্ছাসেবককে নির্বিঘ্নে সমন্বয় করেছে। দুর্বল নেটওয়ার্ক সংযোগেও মোবাইল-ফার্স্ট ডিজাইন নিখুঁতভাবে কাজ করেছে।",
                avatar: "🌪️",
                rating: 5,
                location: "খুলনা, বাংলাদেশ",
                verified: true
            }
        ]
    };

    const currentTestimonials = testimonials[language] || testimonials.en;

    // Auto-advance testimonials
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % currentTestimonials.length);
        }, 6000);

        return () => clearInterval(timer);
    }, [currentTestimonials.length]);

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

    const testimonialVariants = {
        hidden: { opacity: 0, x: 100 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.5 }
        },
        exit: {
            opacity: 0,
            x: -100,
            transition: { duration: 0.3 }
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
            scale: 1.02,
            y: -5,
            transition: { duration: 0.2 }
        }
    };

    return (
        <motion.section
            className="py-20"
            style={{
                padding: '5rem 0',
                backgroundColor: colors.bg.secondary
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
                        variants={testimonialVariants}
                    >
                        {language === 'bn' ? 'সফল গল্প ও প্রশংসাপত্র' : 'Success Stories & Testimonials'}
                    </motion.h2>
                    <motion.p
                        className="text-xl max-w-3xl mx-auto bangla-text"
                        style={{
                            fontSize: '1.25rem',
                            color: colors.text.secondary,
                            maxWidth: '48rem',
                            margin: '0 auto',
                            lineHeight: '1.6'
                        }}
                        variants={testimonialVariants}
                    >
                        {language === 'bn'
                            ? 'বাস্তব জীবনে প্রভাব এবং আমাদের প্ল্যাটফর্মের মাধ্যমে পরিবর্তিত জীবনের গল্প'
                            : 'Real-world impact and transformed lives through our platform'
                        }
                    </motion.p>

                    {/* Statistics */}
                    <motion.div
                        className="grid md:grid-cols-4 gap-8 mt-12"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '2rem',
                            marginTop: '3rem'
                        }}
                        variants={containerVariants}
                    >
                        {[
                            { number: '50,000+', label: language === 'bn' ? 'সাহায্যপ্রাপ্ত পরিবার' : 'Families Helped' },
                            { number: '2,000+', label: language === 'bn' ? 'সক্রিয় স্বেচ্ছাসেবক' : 'Active Volunteers' },
                            { number: '150+', label: language === 'bn' ? 'অংশীদার এনজিও' : 'Partner NGOs' },
                            { number: '99.2%', label: language === 'bn' ? 'সন্তুষ্ট ব্যবহারকারী' : 'User Satisfaction' }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                className="text-center"
                                variants={testimonialVariants}
                                whileHover={{ scale: 1.05 }}
                            >
                                <div
                                    className="text-3xl font-black mb-2"
                                    style={{
                                        fontSize: '2rem',
                                        fontWeight: '900',
                                        color: colors.green.primary,
                                        marginBottom: '0.5rem'
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
                    </motion.div>
                </motion.div>

                {/* Main Testimonial Slider */}
                <motion.div
                    className="relative"
                    style={{ position: 'relative' }}
                    variants={containerVariants}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentTestimonial}
                            className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-4xl mx-auto"
                            style={{
                                backgroundColor: colors.bg.primary,
                                borderRadius: '1rem',
                                boxShadow: colors.shadow,
                                padding: '3rem',
                                maxWidth: '56rem',
                                margin: '0 auto',
                                border: `2px solid ${colors.border.primary}`
                            }}
                            variants={testimonialVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <div
                                className="flex flex-col md:flex-row items-center md:items-start gap-8"
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}
                            >
                                {/* Avatar and Rating */}
                                <div className="flex-shrink-0 text-center">
                                    <div
                                        className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-4 shadow-lg"
                                        style={{
                                            width: '6rem',
                                            height: '6rem',
                                            backgroundColor: colors.green.bg,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2.5rem',
                                            marginBottom: '1rem',
                                            boxShadow: colors.shadow
                                        }}
                                    >
                                        {currentTestimonials[currentTestimonial].avatar}
                                    </div>

                                    {/* Star Rating */}
                                    <div className="flex justify-center mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <span
                                                key={i}
                                                className="text-xl"
                                                style={{
                                                    color: i < currentTestimonials[currentTestimonial].rating
                                                        ? '#fbbf24'
                                                        : colors.border.primary,
                                                    fontSize: '1.25rem'
                                                }}
                                            >
                                                ⭐
                                            </span>
                                        ))}
                                    </div>

                                    {/* Verified Badge */}
                                    {currentTestimonials[currentTestimonial].verified && (
                                        <div
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                            style={{
                                                backgroundColor: colors.green.bg,
                                                color: colors.green.primary,
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.875rem',
                                                fontWeight: '500'
                                            }}
                                        >
                                            ✓ {language === 'bn' ? 'যাচাইকৃত' : 'Verified'}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 text-center md:text-left">
                                    <blockquote
                                        className="text-xl md:text-2xl font-medium leading-relaxed mb-6 bangla-text"
                                        style={{
                                            fontSize: '1.5rem',
                                            fontWeight: '500',
                                            color: colors.text.primary,
                                            marginBottom: '1.5rem',
                                            lineHeight: '1.6',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        "{currentTestimonials[currentTestimonial].message}"
                                    </blockquote>

                                    <div>
                                        <div
                                            className="font-bold text-lg bangla-text mb-1"
                                            style={{
                                                fontWeight: '700',
                                                fontSize: '1.125rem',
                                                color: colors.text.primary,
                                                marginBottom: '0.25rem'
                                            }}
                                        >
                                            {currentTestimonials[currentTestimonial].name}
                                        </div>
                                        <div
                                            className="text-base font-medium mb-1"
                                            style={{
                                                fontSize: '1rem',
                                                fontWeight: '500',
                                                color: colors.green.primary,
                                                marginBottom: '0.25rem'
                                            }}
                                        >
                                            {currentTestimonials[currentTestimonial].role}
                                            {currentTestimonials[currentTestimonial].organization &&
                                                ` - ${currentTestimonials[currentTestimonial].organization}`
                                            }
                                        </div>
                                        <div
                                            className="text-sm"
                                            style={{
                                                fontSize: '0.875rem',
                                                color: colors.text.secondary
                                            }}
                                        >
                                            📍 {currentTestimonials[currentTestimonial].location}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Dots */}
                    <div
                        className="flex justify-center mt-8 space-x-2"
                        style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', gap: '0.5rem' }}
                    >
                        {currentTestimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentTestimonial(index)}
                                className="w-3 h-3 rounded-full transition-all duration-300"
                                style={{
                                    width: '0.75rem',
                                    height: '0.75rem',
                                    borderRadius: '50%',
                                    backgroundColor: index === currentTestimonial ? colors.green.primary : colors.border.primary,
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Secondary Testimonials Grid */}
                <motion.div
                    className="grid md:grid-cols-3 gap-6 mt-16"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1.5rem',
                        marginTop: '4rem'
                    }}
                    variants={containerVariants}
                >
                    {currentTestimonials.slice(0, 3).map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            className="bg-white rounded-xl shadow-lg p-6 border-2 border-transparent hover:border-green-200 transition-all duration-300"
                            style={{
                                backgroundColor: colors.bg.tertiary,
                                borderRadius: '0.75rem',
                                boxShadow: colors.shadow,
                                padding: '1.5rem',
                                border: `2px solid ${colors.border.primary}`,
                                transition: 'all 0.3s ease'
                            }}
                            variants={cardVariants}
                            whileHover="hover"
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                                    style={{
                                        width: '3rem',
                                        height: '3rem',
                                        backgroundColor: colors.green.bg,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        flexShrink: 0
                                    }}
                                >
                                    {testimonial.avatar}
                                </div>
                                <div className="flex-1">
                                    <p
                                        className="text-sm leading-relaxed mb-3 bangla-text"
                                        style={{
                                            fontSize: '0.875rem',
                                            color: colors.text.primary,
                                            marginBottom: '0.75rem',
                                            lineHeight: '1.5'
                                        }}
                                    >
                                        "{testimonial.message.substring(0, 120)}..."
                                    </p>
                                    <div
                                        className="font-semibold text-sm bangla-text"
                                        style={{
                                            fontWeight: '600',
                                            fontSize: '0.875rem',
                                            color: colors.text.primary
                                        }}
                                    >
                                        {testimonial.name}
                                    </div>
                                    <div
                                        className="text-xs font-medium"
                                        style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            color: colors.text.secondary
                                        }}
                                    >
                                        {testimonial.role}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </motion.section>
    );
};

export default Testimonials;