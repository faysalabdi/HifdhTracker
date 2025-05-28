import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from 'src/store/AuthContext';
import { ActivityIndicator, View, Text } from 'react-native';
import { Icon } from '@rneui/themed';

// Auth Screens
import LoginScreen from 'src/screens/LoginScreen';
import RegisterScreen from 'src/screens/RegisterScreen';

// Teacher Screens
import TeacherDashboardScreen from 'src/screens/teacher/TeacherDashboardScreen';
import CreateLessonScreen from 'src/screens/teacher/CreateLessonScreen';
import TeacherLessonDetailScreen from 'src/screens/teacher/LessonDetailScreen';
import MyStudentsScreen from 'src/screens/teacher/MyStudentsScreen';
import StudentDetailScreen from 'src/screens/teacher/StudentDetailScreen';
import AllStudentsScreen from 'src/screens/teacher/AllStudentsScreen';
import TeacherProfileScreen from 'src/screens/teacher/ProfileScreen';
import TeacherLessonHistoryScreen from 'src/screens/teacher/LessonHistoryScreen';

// Student Screens
import StudentDashboardScreen from 'src/screens/student/StudentDashboardScreen';
import StudentLessonDetailScreen from 'src/screens/student/LessonDetailScreen';
import StudentProfileScreen from 'src/screens/student/ProfileScreen';
import MistakeHistoryScreen from 'src/screens/student/MistakeHistoryScreen';
import UpdateProgressScreen from 'src/screens/student/UpdateProgressScreen';
import StudentLessonHistoryScreen from 'src/screens/student/LessonHistoryScreen';
import SessionHistoryScreen from 'src/screens/student/SessionHistoryScreen';

// Shared Screens
import CreateSessionScreen from 'src/screens/shared/CreateSessionScreen';
import SessionDetailScreen from 'src/screens/shared/SessionDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#f5f5f5' }
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Teacher Tab Navigator
const TeacherTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2e7d32',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#eee',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen 
        name="TeacherHome" 
        component={TeacherDashboardScreen} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" type="material" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Students" 
        component={MyStudentsScreen} 
        options={{
          tabBarLabel: 'Students',
          tabBarIcon: ({ color, size }) => (
            <Icon name="people" type="material" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Lessons" 
        component={TeacherLessonHistoryScreen} 
        options={{
          tabBarLabel: 'Lessons',
          tabBarIcon: ({ color, size }) => (
            <Icon name="book" type="material" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="TeacherProfile" 
        component={TeacherProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" type="material" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Student Tab Navigator
const StudentTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2e7d32',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#eee',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen 
        name="StudentHome" 
        component={StudentDashboardScreen} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" type="material" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Sessions" 
        component={SessionHistoryScreen} 
        options={{
          tabBarLabel: 'Revisions',
          tabBarIcon: ({ color, size }) => (
            <Icon name="sync" type="material" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Mistakes" 
        component={MistakeHistoryScreen} 
        options={{
          tabBarLabel: 'Mistakes',
          tabBarIcon: ({ color, size }) => (
            <Icon name="error-outline" type="material" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="StudentProfile" 
        component={StudentProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" type="material" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Teacher Stack Navigator
const TeacherStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f5f5f5' }
      }}
    >
      <Stack.Screen name="TeacherTabs" component={TeacherTabNavigator} />
      <Stack.Screen name="CreateLesson" component={CreateLessonScreen} />
      <Stack.Screen name="LessonDetail" component={TeacherLessonDetailScreen} />
      <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
      <Stack.Screen name="AllStudents" component={AllStudentsScreen} />
      <Stack.Screen name="CreateSession" component={CreateSessionScreen} />
      <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
    </Stack.Navigator>
  );
};

// Student Stack Navigator
const StudentStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f5f5f5' }
      }}
    >
      <Stack.Screen name="StudentTabs" component={StudentTabNavigator} />
      <Stack.Screen name="LessonDetail" component={StudentLessonDetailScreen} />
      <Stack.Screen name="CreateSession" component={CreateSessionScreen} />
      <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
      <Stack.Screen name="UpdateProgress" component={UpdateProgressScreen} />
      <Stack.Screen name="LessonHistory" component={StudentLessonHistoryScreen} />
      <Stack.Screen name="MyProfile" component={StudentProfileScreen} />
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user?.role === 'teacher' ? (
        <TeacherStackNavigator />
      ) : (
        <StudentStackNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator; 