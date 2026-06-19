import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const LanguageContext = createContext(null);

// Translation dictionary
const translations = {
  en: {
    // Sidebar / Nav
    home: 'Home', myCart: 'My Cart', scheduleFoods: 'Schedule Foods', myOrders: 'My Orders',
    nutrition: 'Nutrition', subscriptions: 'Subscriptions', myClients: 'My Clients',
    scheduleForClients: 'Schedule Foods to Clients', profile: 'Profile', myGymOwner: 'My Gym & Owner',
    manageTrainers: 'Manage Trainers', members: 'Members', analytics: 'Analytics',
    menu: 'Menu', settings: 'Settings', orderQueue: 'Order Queue', dispatch: 'Dispatch',
    dashboard: 'Dashboard', deliveries: 'Deliveries', userManagement: 'User Management',
    allOrders: 'All Orders', deliveryMgmt: 'Delivery Mgmt',
    // Common UI
    signIn: 'Sign In', register: 'Register', logout: 'Logout', cancel: 'Cancel', confirm: 'Confirm',
    save: 'Save', edit: 'Edit', delete: 'Delete', close: 'Close', search: 'Search',
    addToCart: 'Add to Cart', placeOrder: 'Place Order', viewAll: 'View All',
    // Dashboard
    totalOrders: 'Total Orders', revenue: 'Revenue', pendingOrders: 'Pending Orders',
    recentOrders: 'Recent Orders', dailyNutrition: 'Daily Nutrition',
    calories: 'Calories', protein: 'Protein', carbs: 'Carbs', fat: 'Fat',
    // Status
    pending: 'Pending', preparing: 'Preparing', ready: 'Ready', delivered: 'Delivered',
    assigned: 'Assigned', blocked: 'Blocked', active: 'Active',
    // Settings
    language: 'Language', appLanguage: 'App display language', preferences: 'Preferences',
    notifications: 'Notifications', darkMode: 'Dark Mode',
    // Actions
    block: 'Block', unblock: 'Unblock', promote: 'Promote', demote: 'Demote',
    remove: 'Remove', assign: 'Assign', leaveGym: 'Leave Gym',
  },
  hi: {
    home: 'होम', myCart: 'मेरी कार्ट', scheduleFoods: 'भोजन शेड्यूल', myOrders: 'मेरे ऑर्डर',
    nutrition: 'पोषण', subscriptions: 'सदस्यता', myClients: 'मेरे क्लाइंट',
    scheduleForClients: 'क्लाइंट के लिए भोजन शेड्यूल', profile: 'प्रोफ़ाइल', myGymOwner: 'मेरा जिम और मालिक',
    manageTrainers: 'ट्रेनर प्रबंधन', members: 'सदस्य', analytics: 'विश्लेषण',
    menu: 'मेनू', settings: 'सेटिंग्स', orderQueue: 'ऑर्डर कतार', dispatch: 'डिस्पैच',
    dashboard: 'डैशबोर्ड', deliveries: 'डिलीवरी', userManagement: 'उपयोगकर्ता प्रबंधन',
    allOrders: 'सभी ऑर्डर', deliveryMgmt: 'डिलीवरी प्रबंधन',
    signIn: 'साइन इन', register: 'रजिस्टर', logout: 'लॉगआउट', cancel: 'रद्द करें', confirm: 'पुष्टि करें',
    save: 'सहेजें', edit: 'संपादित करें', delete: 'हटाएं', close: 'बंद करें', search: 'खोजें',
    addToCart: 'कार्ट में डालें', placeOrder: 'ऑर्डर दें', viewAll: 'सभी देखें',
    totalOrders: 'कुल ऑर्डर', revenue: 'राजस्व', pendingOrders: 'लंबित ऑर्डर',
    recentOrders: 'हाल के ऑर्डर', dailyNutrition: 'दैनिक पोषण',
    calories: 'कैलोरी', protein: 'प्रोटीन', carbs: 'कार्ब्स', fat: 'वसा',
    pending: 'लंबित', preparing: 'तैयार हो रहा', ready: 'तैयार', delivered: 'डिलीवर किया',
    assigned: 'सौंपा गया', blocked: 'ब्लॉक किया', active: 'सक्रिय',
    language: 'भाषा', appLanguage: 'ऐप प्रदर्शन भाषा', preferences: 'प्राथमिकताएं',
    notifications: 'सूचनाएं', darkMode: 'डार्क मोड',
    block: 'ब्लॉक', unblock: 'अनब्लॉक', promote: 'पदोन्नति', demote: 'पदावनति',
    remove: 'हटाएं', assign: 'सौंपें', leaveGym: 'जिम छोड़ें',
  },
  ta: {
    home: 'முகப்பு', myCart: 'என் கார்ட்', scheduleFoods: 'உணவு அட்டவணை', myOrders: 'என் ஆர்டர்கள்',
    nutrition: 'ஊட்டச்சத்து', subscriptions: 'சந்தா', myClients: 'என் வாடிக்கையாளர்கள்',
    scheduleForClients: 'வாடிக்கையாளர்களுக்கு உணவு', profile: 'சுயவிவரம்', myGymOwner: 'என் ஜிம் உரிமையாளர்',
    manageTrainers: 'பயிற்சியாளர் மேலாண்மை', members: 'உறுப்பினர்கள்', analytics: 'பகுப்பாய்வு',
    menu: 'மெனு', settings: 'அமைப்புகள்', orderQueue: 'ஆர்டர் வரிசை', dispatch: 'அனுப்புதல்',
    dashboard: 'டாஷ்போர்ட்', deliveries: 'டெலிவரி', userManagement: 'பயனர் மேலாண்மை',
    allOrders: 'அனைத்து ஆர்டர்கள்', deliveryMgmt: 'டெலிவரி மேலாண்மை',
    signIn: 'உள்நுழை', register: 'பதிவு', logout: 'வெளியேறு', cancel: 'ரத்து', confirm: 'உறுதிசெய்',
    save: 'சேமி', edit: 'திருத்து', delete: 'நீக்கு', close: 'மூடு', search: 'தேடு',
    addToCart: 'கார்ட்டில் சேர்', placeOrder: 'ஆர்டர் செய்', viewAll: 'அனைத்தையும் பார்',
    totalOrders: 'மொத்த ஆர்டர்கள்', revenue: 'வருவாய்', pendingOrders: 'நிலுவை ஆர்டர்கள்',
    recentOrders: 'சமீபத்திய ஆர்டர்கள்', dailyNutrition: 'தினசரி ஊட்டச்சத்து',
    calories: 'கலோரிகள்', protein: 'புரதம்', carbs: 'கார்ப்ஸ்', fat: 'கொழுப்பு',
    pending: 'நிலுவை', preparing: 'தயாரிக்கிறது', ready: 'தயார்', delivered: 'டெலிவர் செய்யப்பட்டது',
    assigned: 'ஒதுக்கப்பட்டது', blocked: 'தடுக்கப்பட்டது', active: 'செயலில்',
    language: 'மொழி', appLanguage: 'ஆப்ஸ் காட்சி மொழி', preferences: 'விருப்பங்கள்',
    notifications: 'அறிவிப்புகள்', darkMode: 'இருண்ட பயன்முறை',
    block: 'தடு', unblock: 'தடை நீக்கு', promote: 'பதவி உயர்வு', demote: 'பதவி இறக்கம்',
    remove: 'நீக்கு', assign: 'ஒதுக்கு', leaveGym: 'ஜிம் விடு',
  },
  kn: {
    home: 'ಮುಖಪುಟ', myCart: 'ನನ್ನ ಕಾರ್ಟ್', scheduleFoods: 'ಆಹಾರ ವೇಳಾಪಟ್ಟಿ', myOrders: 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು',
    nutrition: 'ಪೋಷಣೆ', subscriptions: 'ಚಂದಾ', myClients: 'ನನ್ನ ಗ್ರಾಹಕರು',
    scheduleForClients: 'ಗ್ರಾಹಕರಿಗೆ ಆಹಾರ ವೇಳಾಪಟ್ಟಿ', profile: 'ಪ್ರೊಫೈಲ್', myGymOwner: 'ನನ್ನ ಜಿಮ್ ಮಾಲೀಕ',
    manageTrainers: 'ತರಬೇತುದಾರರ ನಿರ್ವಹಣೆ', members: 'ಸದಸ್ಯರು', analytics: 'ವಿಶ್ಲೇಷಣೆ',
    menu: 'ಮೆನು', settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', orderQueue: 'ಆರ್ಡರ್ ಸರತಿ', dispatch: 'ಕಳುಹಿಸು',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', deliveries: 'ಡೆಲಿವರಿ', userManagement: 'ಬಳಕೆದಾರ ನಿರ್ವಹಣೆ',
    allOrders: 'ಎಲ್ಲಾ ಆರ್ಡರ್‌ಗಳು', deliveryMgmt: 'ಡೆಲಿವರಿ ನಿರ್ವಹಣೆ',
    signIn: 'ಸೈನ್ ಇನ್', register: 'ನೋಂದಣಿ', logout: 'ಲಾಗ್‌ಔಟ್', cancel: 'ರದ್ದು', confirm: 'ದೃಢೀಕರಿಸಿ',
    save: 'ಉಳಿಸಿ', edit: 'ಸಂಪಾದಿಸಿ', delete: 'ಅಳಿಸಿ', close: 'ಮುಚ್ಚಿ', search: 'ಹುಡುಕಿ',
    addToCart: 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ', placeOrder: 'ಆರ್ಡರ್ ಮಾಡಿ', viewAll: 'ಎಲ್ಲಾ ನೋಡಿ',
    totalOrders: 'ಒಟ್ಟು ಆರ್ಡರ್‌ಗಳು', revenue: 'ಆದಾಯ', pendingOrders: 'ಬಾಕಿ ಆರ್ಡರ್‌ಗಳು',
    recentOrders: 'ಇತ್ತೀಚಿನ ಆರ್ಡರ್‌ಗಳು', dailyNutrition: 'ದೈನಿಕ ಪೋಷಣೆ',
    calories: 'ಕ್ಯಾಲೊರಿಗಳು', protein: 'ಪ್ರೋಟೀನ್', carbs: 'ಕಾರ್ಬ್ಸ್', fat: 'ಕೊಬ್ಬು',
    pending: 'ಬಾಕಿ', preparing: 'ತಯಾರಿ', ready: 'ಸಿದ್ಧ', delivered: 'ವಿತರಿಸಲಾಗಿದೆ',
    assigned: 'ನಿಯೋಜಿಸಲಾಗಿದೆ', blocked: 'ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ', active: 'ಸಕ್ರಿಯ',
    language: 'ಭಾಷೆ', appLanguage: 'ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆ', preferences: 'ಆದ್ಯತೆಗಳು',
    notifications: 'ಅಧಿಸೂಚನೆಗಳು', darkMode: 'ಡಾರ್ಕ್ ಮೋಡ್',
    block: 'ನಿರ್ಬಂಧಿಸಿ', unblock: 'ನಿರ್ಬಂಧ ತೆಗೆಯಿರಿ', promote: 'ಬಡ್ತಿ', demote: 'ಅವನತಿ',
    remove: 'ತೆಗೆದುಹಾಕಿ', assign: 'ನಿಯೋಜಿಸಿ', leaveGym: 'ಜಿಮ್ ಬಿಡಿ',
  },
  te: {
    home: 'హోమ్', myCart: 'నా కార్ట్', scheduleFoods: 'ఆహార షెడ్యూల్', myOrders: 'నా ఆర్డర్లు',
    nutrition: 'పోషణ', subscriptions: 'సభ్యత్వాలు', myClients: 'నా క్లయింట్లు',
    scheduleForClients: 'క్లయింట్లకు ఆహార షెడ్యూల్', profile: 'ప్రొఫైల్', myGymOwner: 'నా జిమ్ యజమాని',
    manageTrainers: 'ట్రైనర్ నిర్వహణ', members: 'సభ్యులు', analytics: 'విశ్లేషణ',
    menu: 'మెనూ', settings: 'సెట్టింగ్‌లు', orderQueue: 'ఆర్డర్ క్యూ', dispatch: 'డిస్పాచ్',
    dashboard: 'డాష్‌బోర్డ్', deliveries: 'డెలివరీలు', userManagement: 'యూజర్ నిర్వహణ',
    allOrders: 'అన్ని ఆర్డర్లు', deliveryMgmt: 'డెలివరీ నిర్వహణ',
    signIn: 'సైన్ ఇన్', register: 'నమోదు', logout: 'లాగ్‌అవుట్', cancel: 'రద్దు', confirm: 'నిర్ధారించు',
    save: 'సేవ్', edit: 'సవరించు', delete: 'తొలగించు', close: 'మూసివేయి', search: 'వెతుకు',
    addToCart: 'కార్ట్‌కు జోడించు', placeOrder: 'ఆర్డర్ చేయి', viewAll: 'అన్నీ చూడు',
    totalOrders: 'మొత్తం ఆర్డర్లు', revenue: 'ఆదాయం', pendingOrders: 'పెండింగ్ ఆర్డర్లు',
    recentOrders: 'ఇటీవలి ఆర్డర్లు', dailyNutrition: 'రోజువారీ పోషణ',
    calories: 'కేలరీలు', protein: 'ప్రోటీన్', carbs: 'కార్బ్స్', fat: 'కొవ్వు',
    pending: 'పెండింగ్', preparing: 'తయారవుతోంది', ready: 'సిద్ధం', delivered: 'డెలివరీ అయింది',
    assigned: 'కేటాయించబడింది', blocked: 'బ్లాక్ చేయబడింది', active: 'యాక్టివ్',
    language: 'భాష', appLanguage: 'యాప్ డిస్‌ప్లే భాష', preferences: 'ప్రాధాన్యతలు',
    notifications: 'నోటిఫికేషన్లు', darkMode: 'డార్క్ మోడ్',
    block: 'బ్లాక్', unblock: 'అన్‌బ్లాక్', promote: 'ప్రమోట్', demote: 'డిమోట్',
    remove: 'తొలగించు', assign: 'కేటాయించు', leaveGym: 'జిమ్ విడిచిపెట్టు',
  },
};

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
];

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('synnoviq_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('synnoviq_lang', lang);
  }, [lang]);

  // t() function for getting translations
  const t = (key) => {
    return (translations[lang] && translations[lang][key]) || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
