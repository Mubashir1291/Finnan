import React, { useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Dimensions,
    ImageBackground,
    StatusBar,
} from 'react-native';
import { S, VS, MS } from '../../utils/Responsive';
import { HeadingColor, PrimaryColor, SecondaryColor } from '../../utils/Colors';
import { useDispatch } from 'react-redux';
import { setIsOnboardingCompleted } from '../../redux/Reducers/userReducer';

const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: '0',
        titleParts: [
            { text: 'Welcome to Finnan\n', bold: false },
            { text: 'Football Finance Intelligence', bold: true },
        ],
        description:
            'Your autonomous football finance advisor designed to help players and professionals manage wealth, optimize contracts, and plan long-term financial success.',
    },
    {
        id: '1',
        titleParts: [
            { text: 'Smarter Planning,\n', bold: false },
            { text: 'Stronger Wealth', bold: true },
        ],
        description:
            'Model your career income, track spending, and simulate financial outcomes with intelligent planning built for football professionals.',
    },
    {
        id: '2',
        titleParts: [
            { text: 'Tax-Aware\n', bold: false },
            { text: 'Global Strategy', bold: true },
        ],
        description:
            'Explore transfers, residency, and jurisdiction scenarios with tax-aware insights that help protect and grow your wealth worldwide.',
    },
];


const BACKGROUND_IMAGE =
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80';

const OnboardingScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const flatListRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);

    const viewabilityConfig = useRef({
        viewAreaCoveragePercentThreshold: 50,
    }).current;

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            dispatch(setIsOnboardingCompleted(true));
        }
    };

    const handleSkip = () => {
        dispatch(setIsOnboardingCompleted(true));
    };

    const renderTextSlide = ({ item }) => (
        <View style={styles.textSlide}>
            {/* Title */}
            <Text style={styles.title}>
                {item.titleParts.map((part, i) => (
                    <Text
                        key={i}
                        style={
                            part.bold
                                ? [styles.titleBold, { color: SecondaryColor }]
                                : styles.titleRegular
                        }>
                        {part.text}
                    </Text>
                ))}
            </Text>

            {/* Description */}
            <Text style={styles.description}>{item.description}</Text>
        </View>
    );

    return (
        <ImageBackground
            source={{ uri: BACKGROUND_IMAGE }}
            style={styles.container}
            resizeMode="cover">
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="light-content"
            />

            {/* Dark overlay */}
            <View style={styles.overlay} />

            {/* Skip button */}
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Bottom content */}
            <View style={styles.bottomContent}>
                {/* Swipeable text slides - full screen width swipe area */}
                <FlatList
                    ref={flatListRef}
                    data={slides}
                    renderItem={renderTextSlide}
                    keyExtractor={item => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    contentContainerStyle={styles.flatListContent}
                    style={styles.flatList}
                />

                {/* Next / Get Started button */}
                <View style={styles.buttonArea}>
                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={handleNext}>
                        <Text style={styles.nextButtonText}>
                            {currentIndex === slides.length - 1
                                ? 'Get Started'
                                : 'Next'}
                        </Text>
                    </TouchableOpacity>

                    {/* Pagination dots */}
                    <View style={styles.pagination}>
                        {slides.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    i === currentIndex
                                        ? styles.dotActive
                                        : styles.dotInactive,
                                ]}
                            />
                        ))}
                    </View>
                </View>
            </View>
        </ImageBackground>
    );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'flex-end',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    skipButton: {
        position: 'absolute',
        top: VS(50),
        right: S(20),
        zIndex: 10,
        paddingHorizontal: S(16),
        paddingVertical: VS(8),
    },
    skipText: {
        color: '#fff',
        fontSize: MS(14),
        fontFamily: 'Helvetica',
        opacity: 0.8,
    },
    bottomContent: {
        zIndex: 5,
        paddingBottom: VS(40),
    },
    flatList: {
        flexGrow: 0,
    },
    flatListContent: {},
    textSlide: {
        width: width,
        paddingHorizontal: S(24),
    },
    buttonArea: {
        paddingHorizontal: S(24),
    },
    title: {
        marginBottom: VS(12),
    },
    titleRegular: {
        color: HeadingColor,
        fontSize: MS(24),
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        textAlign: 'center',


    },
    titleBold: {
        fontSize: MS(24),
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        textAlign: 'center',

    },
    description: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: MS(14),
        fontFamily: 'Helvetica',
        lineHeight: MS(20),
        marginBottom: VS(24),
        textAlign: 'center',
    },
    nextButton: {
        backgroundColor: HeadingColor,
        paddingVertical: VS(10),
        borderRadius: MS(30),
        alignItems: 'center',
        marginBottom: VS(20),
    },
    nextButtonText: {
        color: '#000',
        fontSize: MS(16),
        fontFamily: 'Helvetica-Bold',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        borderRadius: MS(4),
        marginHorizontal: S(4),
    },
    dotActive: {
        width: S(24),
        height: VS(8),
        backgroundColor: HeadingColor,
        borderRadius: MS(4),
    },
    dotInactive: {
        width: S(8),
        height: VS(8),
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: MS(4),
    },
});
