/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ScrollView, 
  SafeAreaView, 
  useColorScheme, 
  Dimensions, 
  Linking, 
  Image,
  Appearance, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pedometer } from 'expo-sensors';
import * as ImagePicker from 'expo-image-picker';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Mocks for Haptics
const Haptics = {
  impactAsync: async (style) => {},
  notificationAsync: async (type) => {},
  ImpactFeedbackStyle: { Medium: 1, Light: 0 },
  NotificationFeedbackType: { Success: 0, Warning: 1 }
};

// ============================================
// DATA: MOTIVATION, DIETS & WORKOUTS
// ============================================
const motivationalQuotes = [
  "Mos u ndal sot, trupi yt do të të falënderojë nesër! 🚀",
  "Uji është energji, mos harro të pish gotën e radhës! 💧",
  "Hapat e vegjël dërgojnë në rezultate të mëdha. 🏔️",
  "Disciplina rreh talentin çdo herë. Vazhdo! 🔥",
  "Ti je vetëm një stërvitje larg humorit të mirë. 🌟"
];

const dietLibrary = [
  { id: '1', name: "Keto (High Fat)", desc: "Më pak karbohidrate, shumë yndyrna.", meals: ["🥑 Vezë & Avokado", "🥩 Mish Lope (Steak)", "🥗 Sallatë Salmoni", "🥜 Arra dhe Bajame"] },
  { id: '2', name: "Vegan Pro", desc: "Ndërtim muskujsh me bazë bimore.", meals: ["🫘 Thjerrëza me Kerri", "🥣 Quinoa & Perime", "🥤 Protein Shake (Bimor)", "🥦 Brokoli i pjekur"] },
  { id: '3', name: "Mediterranean", desc: "Dietë e balancuar për zemrën.", meals: ["🫒 Sallatë Greke", "🐟 Peshk i Pjekur", "🍇 Fruta & Arra", "🥖 Bukë integrale"] },
  { id: '4', name: "Paleo", desc: "Ushqim si në 'epokën e gurit'.", meals: ["🍖 Mish Pule i Pjekur", "🍠 Patate të ëmbla", "🍓 Fruta Mali", "🥚 Vezë të ziera"] }
];

const workoutSplit = [
  {
    id: '1', day: "Biceps & Kraharor", icon: "💪",
    exercises: [
      { name: "Pushups (Gjoks)", kcal: 150, vid: "https://www.youtube.com/results?search_query=proper+pushup+form" },
      { name: "Bicep Curls", kcal: 120, vid: "https://www.youtube.com/results?search_query=bicep+curls+form" }
    ]
  },
  {
    id: '2', day: "Shpina (Back)", icon: "🧗",
    exercises: [
      { name: "Pull-ups", kcal: 200, vid: "https://www.youtube.com/results?search_query=pull+up+form" },
      { name: "Dumbbell Rows", kcal: 180, vid: "https://www.youtube.com/results?search_query=dumbbell+rows+form" }
    ]
  },
  {
    id: '3', day: "Bark (Abs)", icon: "🍫",
    exercises: [
      { name: "Plank (60s)", kcal: 80, vid: "https://www.youtube.com/results?search_query=perfect+plank+form" },
      { name: "Crunches", kcal: 100, vid: "https://www.youtube.com/results?search_query=how+to+do+crunches" }
    ]
  },
  {
    id: '4', day: "Këmbët (Legs)", icon: "🦵",
    exercises: [
      { name: "Squats", kcal: 250, vid: "https://www.youtube.com/results?search_query=proper+squat+form" },
      { name: "Lunges", kcal: 180, vid: "https://www.youtube.com/results?search_query=how+to+do+lunges" }
    ]
  }
];

const ProgressBar = ({ progress, color, size = 120, thickness = 10 }) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ 
        width: size, 
        height: size, 
        borderRadius: size / 2, 
        borderWidth: thickness, 
        borderColor: '#e0e0e0',
        position: 'absolute'
      }} />
      <View style={{ 
        width: size, 
        height: size, 
        borderRadius: size / 2, 
        borderWidth: thickness, 
        borderColor: color,
        borderTopColor: 'transparent',
        borderLeftColor: 'transparent',
        transform: [{ rotate: `${(progress * 360) - 45}deg` }],
        position: 'absolute'
      }} />
      <View style={{ position: 'absolute' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#6200ee' }}>{Math.round(progress * 100)}%</Text>
      </View>
    </View>
  );
};

// ============================================
// SCREEN: AUTH (SIGN IN / SIGN UP)
// ============================================
function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = () => {
    if (!email || !password) {
      Alert.alert("Gabim", "Ju lutem plotësoni të gjitha fushat.");
      return;
    }
    const user = { email };
    AsyncStorage.setItem('user', JSON.stringify(user));
    onLogin(user);
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <View style={styles.authCard}>
        <Text style={styles.authEmoji}>🔥</Text>
        <Text style={styles.authTitle}>FitLife Pro</Text>
        <Text style={styles.authSub}>{isLogin ? "Mirësevini përsëri!" : "Krijoni llogarinë tuaj"}</Text>
        
        <TextInput 
          style={styles.authInput} 
          placeholder="Email" 
          value={email} 
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput 
          style={styles.authInput} 
          placeholder="Fjalëkalimi" 
          secureTextEntry 
          value={password} 
          onChangeText={setPassword}
        />
        
        <TouchableOpacity style={styles.authBtn} onPress={handleAuth}>
          <Text style={styles.authBtnText}>{isLogin ? "Hyni" : "Regjistrohuni"}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{marginTop: 20}}>
          <Text style={styles.authToggleText}>
            {isLogin ? "Nuk keni llogari? Regjistrohuni" : "Keni llogari? Hyni këtu"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============================================
// SCREEN 1: DASHBOARD - ME SLIDER DHE RESET HAPA
// ============================================
function HomeScreen() {
  const isDark = useColorScheme() === 'dark';
  const [steps, setSteps] = useState(0);
  const [water, setWater] = useState(0);
  const [quote, setQuote] = useState("");
  const [streak, setStreak] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [pedometerAvailable, setPedometerAvailable] = useState(false);
  
  const slides = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
      title: 'Stërvitu çdo ditë',
      description: 'Çdo hap të çon më pranë qëllimit'
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
      title: 'Qëndro i hidratuar',
      description: 'Uji është burimi i jetës'
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400',
      title: 'Ushqim i shëndetshëm',
      description: 'Ti je ajo që ha'
    },
    {
      id: '4',
      image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400',
      title: 'Pushimi është fitim',
      description: 'Rikupero për rezultate më të mira'
    }
  ];

  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    AsyncStorage.getItem('water').then(v => v && setWater(parseInt(v)));
    AsyncStorage.getItem('streak').then(v => v && setStreak(parseInt(v)));
    
    setSteps(0);
    
    const setupPedometer = async () => {
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        setPedometerAvailable(isAvailable);
      } catch (error) {
        console.log("Pedometer error:", error);
      }
    };
    
    setupPedometer();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const addWater = () => {
    const newWater = water + 250;
    setWater(newWater);
    AsyncStorage.setItem('water', newWater.toString());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const resetWater = () => {
    Alert.alert("Reset?", "Ktheje ujin në 0ml?", [
      { text: "Jo" },
      { text: "Po", onPress: () => { 
        setWater(0); 
        AsyncStorage.setItem('water', '0'); 
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); 
      } }
    ]);
  };

  const addSteps = () => {
    Alert.alert(
      "Shto Hapa",
      "Sa hapa dëshiron të shtosh?",
      [
        { text: "Anulo", style: "cancel" },
        {
          text: "1000",
          onPress: () => {
            const newSteps = steps + 1000;
            setSteps(newSteps);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        },
        {
          text: "5000",
          onPress: () => {
            const newSteps = steps + 5000;
            setSteps(newSteps);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }
      ]
    );
  };

  const resetSteps = () => {
    Alert.alert(
      "Reset Hapa",
      "A je i sigurt që dëshiron t'i kthesh hapat në 0?",
      [
        { text: "Anulo", style: "cancel" },
        { 
          text: "Po, Reset", 
          onPress: () => {
            setSteps(0);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleSlideChange = (event) => {
    const slideWidth = SCREEN_WIDTH - 40;
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideWidth);
    setActiveSlide(index);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkBg]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        <View style={styles.sliderContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleSlideChange}
            scrollEventThrottle={16}
            decelerationRate="fast"
          >
            {slides.map((slide) => (
              <View key={slide.id} style={[styles.slide, { width: SCREEN_WIDTH - 40 }]}>
                <Image 
                  source={{ uri: slide.image }} 
                  style={styles.slideImage}
                  resizeMode="cover"
                />
                <View style={styles.slideOverlay}>
                  <Text style={styles.slideTitle}>{slide.title}</Text>
                  <Text style={styles.slideDescription}>{slide.description}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.paginationContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeSlide && styles.paginationDotActive,
                  isDark && { backgroundColor: index === activeSlide ? '#6200ee' : '#666' }
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.streakRow}>
          <Text style={styles.streakText}>🔥 {streak} Ditë Rresht (Streak)</Text>
        </View>
        
        <View style={[styles.ringCard, isDark && {backgroundColor: '#1e1e1e'}]}>
          <ProgressBar progress={steps / 10000} color="#6200ee" />
          <View style={{marginLeft: 20, flex: 1}}>
            <Text style={[styles.statLabel, isDark && {color: '#aaa'}]}>Hapa Sot</Text>
            <Text style={[styles.statValue, isDark && {color: 'white'}]}>{steps}</Text>
            <Text style={styles.kcalSub}>🔥 {(steps * 0.045).toFixed(1)} kcal</Text>
            
            <View style={{flexDirection: 'row', marginTop: 10}}>
              <TouchableOpacity style={styles.resetBtnSmall} onPress={resetSteps}>
                <Text>🔄</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stepsSmallBtn} onPress={addSteps}>
                <Text style={{color: '#4caf50', fontWeight: 'bold'}}>+ Shto</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, isDark && styles.whiteText]}>Arritjet Tua</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
          <View style={[styles.badge, steps >= 5000 ? styles.badgeActive : styles.badgeInactive]}>
            <Text style={{fontSize: 30}}>🏃</Text>
            <Text style={styles.badgeLabel}>5K Hapa</Text>
          </View>
          <View style={[styles.badge, water >= 2000 ? styles.badgeActive : styles.badgeInactive]}>
            <Text style={{fontSize: 30}}>🐳</Text>
            <Text style={styles.badgeLabel}>Hidratuar</Text>
          </View>
          <View style={[styles.badge, streak >= 3 ? styles.badgeActive : styles.badgeInactive]}>
            <Text style={{fontSize: 30}}>👑</Text>
            <Text style={styles.badgeLabel}>I Fortë</Text>
          </View>
        </ScrollView>

        <View style={styles.waterCard}>
          <View>
            <Text style={styles.waterTitle}>Ujë</Text>
            <Text style={styles.whiteText}>{water}ml / 2500ml</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity style={styles.resetBtnSmall} onPress={resetWater}>
              <Text>🔄</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.waterBtn} onPress={addWater}>
              <Text style={{color: '#2196F3', fontWeight: 'bold'}}>+ Shto</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.quoteCard, {marginTop: 0}]}>
          <Text style={styles.quoteTitle}>Këshilla e Ditës ✨</Text>
          <Text style={styles.quoteText}>{quote}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// SCREEN 2: TRAINING (WITH HIIT TIMER)
// ============================================
function TrainingScreen() {
  const isDark = useColorScheme() === 'dark';
  const [totalBurned, setTotalBurned] = useState(0);
  const [expandedDay, setExpandedDay] = useState(null);
  
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40);
  const [isWork, setIsWork] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem('burnedKcal').then(v => v && setTotalBurned(parseInt(v)));
  }, []);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (isWork) {
        setIsWork(false);
        setTimeLeft(20);
        Alert.alert("Pushim!", "Merr frymë për 20 sekonda.");
      } else {
        setIsWork(true);
        setTimeLeft(40);
        Alert.alert("Punë!", "Vazhdo ushtrimin për 40 sekonda.");
      }
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timeLeft, isWork]);

  const toggleTimer = () => {
    setTimerActive(!timerActive);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimeLeft(40);
    setIsWork(true);
  };

  const completeExercise = async (kcal) => {
    const newTotal = totalBurned + kcal;
    setTotalBurned(newTotal);
    await AsyncStorage.setItem('burnedKcal', newTotal.toString());
    const currentStreak = await AsyncStorage.getItem('streak') || "0";
    const newStreak = parseInt(currentStreak) + 1;
    await AsyncStorage.setItem('streak', newStreak.toString());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Sukses!", `Dogje ${kcal} kcal! Streak-u u rrit! 🔥`);
  };

  const resetKcal = () => {
    Alert.alert("Reset Kaloritë?", "Dëshironi t'i ktheni kaloritë e ushtrimeve në 0?", [
      { text: "Anulo" },
      { text: "Po", onPress: () => { setTotalBurned(0); AsyncStorage.setItem('burnedKcal', '0'); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkBg]}>
      <View style={styles.burnHeader}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
           <Text style={styles.whiteText}>Kalori nga Ushtrimet</Text>
           <TouchableOpacity onPress={resetKcal} style={{marginLeft: 10}}><Text>🔄</Text></TouchableOpacity>
        </View>
        <Text style={styles.burnValue}>{totalBurned} kcal</Text>
        <Text style={styles.whiteText}>≈ {(totalBurned/7700).toFixed(4)} kg humbje</Text>
      </View>

      <ScrollView style={{ padding: 10 }}>
        <View style={[styles.hiitCard, isDark && {backgroundColor: '#1e1e1e'}]}>
          <Text style={[styles.hiitTitle, isDark && styles.whiteText]}>⏱️ HIIT Timer (Tabata)</Text>
          <View style={styles.timerRow}>
            <View style={[styles.timerCircle, {borderColor: isWork ? '#4caf50' : '#ff9800'}]}>
               <Text style={[styles.timerText, {color: isWork ? '#4caf50' : '#ff9800'}]}>{timeLeft}s</Text>
               <Text style={styles.timerSubText}>{isWork ? "PUNË" : "PUSHIM"}</Text>
            </View>
            <View style={styles.timerControls}>
              <TouchableOpacity style={[styles.timerBtn, {backgroundColor: timerActive ? '#f44336' : '#4caf50'}]} onPress={toggleTimer}>
                <Text style={styles.whiteText}>{timerActive ? "STOP" : "START"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.timerBtn, {backgroundColor: '#666'}]} onPress={resetTimer}>
                <Text style={styles.whiteText}>RESET</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {workoutSplit.map((day) => (
          <View key={day.id} style={[styles.dayBox, isDark && {backgroundColor: '#1e1e1e'}]}>
            <TouchableOpacity style={styles.dayRow} onPress={() => setExpandedDay(expandedDay === day.id ? null : day.id)}>
              <Text style={[styles.dayTitle, isDark && styles.whiteText]}>{day.icon} {day.day}</Text>
              <Text style={{color: '#6200ee', fontWeight: 'bold'}}>{expandedDay === day.id ? "MBYLL" : "HAP"}</Text>
            </TouchableOpacity>
            {expandedDay === day.id && (
              <View style={[styles.exList, isDark && {backgroundColor: '#2a2a2a'}]}>
                {day.exercises.map((ex, i) => (
                  <View key={i} style={styles.exRow}>
                    <View style={{flex: 1}}>
                      <Text style={[styles.exName, isDark && styles.whiteText]}>{ex.name}</Text>
                      <TouchableOpacity onPress={() => Linking.openURL(ex.vid)}>
                        <Text style={styles.vidLink}>🎬 Video Tutorial</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.doneBtn} onPress={() => completeExercise(ex.kcal)}>
                      <Text style={styles.whiteText}>KRYEJ</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// SCREEN 3: DIET (WITH MACROS)
// ============================================
function DietScreen() {
  const isDark = useColorScheme() === 'dark';
  const [weight, setWeight] = useState('');
  const [bmr, setBmr] = useState(0);
  const [selectedDiet, setSelectedDiet] = useState(null);
  
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);

  const calcBMR = () => { setBmr(Math.round(parseFloat(weight) * 24 * 1.2)); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

  const addMacro = (type, amount) => {
    if (type === 'p') setProtein(prev => prev + amount);
    if (type === 'c') setCarbs(prev => prev + amount);
    if (type === 'f') setFats(prev => prev + amount);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScrollView style={[styles.container, isDark && styles.darkBg]} showsVerticalScrollIndicator={false}>
      <View style={[styles.calcCard, isDark && {backgroundColor: '#1e1e1e'}]}>
        <Text style={[styles.cardHeader, isDark && styles.whiteText]}>Llogaritësi BMR</Text>
        <TextInput style={[styles.input, isDark && styles.whiteText]} placeholder="Pesha (kg)" placeholderTextColor={isDark ? "#888" : "#ccc"} keyboardType="numeric" onChangeText={setWeight} />
        <TouchableOpacity style={styles.mainBtn} onPress={calcBMR}><Text style={styles.whiteText}>Llogarit</Text></TouchableOpacity>
        {bmr > 0 && <Text style={styles.resultTxt}>Targeti: {bmr} kcal/ditë</Text>}
      </View>

      <View style={[styles.calcCard, isDark && {backgroundColor: '#1e1e1e'}]}>
        <Text style={[styles.cardHeader, isDark && styles.whiteText]}>🍎 Ndjekësi i Makrove (Sot)</Text>
        <View style={styles.macroRow}>
           <View style={styles.macroItem}>
              <Text style={[styles.macroLabel, {color: '#e91e63'}]}>Proteina</Text>
              <Text style={[styles.macroValue, isDark && styles.whiteText]}>{protein}g</Text>
              <TouchableOpacity style={styles.macroAdd} onPress={() => addMacro('p', 10)}><Text style={styles.whiteText}>+10g</Text></TouchableOpacity>
           </View>
           <View style={styles.macroItem}>
              <Text style={[styles.macroLabel, {color: '#2196f3'}]}>Karbo</Text>
              <Text style={[styles.macroValue, isDark && styles.whiteText]}>{carbs}g</Text>
              <TouchableOpacity style={styles.macroAdd} onPress={() => addMacro('c', 20)}><Text style={styles.whiteText}>+20g</Text></TouchableOpacity>
           </View>
           <View style={styles.macroItem}>
              <Text style={[styles.macroLabel, {color: '#ff9800'}]}>Yndyrna</Text>
              <Text style={[styles.macroValue, isDark && styles.whiteText]}>{fats}g</Text>
              <TouchableOpacity style={styles.macroAdd} onPress={() => addMacro('f', 5)}><Text style={styles.whiteText}>+5g</Text></TouchableOpacity>
           </View>
        </View>
        <Text style={[styles.kcalTotal, isDark && styles.whiteText]}>Total: {(protein*4 + carbs*4 + fats*9).toFixed(0)} kcal</Text>
      </View>

      <Text style={[styles.sectionTitle, isDark && styles.whiteText]}>Planet e Ushqimit</Text>
      {dietLibrary.map((item) => (
        <TouchableOpacity key={item.id} style={[styles.dietCard, isDark && {backgroundColor: '#1e1e1e'}, selectedDiet === item.id && styles.activeDiet]} onPress={() => setSelectedDiet(selectedDiet === item.id ? null : item.id)}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <View style={{flex: 1}}>
              <Text style={[styles.dietName, isDark && styles.whiteText]}>{item.name}</Text>
              <Text style={styles.dietDesc}>{item.desc}</Text>
            </View>
            <Text style={{fontSize: 20}}>{selectedDiet === item.id ? "📂" : "📁"}</Text>
          </View>
          {selectedDiet === item.id && (
            <View style={styles.mealBox}>
              <Text style={{fontWeight: 'bold', marginBottom: 5, color: '#6200ee'}}>Menuja e Sugjeruar:</Text>
              {item.meals.map((m, i) => (
                <Text key={i} style={[styles.mealTxt, isDark && {color: '#ddd'}]}>• {m}</Text>
              ))}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ============================================
// SCREEN 4: COACH (AI CHAT) - ME GROQ API
// ============================================
function CoachScreen() {
  const isDark = useColorScheme() === 'dark';
  const [messages, setMessages] = useState([
    { id: 1, text: "Përshëndetje! Unë jam FitCoach. Si mund të të ndihmoj me stërvitjen sot? 💪", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const currentInput = input;
    const userMsg = { id: Date.now(), text: currentInput, sender: 'user' };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const GROQ_API_KEY = "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";
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "Ti je FitCoach, një trajner personal shqiptar profesional. Përgjigju gjithmonë në gjuhën shqipe, ji i shkurtër (max 3 fjali) dhe përdor emoticona për të motivuar."
            },
            {
              role: "user",
              content: currentInput
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Gabim në API");
      }

      const aiResponse = data.choices[0].message.content;
      
      const aiMsg = { id: Date.now() + 1, text: aiResponse, sender: 'ai' };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Gabimi:", error);
      
      let errorMsg = "Më fal, pati nje problem! ❌ Provo perseri.";
      
      if (error.message?.includes("API")) {
        errorMsg = "Problem me API key! Kontrollo nëse e ke vendosur saktë. 🔑";
      } else if (error.message?.includes("network")) {
        errorMsg = "Problem me internetin! Kontrollo lidhjen. 🌐";
      }
      
      setMessages(prev => [...prev, { 
        id: Date.now() + 2, 
        text: errorMsg, 
        sender: 'ai' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkBg]}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 }}>
          <Text style={[styles.sectionTitle, isDark && styles.whiteText]}>
            AI Coach 🤖
          </Text>
          <View style={{ backgroundColor: '#6200ee', padding: 5, borderRadius: 10 }}>
            <Text style={{ color: 'white', fontSize: 10 }}>⚡ GROQ (Falas)</Text>
          </View>
        </View>
        
        <ScrollView 
          ref={scrollRef}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          style={styles.chatBox}
          contentContainerStyle={{ padding: 15 }}
        >
          {messages.map(m => (
            <View key={m.id} style={[
              styles.msgBubble, 
              m.sender === 'user' ? styles.userBubble : styles.aiBubble,
              isDark && m.sender === 'ai' && { backgroundColor: '#333' }
            ]}>
              <Text style={[
                styles.msgText, 
                m.sender === 'user' ? { color: 'white' } : { color: isDark ? 'white' : '#333' }
              ]}>
                {m.text}
              </Text>
            </View>
          ))}
          
          {loading && (
            <View style={{ alignSelf: 'flex-start', marginLeft: 15, marginTop: 10 }}>
              <ActivityIndicator color="#6200ee" />
            </View>
          )}
        </ScrollView>

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <View style={[styles.chatInputRow, isDark && { borderTopColor: '#333', backgroundColor: '#121212' }]}>
            <TextInput
              style={[styles.chatInput, isDark && { backgroundColor: '#1e1e1e', color: 'white', borderColor: '#444' }]}
              placeholder="Pyet trajnerin..."
              placeholderTextColor="#888"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]} 
              onPress={sendMessage}
              disabled={loading || !input.trim()}
            >
              <Text style={styles.whiteText}>→</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

// ============================================
// SCREEN 5: PROGRESS (WITH WEIGHT GRAPH DHE FOTO)
// ============================================
function ProgressScreen() {
  const isDark = useColorScheme() === 'dark';
  const [beforeImg, setBeforeImg] = useState(null);
  const [afterImg, setAfterImg] = useState(null);
  
  const [weightHistory, setWeightHistory] = useState([85, 84.2, 83.5, 83.8, 82.5, 81.8]);
  const [newWeight, setNewWeight] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('beforeImg').then(v => v && setBeforeImg(v));
    AsyncStorage.getItem('afterImg').then(v => v && setAfterImg(v));
    AsyncStorage.getItem('weightHistory').then(v => v && setWeightHistory(JSON.parse(v)));
  }, []);

  const addWeight = () => {
    if (!newWeight) return;
    const updated = [...weightHistory, parseFloat(newWeight)];
    setWeightHistory(updated);
    AsyncStorage.setItem('weightHistory', JSON.stringify(updated));
    setNewWeight('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const pickImage = async (type) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          "Leje e nevojshme",
          "Aplikacioni ka nevojë për qasje në galerinë tuaj për të ngarkuar foto.",
          [
            { text: "Anulo", style: "cancel" },
            { text: "Hap Settings", onPress: () => Linking.openURL('app-settings:') }
          ]
        );
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        
        if (type === 'before') { 
          setBeforeImg(uri); 
          await AsyncStorage.setItem('beforeImg', uri); 
        } else { 
          setAfterImg(uri); 
          await AsyncStorage.setItem('afterImg', uri); 
        }
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Sukses!", "Foto u ngarkua me sukses!");
      }
    } catch (error) {
      console.error("Gabim gjatë zgjedhjes së fotos:", error);
      Alert.alert("Gabim", "Ndodhi një problem gjatë ngarkimit të fotos.");
    }
  };

  const maxW = Math.max(...weightHistory);
  const minW = Math.min(...weightHistory);
  const range = maxW - minW || 1;

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkBg]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, isDark && styles.whiteText]}>Transformimi Im 📸</Text>
        
        <View style={[styles.calcCard, isDark && {backgroundColor: '#1e1e1e'}]}>
          <Text style={[styles.cardHeader, isDark && styles.whiteText]}>📈 Progresi i Peshës</Text>
          <View style={[styles.chartContainer, { flexDirection: 'row', alignItems: 'flex-end', gap: 5 }]}>
            {weightHistory.map((w, i) => {
              const height = ((w - minW) / range) * 80 + 20;
              return (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  <View style={{ width: '100%', height: height, backgroundColor: '#6200ee', borderRadius: 5 }} />
                  <Text style={{ fontSize: 8, marginTop: 5, color: isDark ? '#aaa' : '#666' }}>{w}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.weightInputRow}>
            <TextInput 
              style={[styles.input, {flex: 1, marginRight: 10}, isDark && styles.whiteText]} 
              placeholder="Pesha e re (kg)" 
              placeholderTextColor="#888"
              keyboardType="numeric" 
              value={newWeight}
              onChangeText={setNewWeight}
            />
            <TouchableOpacity style={[styles.mainBtn, {paddingHorizontal: 20}]} onPress={addWeight}>
              <Text style={styles.whiteText}>Shto</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.photoRow}>
          <View style={styles.photoWrapper}>
            <Text style={styles.photoLabel}>PARA (BEFORE)</Text>
            <TouchableOpacity style={[styles.photoBox, isDark && {backgroundColor: '#333', borderColor: '#444'}]} onPress={() => pickImage('before')}>
              {beforeImg ? <Image source={{ uri: beforeImg }} style={styles.fullImg} /> : <Text style={styles.plusIcon}>+</Text>}
            </TouchableOpacity>
          </View>
          <View style={styles.photoWrapper}>
            <Text style={styles.photoLabel}>PAS (AFTER)</Text>
            <TouchableOpacity style={[styles.photoBox, isDark && {backgroundColor: '#333', borderColor: '#444'}]} onPress={() => pickImage('after')}>
              {afterImg ? <Image source={{ uri: afterImg }} style={styles.fullImg} /> : <Text style={styles.plusIcon}>+</Text>}
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.infoText}>Prek kutitë për të ngarkuar foto nga galeria dhe shiko ndryshimin tënd!</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// SCREEN 6: SETTINGS
// ============================================
function SettingsScreen({ onLogout, onThemeToggle, isDark }) {
  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkBg]}>
      <ScrollView style={{padding: 20}}>
        <Text style={[styles.sectionTitle, isDark && styles.whiteText]}>⚙️ Cilësimet</Text>
        
        <View style={[styles.settingItem, isDark && {backgroundColor: '#1e1e1e'}]}>
          <Text style={[styles.settingText, isDark && styles.whiteText]}>🌙 Dark Mode</Text>
          <TouchableOpacity onPress={onThemeToggle} style={[styles.toggleBtn, isDark ? styles.toggleOn : styles.toggleOff]}>
            <View style={[styles.toggleCircle, isDark && {alignSelf: 'flex-end'}]} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.settingItem, isDark && {backgroundColor: '#1e1e1e'}]} onPress={() => Alert.alert("Rreth App", "FitLife Pro v1.0.0 - App për fitnes dhe shëndet! 💪")}>
          <Text style={[styles.settingText, isDark && styles.whiteText]}>ℹ️ Rreth App</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, isDark && {backgroundColor: '#1e1e1e'}]} onPress={() => Linking.openURL('https://forms.gle/your-form')}>
          <Text style={[styles.settingText, isDark && styles.whiteText]}>📝 Feedback</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, {backgroundColor: '#ffebee'}]} onPress={onLogout}>
          <Text style={[styles.settingText, {color: '#f44336'}]}>🚪 Dil</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// MAIN APP (NAVIGATION)
// ============================================
export default function App() {
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState('Kreu');

  useEffect(() => {
    AsyncStorage.getItem('user').then(v => v && setUser(JSON.parse(v)));
    AsyncStorage.getItem('theme').then(v => {
      if (v === 'dark') {
        setIsDark(true);
        Appearance.setColorScheme('dark');
      }
    });

    const timer = setTimeout(() => {
      if (user) {
        Alert.alert("Hidratim! 💧", "Mos harro të pish një gotë ujë për të qëndruar në formë!");
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [user]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    Appearance.setColorScheme(newTheme ? 'dark' : 'light');
  };

  const handleLogout = () => {
    Alert.alert("Dilni?", "Dëshironi të dilni nga llogaria?", [
      { text: "Jo" },
      { text: "Po", onPress: () => { setUser(null); AsyncStorage.removeItem('user'); } }
    ]);
  };

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  const renderScreen = () => {
    switch(activeTab) {
      case 'Kreu': return <HomeScreen />;
      case 'Salla': return <TrainingScreen />;
      case 'Diet': return <DietScreen />;
      case 'Coach': return <CoachScreen />;
      case 'Progresi': return <ProgressScreen />;
      case 'Settings': return <SettingsScreen onLogout={handleLogout} onThemeToggle={toggleTheme} isDark={isDark} />;
      default: return <HomeScreen />;
    }
  };

  return (
    <View style={[styles.mainAppContainer, isDark && styles.darkBg]}>
      <View style={{flex: 1}}>
        {renderScreen()}
      </View>
      <View style={[styles.tabBar, isDark && {backgroundColor: '#121212', borderTopColor: '#333'}]}>
        {[
          { name: 'Kreu', icon: '🏠' },
          { name: 'Salla', icon: '⚡' },
          { name: 'Diet', icon: '🥗' },
          { name: 'Coach', icon: '🤖' },
          { name: 'Progresi', icon: '📸' },
          { name: 'Settings', icon: '⚙️' }
        ].map((tab) => (
          <TouchableOpacity 
            key={tab.name} 
            style={styles.tabItem} 
            onPress={() => setActiveTab(tab.name)}
          >
            <Text style={{fontSize: 20, opacity: activeTab === tab.name ? 1 : 0.5}}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, {color: activeTab === tab.name ? '#6200ee' : '#888'}]}>{tab.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  darkBg: { 
    backgroundColor: '#121212' 
  },
  whiteText: { 
    color: 'white' 
  },
  
  authContainer: { 
    flex: 1, 
    backgroundColor: '#6200ee', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  authCard: { 
    backgroundColor: 'white', 
    width: '85%', 
    padding: 30, 
    borderRadius: 30, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 20 
  },
  authEmoji: { 
    fontSize: 60, 
    marginBottom: 10 
  },
  authTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#6200ee' 
  },
  authSub: { 
    color: '#666', 
    marginBottom: 30 
  },
  authInput: { 
    width: '100%', 
    borderBottomWidth: 1, 
    borderBottomColor: '#ddd', 
    padding: 10, 
    marginBottom: 20, 
    fontSize: 16 
  },
  authBtn: { 
    backgroundColor: '#6200ee', 
    width: '100%', 
    padding: 15, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 10 
  },
  authBtnText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  authToggleText: { 
    color: '#6200ee', 
    fontWeight: '500' 
  },
  
  quoteCard: { 
    backgroundColor: '#6200ee', 
    margin: 20, 
    padding: 20, 
    borderRadius: 20 
  },
  quoteTitle: { 
    color: '#b39ddb', 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  quoteText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginTop: 5 
  },
  streakRow: { 
    marginLeft: 25 
  },
  streakText: { 
    color: '#ff9800', 
    fontWeight: 'bold' 
  },
  ringCard: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    margin: 20, 
    padding: 20, 
    borderRadius: 25, 
    alignItems: 'center' 
  },
  statLabel: { 
    color: '#666' 
  },
  statValue: { 
    fontSize: 28, 
    fontWeight: 'bold' 
  },
  kcalSub: { 
    color: '#ff8c00', 
    fontWeight: 'bold' 
  },
  sectionTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginLeft: 20, 
    marginTop: 20 
  },
  badgeScroll: { 
    paddingLeft: 20, 
    marginVertical: 10 
  },
  badge: { 
    width: 90, 
    height: 100, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 15 
  },
  badgeActive: { 
    backgroundColor: '#e8f5e9', 
    borderWidth: 2, 
    borderColor: '#4caf50' 
  },
  badgeInactive: { 
    backgroundColor: '#eee', 
    opacity: 0.5 
  },
  badgeLabel: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    marginTop: 5 
  },
  waterCard: { 
    backgroundColor: '#2196F3', 
    margin: 20, 
    padding: 20, 
    borderRadius: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  waterTitle: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  resetBtnSmall: { 
    marginRight: 10, 
    padding: 10 
  },
  waterBtn: { 
    backgroundColor: 'white', 
    padding: 10, 
    borderRadius: 10 
  },
  stepsSmallBtn: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    marginLeft: 10,
  },

  sliderContainer: {
    marginTop: 10,
    marginBottom: 10,
    height: 200,
  },
  slide: {
    height: 200,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
  },
  slideTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  slideDescription: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: '#6200ee',
  },

  burnHeader: { 
    backgroundColor: '#6200ee', 
    padding: 40, 
    alignItems: 'center', 
    borderBottomRightRadius: 40 
  },
  burnValue: { 
    fontSize: 45, 
    color: 'white', 
    fontWeight: 'bold' 
  },
  dayBox: { 
    backgroundColor: 'white', 
    margin: 10, 
    borderRadius: 15, 
    overflow: 'hidden', 
    elevation: 3 
  },
  dayRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 20, 
    alignItems: 'center' 
  },
  dayTitle: { 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  exList: { 
    backgroundColor: '#f8f4ff', 
    padding: 20, 
    borderTopWidth: 1, 
    borderTopColor: '#eee' 
  },
  exRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20, 
    alignItems: 'center' 
  },
  exName: { 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  vidLink: { 
    color: '#2196F3', 
    fontSize: 13, 
    marginTop: 5 
  },
  doneBtn: { 
    backgroundColor: '#4caf50', 
    padding: 12, 
    borderRadius: 10 
  },
  
  hiitCard: { 
    backgroundColor: 'white', 
    margin: 10, 
    padding: 20, 
    borderRadius: 20, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 10 
  },
  hiitTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 15 
  },
  timerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-around' 
  },
  timerCircle: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    borderWidth: 5, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  timerText: { 
    fontSize: 32, 
    fontWeight: 'bold' 
  },
  timerSubText: { 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  timerControls: { 
    gap: 10 
  },
  timerBtn: { 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  
  calcCard: { 
    backgroundColor: 'white', 
    margin: 20, 
    padding: 20, 
    borderRadius: 20 
  },
  cardHeader: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  input: { 
    borderBottomWidth: 1, 
    borderBottomColor: '#ddd', 
    marginVertical: 10, 
    fontSize: 18, 
    padding: 5 
  },
  mainBtn: { 
    backgroundColor: '#6200ee', 
    padding: 12, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  resultTxt: { 
    textAlign: 'center', 
    marginTop: 10, 
    fontWeight: 'bold', 
    color: '#6200ee', 
    fontSize: 18 
  },
  dietCard: { 
    backgroundColor: 'white', 
    marginHorizontal: 20, 
    marginBottom: 15, 
    padding: 20, 
    borderRadius: 20, 
    elevation: 2 
  },
  activeDiet: { 
    borderLeftWidth: 8, 
    borderLeftColor: '#6200ee', 
    backgroundColor: '#f9f7ff' 
  },
  dietName: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  dietDesc: { 
    color: '#666', 
    marginTop: 3 
  },
  mealBox: { 
    marginTop: 15, 
    borderTopWidth: 1, 
    borderColor: '#eee', 
    paddingTop: 10 
  },
  mealTxt: { 
    fontSize: 15, 
    marginVertical: 3, 
    color: '#333' 
  },
  
  macroRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 10 
  },
  macroItem: { 
    alignItems: 'center', 
    flex: 1 
  },
  macroLabel: { 
    fontWeight: 'bold', 
    fontSize: 12 
  },
  macroValue: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginVertical: 5 
  },
  macroAdd: { 
    backgroundColor: '#6200ee', 
    padding: 5, 
    borderRadius: 5 
  },
  kcalTotal: { 
    textAlign: 'center', 
    marginTop: 15, 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  
  chatBox: { 
    flex: 1 
  },
  msgBubble: { 
    maxWidth: '80%', 
    padding: 12, 
    borderRadius: 20, 
    marginBottom: 10 
  },
  userBubble: { 
    alignSelf: 'flex-end', 
    backgroundColor: '#6200ee' 
  },
  aiBubble: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#f0f0f0' 
  },
  msgText: { 
    fontSize: 16 
  },
  chatInputRow: { 
    flexDirection: 'row', 
    padding: 10, 
    borderTopWidth: 1, 
    borderTopColor: '#ddd', 
    backgroundColor: '#fff', 
    alignItems: 'flex-end' 
  },
  chatInput: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 25, 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    maxHeight: 100, 
    backgroundColor: '#fff', 
    fontSize: 16 
  },
  sendBtn: { 
    backgroundColor: '#6200ee', 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 10 
  },
  sendBtnDisabled: { 
    opacity: 0.6, 
    backgroundColor: '#aaa' 
  },
  
  chartContainer: { 
    height: 120, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginVertical: 10 
  },
  weightInputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10 
  },
  photoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%', 
    paddingHorizontal: 10, 
    marginTop: 10 
  },
  photoWrapper: { 
    width: '48%', 
    alignItems: 'center' 
  },
  photoLabel: { 
    fontWeight: 'bold', 
    marginBottom: 10, 
    color: '#666' 
  },
  photoBox: { 
    width: '100%', 
    height: 250, 
    backgroundColor: '#ddd', 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: '#ccc' 
  },
  fullImg: { 
    width: '100%', 
    height: '100%' 
  },
  plusIcon: { 
    fontSize: 40, 
    color: '#999' 
  },
  infoText: { 
    marginTop: 20, 
    paddingHorizontal: 30, 
    textAlign: 'center', 
    color: '#888', 
    fontStyle: 'italic' 
  },
  
  settingItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    padding: 20, 
    borderRadius: 15, 
    marginBottom: 10 
  },
  settingText: { 
    fontSize: 16, 
    fontWeight: '600' 
  },
  toggleBtn: { 
    width: 50, 
    height: 28, 
    borderRadius: 15, 
    padding: 4, 
    justifyContent: 'center' 
  },
  toggleOn: { 
    backgroundColor: '#6200ee' 
  },
  toggleOff: { 
    backgroundColor: '#ccc' 
  },
  toggleCircle: { 
    width: 20, 
    height: 20, 
    backgroundColor: 'white', 
    borderRadius: 10 
  },
  
  mainAppContainer: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  tabBar: { 
    height: 70, 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    borderTopWidth: 1, 
    borderTopColor: '#eee', 
    paddingBottom: 10 
  },
  tabItem: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  tabLabel: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    marginTop: 2 
  }
});