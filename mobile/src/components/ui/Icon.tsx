import React from 'react';
import {
  Home, Calendar, Search, Image, User, Bell, ChevronRight,
  ChevronLeft, ChevronDown, ArrowLeft, ArrowRight, X, Check,
  Camera, Upload, Scan, Zap, Star, Heart, Share2, Download,
  Edit2, Settings, LogOut, Shield, Lock, Mail, Eye, EyeOff,
  MapPin, Clock, Users, Grid, List, Filter, Plus,
  RefreshCw, AlertCircle, CheckCircle, XCircle, Info,
  Sparkles, Cpu, ImagePlus, ScanFace, Loader, Play,
  MoreHorizontal, Copy, Trash2, Bookmark, Send,
  TrendingUp, Award, BarChart2, Activity, Tag,
  ChevronUp, Minus, Equal, Globe, Phone, AtSign,
  SearchX, UserPen, ShieldCheck,
} from 'lucide-react-native';

const IconMap = {
  Home, Calendar, Search, Image, User, Bell, ChevronRight,
  ChevronLeft, ChevronDown, ArrowLeft, ArrowRight, X, Check,
  Camera, Upload, Scan, Zap, Star, Heart, Share2, Download,
  Edit2, Settings, LogOut, Shield, Lock, Mail, Eye, EyeOff,
  MapPin, Clock, Users, Grid, List, Filter, Plus,
  RefreshCw, AlertCircle, CheckCircle, XCircle, Info,
  Sparkles, Cpu, ImagePlus, ScanFace, Loader, Play,
  MoreHorizontal, Copy, Trash2, Bookmark, Send,
  TrendingUp, Award, BarChart2, Activity, Tag,
  ChevronUp, Minus, Equal, Globe, Phone, AtSign,
  SearchX, UserPen, ShieldCheck,
} as const;

export type IconName = keyof typeof IconMap;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 24, color = '#09090B', strokeWidth = 1.75 }: IconProps) {
  const IconComponent = IconMap[name];
  if (!IconComponent) return null;
  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
    />
  );
}
