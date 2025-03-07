import React, { useEffect, useState, memo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { app, auth } from '@/config/firebaseConfig';
import Colors from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import useBackHandler from "@/constants/useBackHandler";

// Initialize Firestore
const db = getFirestore(app);

// Define TypeScript interface for Course data
interface Course {
  id: string;
  courseTitle: string;
  rating?: number;
  noOfChapter?: number;
  type?: string;
  category?: string;
}

// Categories including "popular"
const categories: string[] = ['popular', 'coding', 'development', 'database', 'new Tech'];

// Random rating list
const ratingList = [4.5, 4.7, 3.5, 4.3, 3.7];
const getRandomRating = () => ratingList[Math.floor(Math.random() * ratingList.length)];

export default function CourseList() {
  // useBackHandler();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch courses from Firestore
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const fetchedCourses: Course[] = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Course[];
        setCourses(fetchedCourses);
      } catch (error) {
        console.error('Error fetching courses: ', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Handle user tapping on a course
  const handleCoursePress = async (item: Course) => {
    const user = auth.currentUser;
    if (!user) return;

    const courseRef = doc(db, `users/${user.uid}/enrolledCourses`, item.courseTitle);
    const docSnap = await getDoc(courseRef);

    if (docSnap.exists()) {
        router.push({
          pathname: '../courseView/courseDetail', // Redirect to Course Detail Screen
          params: {
            courseParams: JSON.stringify(item),
          },
        });
      } else {
        // Otherwise, redirect to Course View screen
        router.push({
          pathname: '../courseView', // Redirect to Course View Screen
          params: {
            courseParams: JSON.stringify(item),
          },
        });
      }
  };

  // Memoized Course Card to prevent unnecessary re-renders
  const MemoizedCourseCard = memo(({ item }: { item: Course }) => {
    const courseTitle = item.courseTitle || 'No Title Available';
    const rating = item.rating || getRandomRating();
    const lectures = item.noOfChapter || 0;

    return (
      <TouchableOpacity style={styles.courseCard} onPress={() => handleCoursePress(item)}>
        <Image source={require('@/assets/images/java.png')} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{courseTitle}</Text>
          <View style={styles.row}>
            {renderStars(rating)}
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
          <View style={[styles.row, { marginBottom: 5 }]}>
            <Ionicons name="book-outline" size={16} color="#666" style={{ marginRight: 3 }} />
            <Text style={styles.subInfo}>{lectures} Chapters</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  });

  // Memoized render function for FlatList
  const renderCourseItem = useCallback(({ item }: { item: Course }) => <MemoizedCourseCard item={item} />, []);

  // Function to render star icons
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={`star-${i}`} name="star" size={16} color="#FFD700" />);
    }
    if (halfStar) {
      stars.push(<Ionicons key="star-half" name="star-half" size={16} color="#FFD700" />);
    }
    return stars;
  };

  // Filter courses by category
  const getCoursesByCategory = (cat: string) => {
    if (cat === 'popular') {
      return courses.filter((course) => course.type === 'popular');
    }
    return courses.filter((course) => course.category === cat);
  };

  // Render each course section
  const renderCourseSection = (cat: string) => {
    const catCourses = getCoursesByCategory(cat);
    if (catCourses.length === 0) return null;

    const isPopular = cat === 'popular';
    const title = isPopular ? 'Must Try Courses' : `${cat.charAt(0).toUpperCase() + cat.slice(1)} Courses`;

    return (
      <View key={cat} style={styles.sectionContainer}>
        <Text style={styles.header}>{title}</Text>
        <FlatList
          data={catCourses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView  style={styles.container} showsVerticalScrollIndicator={false}>
      {categories.map((cat) => renderCourseSection(cat))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"rgba(255, 255, 255, 0)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    marginVertical: 10,
  },
  header: {
    fontSize: 24,
    fontFamily: 'outfit-bold',
    marginTop: 10,
    marginLeft: 10,
  },
  courseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    margin: 10,
    marginLeft: 20,
    width: 300,
    
  },
  cardImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'outfit-bold',
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 5,
    color: '#666',
    fontFamily: 'outfit',
  },
  subInfo: {
    fontSize: 16,
    color: '#666',
    marginRight: 15,
    fontFamily: 'outfit',
  },
});
