import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  OTPVerification: { email: string };
  FaceRegistration: { fromOnboarding?: boolean };
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  EventsTab: NavigatorScreenParams<EventsStackParamList>;
  SearchTab: NavigatorScreenParams<SearchStackParamList>;
  PhotosTab: NavigatorScreenParams<PhotosStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  Notifications: undefined;
};

export type EventsStackParamList = {
  EventsList: undefined;
  CreateEvent: undefined;
  JoinEvent: undefined;
  EventDetails: { eventId: string; eventName: string };
  SearchProcessing: { eventId: string; eventName: string };
  SearchResults: { eventId: string; eventName: string };
  UploadPhotos: { eventId: string; eventName: string };
  EventMembers: { eventId: string; eventName: string };
  PhotoViewer: { photos: import('./index').Photo[]; initialIndex: number };
};

export type SearchStackParamList = {
  SearchHub: undefined;
  SearchProcessing: { eventId: string; eventName: string };
  SearchResults: { eventId: string; eventName: string };
};

export type PhotosStackParamList = {
  MyPhotos: undefined;
  Favorites: undefined;
  PhotoViewer: { photos: import('./index').Photo[]; initialIndex: number };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  FaceRegistration: { fromSettings?: boolean };
};
