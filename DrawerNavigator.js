import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import HomeScreen from './src/pages/HomeScreen';
import GradesScreen from './src/pages/grades/GradesScreen';
import DailySchedule from './src/pages/schedule/DailySchedule';
import CoursesScreen from './src/pages/courses/CoursesScreen';
import CourseEnvironment from './src/pages/courses/CourseEnvironment'
import Tasks from './src/pages/tasks/Tasks';
import { StyleSheet } from 'react-native';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => (
  <DrawerContentScrollView {...props}>
    <DrawerItem label="דף הבית" labelStyle={styles.drawerItem} onPress={() => props.navigation.navigate('Home')} />
    <DrawerItem label="ציונים" labelStyle={styles.drawerItem} onPress={() => props.navigation.navigate('Grades')} />
    <DrawerItem label="מערכת שעות יומית" labelStyle={styles.drawerItem} onPress={() => props.navigation.navigate('DailySchedule')} />
    <DrawerItem label="קורסים" labelStyle={styles.drawerItem} onPress={() => props.navigation.navigate('Courses')} />
    <DrawerItem label="מטלות" labelStyle={styles.drawerItem} onPress={() => props.navigation.navigate('Tasks')} />
  </DrawerContentScrollView>
);

const DrawerNavigator = () => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerPosition: 'right',
    }}
  >
    <Drawer.Screen name="Home" component={HomeScreen} />
    <Drawer.Screen name="Grades" component={GradesScreen} />
    <Drawer.Screen name="DailySchedule" component={DailySchedule} />
    <Drawer.Screen name="Courses" component={CoursesScreen} />
    <Drawer.Screen name="CourseEnvironment" component={CourseEnvironment} />
    <Drawer.Screen name="Tasks" component={Tasks} />
  </Drawer.Navigator>
);

const styles = StyleSheet.create({
  drawerItem: {
    fontFamily: 'Rubik',
    fontSize: 16,
  },
});

export default DrawerNavigator;
