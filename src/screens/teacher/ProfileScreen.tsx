import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { useAuth } from '../../store/AuthContext';
import { Icon } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTeacherStudents } from '../../api/supabaseService';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, isLoading } = useAuth();
  const [studentCount, setStudentCount] = useState(0);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchStudentCount();
    }
  }, [user]);
  
  const fetchStudentCount = async () => {
    try {
      setLoadingStudents(true);
      const students = await getTeacherStudents(user.id);
      setStudentCount(students.length);
    } catch (error) {
      console.error('Error fetching student count:', error);
    } finally {
      setLoadingStudents(false);
    }
  };
  
  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Icon 
            name="person-circle-outline" 
            type="ionicon" 
            size={100} 
            color="#2e7d32" 
          />
          <Text style={styles.name}>{user?.name || 'Teacher'}</Text>
          <Text style={styles.email}>{user?.username || ''}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Teacher</Text>
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Icon 
                name="people" 
                type="material" 
                size={28} 
                color="#2e7d32" 
              />
              <Text style={styles.statCount}>
                {loadingStudents ? '...' : studentCount}
              </Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            
            <View style={styles.statCard}>
              <Icon 
                name="book" 
                type="material" 
                size={28} 
                color="#2e7d32" 
              />
              <Text style={styles.statCount}>-</Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </View>
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('AllStudents')}
            >
              <Icon 
                name="group-add" 
                type="material" 
                size={24} 
                color="#2e7d32" 
              />
              <Text style={styles.actionText}>Add Students</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('CreateLesson')}
            >
              <Icon 
                name="add-task" 
                type="material" 
                size={24} 
                color="#2e7d32" 
              />
              <Text style={styles.actionText}>Create Lesson</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Icon name="logout" type="material" color="#fff" size={20} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  roleBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  roleText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  button: {
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#c62828',
    marginTop: 20,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default ProfileScreen; 