import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  MainTabParamList, HomeStackParamList, EventsStackParamList,
  SearchStackParamList, PhotosStackParamList, ProfileStackParamList,
} from '../types/navigation';

import { Icon, IconName } from '../components/ui/Icon';
import { Text } from '../components/ui/Text';
import { ms } from '../utils/responsive';

// Screens
import { DashboardScreen }        from '../screens/main/DashboardScreen';
import { NotificationsScreen }    from '../screens/main/NotificationsScreen';
import { EventsListScreen }       from '../screens/main/EventsListScreen';
import { EventDetailsScreen }     from '../screens/main/EventDetailsScreen';
import { CreateEventScreen }      from '../screens/main/CreateEventScreen';
import { JoinEventScreen }        from '../screens/main/JoinEventScreen';
import { UploadPhotosScreen }     from '../screens/main/UploadPhotosScreen';
import { SearchProcessingScreen } from '../screens/main/SearchProcessingScreen';
import { SearchResultsScreen }    from '../screens/main/SearchResultsScreen';
import { SearchHubScreen }        from '../screens/main/SearchHubScreen';
import { MyPhotosScreen }         from '../screens/main/MyPhotosScreen';
import { FavoritesScreen }        from '../screens/main/FavoritesScreen';
import { PhotoViewerScreen }      from '../screens/main/PhotoViewerScreen';
import { ProfileScreen }          from '../screens/main/ProfileScreen';
import { EditProfileScreen }      from '../screens/main/EditProfileScreen';
import { FaceRegistrationScreen } from '../screens/auth/FaceRegistrationScreen';

const Tab    = createBottomTabNavigator<MainTabParamList>();
const HomeStack    = createNativeStackNavigator<HomeStackParamList>();
const EventsStack  = createNativeStackNavigator<EventsStackParamList>();
const SearchStack  = createNativeStackNavigator<SearchStackParamList>();
const PhotosStack  = createNativeStackNavigator<PhotosStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Dashboard"     component={DashboardScreen} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    </HomeStack.Navigator>
  );
}

function EventsNavigator() {
  return (
    <EventsStack.Navigator screenOptions={{ headerShown: false }}>
      <EventsStack.Screen name="EventsList"       component={EventsListScreen} />
      <EventsStack.Screen name="CreateEvent"      component={CreateEventScreen} />
      <EventsStack.Screen name="JoinEvent"        component={JoinEventScreen} />
      <EventsStack.Screen name="EventDetails"     component={EventDetailsScreen} />
      <EventsStack.Screen name="UploadPhotos"     component={UploadPhotosScreen} />
      <EventsStack.Screen name="SearchProcessing" component={SearchProcessingScreen} />
      <EventsStack.Screen name="SearchResults"    component={SearchResultsScreen} />
      <EventsStack.Screen name="PhotoViewer"      component={PhotoViewerScreen} />
    </EventsStack.Navigator>
  );
}

function SearchNavigator() {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="SearchHub"        component={SearchHubScreen} />
      <SearchStack.Screen name="SearchProcessing" component={SearchProcessingScreen} />
      <SearchStack.Screen name="SearchResults"    component={SearchResultsScreen} />
    </SearchStack.Navigator>
  );
}

function PhotosNavigator() {
  return (
    <PhotosStack.Navigator screenOptions={{ headerShown: false }}>
      <PhotosStack.Screen name="MyPhotos"    component={MyPhotosScreen} />
      <PhotosStack.Screen name="Favorites"   component={FavoritesScreen} />
      <PhotosStack.Screen name="PhotoViewer" component={PhotoViewerScreen} />
    </PhotosStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile"          component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile"      component={EditProfileScreen} />
      <ProfileStack.Screen name="FaceRegistration" component={FaceRegistrationScreen} />
    </ProfileStack.Navigator>
  );
}

const TAB_ITEMS: { name: keyof MainTabParamList; label: string; icon: IconName }[] = [
  { name: 'HomeTab',    label: 'Home',    icon: 'Home' },
  { name: 'EventsTab',  label: 'Events',  icon: 'Calendar' },
  { name: 'SearchTab',  label: 'Search',  icon: 'Search' },
  { name: 'PhotosTab',  label: 'Photos',  icon: 'Image' },
  { name: 'ProfileTab', label: 'Profile', icon: 'User' },
];

export function MainNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <View
          style={[
            styles.tabBar,
            { paddingBottom: insets.bottom + 4 },
          ]}
        >
          {TAB_ITEMS.map((item, index) => {
            const focused = state.index === index;
            return (
              <View key={item.name} style={styles.tabItem}>
                <View
                  style={[
                    styles.tabBtn,
                    focused && styles.tabBtnActive,
                  ]}
                >
                  <Icon
                    name={item.icon}
                    size={ms(22)}
                    color={focused ? '#6366F1' : '#A1A1AA'}
                    strokeWidth={focused ? 2.2 : 1.7}
                  />
                </View>
                <Text
                  style={{
                    fontSize: ms(10),
                    fontWeight: focused ? '600' : '400',
                    color: focused ? '#6366F1' : '#A1A1AA',
                    includeFontPadding: false,
                    marginTop: 3,
                  }}
                >
                  {item.label}
                </Text>
                {/* Press handler */}
                <View
                  style={StyleSheet.absoluteFill}
                  onTouchEnd={() => {
                    if (!focused) {
                      navigation.navigate(item.name as string);
                    }
                  }}
                />
              </View>
            );
          })}
        </View>
      )}
    >
      <Tab.Screen name="HomeTab"    component={HomeNavigator} />
      <Tab.Screen name="EventsTab"  component={EventsNavigator} />
      <Tab.Screen name="SearchTab"  component={SearchNavigator} />
      <Tab.Screen name="PhotosTab"  component={PhotosNavigator} />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  tabBtn: {
    width: ms(40),
    height: ms(32),
    borderRadius: ms(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(99,102,241,0.10)',
  },
});
