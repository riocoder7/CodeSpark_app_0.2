import React, { useEffect, useRef } from 'react';
import { Animated, ImageProps, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper'; // ✅ Remove incorrect OnboardingRef import
import { useRouter } from 'expo-router';
import useBackHandler from "@/constants/useBackHandler";

// Custom Animated Image Component
const AnimatedImage: React.FC<ImageProps> = (props) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(50)).current;

  useBackHandler();
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.Image
      {...props}
      style={[props.style, { opacity, transform: [{ translateX }] }]}
    />
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const onboardingRef = useRef<Onboarding | null>(null); // ✅ Use correct ref type

  return (
    <Onboarding
      ref={onboardingRef} // ✅ Assign ref to Onboarding
      onSkip={() => router.replace('../auth/singUp')}
      onDone={() => router.replace('../auth/singUp')}
      containerStyles={styles.container}
      bottomBarHighlight={false}
      pages={[
        {
          backgroundColor: '#abebc6',
          image: (
            <AnimatedImage
              source={require("@/assets/images/OnBording/Progress.png")}
              style={styles.image}
            />
          ),
          title: 'Progress Tracking',
          subtitle:
            'Monitor your course progress in real-time, track milestones, and stay motivated.',
        },
        {
          backgroundColor: '#aed6f1',
          image: (
            <AnimatedImage
              source={require("@/assets/images/OnBording/complier.png")}
              style={styles.image}
            />
          ),
          title: 'Online Compiler',
          subtitle:
            'Write, run, and debug your code seamlessly with our integrated compiler.',
        },
        {
          backgroundColor: '#d0e0f0',
          image: (
            <AnimatedImage
              source={require("@/assets/images/OnBording/chatbot.png")}
              style={styles.image}
            />
          ),
          title: 'AI Chatbot Support',
          subtitle:
            'Get instant help and expert guidance with our AI-powered chatbot.',
        },
        {
          backgroundColor: '#e9bcbe',
          image: (
            <AnimatedImage
              source={require("@/assets/images/OnBording/Quiz.png")}
              style={styles.image}
            />
          ),
          title: 'Interactive Quiz',
          subtitle:
            'Test your knowledge with engaging quizzes that reinforce your learning.',
        },
      ]}
      showSkip
      showNext
      DoneButtonComponent={() => <CustomButton text="Get Started" onPress={() => router.replace('../auth/singUp')} />}
      NextButtonComponent={() => (
        <CustomButton text="Next" onPress={() => onboardingRef.current?.goNext?.()} />
      )} 
      SkipButtonComponent={() => <CustomButton text="Skip" onPress={() => router.replace('../auth/singUp')} />}
      titleStyles={styles.title}
      subTitleStyles={styles.subtitle}
    />
  );
}

// Custom Button Component with Navigation
const CustomButton = ({ text, onPress }: { text: string; onPress?: () => void }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: '#6A5AE0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: 4,
    alignItems: 'center',
    margin:5,
    },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'outfit-bold',
  },
  title: {
    fontFamily: 'outfit-bold',
    fontSize: 22,
  },
  subtitle: {
    fontFamily: 'outfit',
    fontSize: 16,
  },
});
