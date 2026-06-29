export const MOCK_USERS = [
  // Clients
  { id: 'u1', name: 'Ravi Kumar', email: 'ravi@email.com', phone: '9876543210', role: 'client', avatar: 'RK', password: 'ravi123', gymId: 'g1', trainerId: 't1', age: 28, gender: 'Male', height: 175, weight: 72, goal: 'Weight Loss', diet: 'Non-Veg', allergies: 'None', joinDate: '2025-01-15' },
  { id: 'u2', name: 'Priya Sharma', email: 'priya@email.com', phone: '9876543211', role: 'client', avatar: 'PS', password: 'priya123', gymId: 'g1', trainerId: 't1', age: 25, gender: 'Female', height: 162, weight: 58, goal: 'Muscle Gain', diet: 'Veg', allergies: 'Lactose', joinDate: '2025-02-20' },
  { id: 'u3', name: 'Arun Mehta', email: 'arun@email.com', phone: '9876543212', role: 'client', avatar: 'AM', password: 'arun123', gymId: 'g1', trainerId: 't2', age: 32, gender: 'Male', height: 180, weight: 85, goal: 'Weight Loss', diet: 'Non-Veg', allergies: 'None', joinDate: '2025-03-10' },
  { id: 'u4', name: 'Sneha Patel', email: 'sneha@email.com', phone: '9876543213', role: 'client', avatar: 'SP', password: 'sneha123', gymId: 'g1', trainerId: null, age: 27, gender: 'Female', height: 158, weight: 55, goal: 'Maintenance', diet: 'Vegan', allergies: 'Gluten', joinDate: '2025-04-05' },
  { id: 'u5', name: 'Vikram Singh', email: 'vikram@email.com', phone: '9876543214', role: 'client', avatar: 'VS', password: 'vikram123', gymId: 'g1', trainerId: 't2', age: 30, gender: 'Male', height: 178, weight: 80, goal: 'Muscle Gain', diet: 'Non-Veg', allergies: 'None', joinDate: '2025-01-28' },
  { id: 'u6', name: 'Anita Desai', email: 'anita@email.com', phone: '9876543215', role: 'client', avatar: 'AD', password: 'anita123', gymId: 'g2', trainerId: 't3', age: 24, gender: 'Female', height: 165, weight: 60, goal: 'Weight Loss', diet: 'Veg', allergies: 'Nuts', joinDate: '2025-05-12' },
  { id: 'u7', name: 'Rahul Joshi', email: 'rahul@email.com', phone: '9876543216', role: 'client', avatar: 'RJ', password: 'rahul123', gymId: 'g2', trainerId: null, age: 29, gender: 'Male', height: 172, weight: 68, goal: 'Muscle Gain', diet: 'Non-Veg', allergies: 'None', joinDate: '2025-06-01' },
  { id: 'u8', name: 'Kavitha Nair', email: 'kavitha@email.com', phone: '9876543217', role: 'client', avatar: 'KN', password: 'kavitha123', gymId: 'g2', trainerId: 't3', age: 26, gender: 'Female', height: 160, weight: 52, goal: 'Maintenance', diet: 'Veg', allergies: 'None', joinDate: '2025-03-22' },

  // Trainers
  { id: 't1', name: 'Coach Marcus', email: 'marcus@email.com', phone: '9876543220', role: 'trainer', avatar: 'CM', password: 'marcus123', gymId: 'g1', ownerId: 'o1', specialization: 'Strength Training', certifications: 'ACE, NASM', joinDate: '2024-06-15' },
  { id: 't2', name: 'Coach Deepa', email: 'deepa@email.com', phone: '9876543221', role: 'trainer', avatar: 'CD', password: 'deepa123', gymId: 'g1', ownerId: 'o1', specialization: 'HIIT & Cardio', certifications: 'ISSA', joinDate: '2024-08-20' },
  { id: 't3', name: 'Coach Arjun', email: 'arjun@email.com', phone: '9876543222', role: 'trainer', avatar: 'CA', password: 'arjun123', gymId: 'g2', ownerId: 'o2', specialization: 'Yoga & Flexibility', certifications: 'RYT-500', joinDate: '2024-05-10' },

  // Owners
  { id: 'o1', name: 'Suresh Reddy', email: 'suresh@email.com', phone: '9876543230', role: 'owner', avatar: 'SR', password: 'suresh123', gymId: 'g1', gymName: 'FitZone Pro Gym', gymLocation: 'Bangalore, MG Road', gst: 'GST29ABCDE1234F' },
  { id: 'o2', name: 'Meena Iyer', email: 'meena@email.com', phone: '9876543231', role: 'owner', avatar: 'MI', password: 'meena123', gymId: 'g2', gymName: 'PowerHouse Fitness', gymLocation: 'Chennai, T Nagar', gst: 'GST33FGHIJ5678K' },

  // Kitchen Staff
  { id: 'k1', name: 'Chef Rajesh', email: 'rajesh@email.com', phone: '9876543240', role: 'kitchen', avatar: 'CR', password: 'rajesh123', kitchenName: 'FitBites Central Kitchen', kitchenLocation: 'Bangalore, Koramangala' },
  { id: 'k2', name: 'Chef Lakshmi', email: 'lakshmi@email.com', phone: '9876543241', role: 'kitchen', avatar: 'CL', password: 'lakshmi123', kitchenName: 'FitBites South Kitchen', kitchenLocation: 'Chennai, Adyar' },

  // Delivery
  { id: 'd1', name: 'Amit Verma', email: 'amit@email.com', phone: '9876543250', role: 'delivery', avatar: 'AV', password: 'amit123', vehicleType: 'Bike', licenseNo: 'KA01AB1234', available: true, rating: 4.8 },
  { id: 'd2', name: 'Kiran Das', email: 'kiran@email.com', phone: '9876543251', role: 'delivery', avatar: 'KD', password: 'kiran123', vehicleType: 'Scooter', licenseNo: 'TN02CD5678', available: true, rating: 4.6 },
  { id: 'd3', name: 'Prakash Rao', email: 'prakash@email.com', phone: '9876543252', role: 'delivery', avatar: 'PR', password: 'prakash123', vehicleType: 'Bike', licenseNo: 'KA03EF9012', available: false, rating: 4.9 },

  // Admin
  { id: 'a1', name: 'Admin User', email: 'admin@synnoviq.com', phone: '9876543260', role: 'admin', avatar: 'AU', password: 'admin123' }
];

export const GYMS = [
  { id: 'g1', name: 'FitZone Pro Gym', location: 'Bangalore, MG Road', ownerId: 'o1', gst: 'GST29ABCDE1234F', members: 24, trainers: 2, rating: 4.8,
    images: ['/src/assets/gym_users.png', '/src/assets/workout_schedule.png', '/src/assets/trainer_workout.png'],
    description: 'FitZone Pro is a premium fitness center equipped with state-of-the-art machines, free weights, and dedicated zones for cardio, strength, and flexibility training. Our expert trainers ensure personalized guidance for every member.',
    amenities: ['Free Weights', 'Cardio Zone', 'Yoga Studio', 'Steam & Sauna', 'Locker Rooms', 'Protein Bar', 'Parking'],
    hours: 'Mon-Sat: 5:00 AM - 10:00 PM | Sun: 6:00 AM - 8:00 PM',
    plans: [{ name: 'Monthly', price: 1000, duration: '1 Month' }, { name: 'Quarterly', price: 2700, duration: '3 Months', popular: true }, { name: 'Yearly', price: 9999, duration: '12 Months' }]
  },
  { id: 'g2', name: 'PowerHouse Fitness', location: 'Chennai, T Nagar', ownerId: 'o2', gst: 'GST33FGHIJ5678K', members: 18, trainers: 1, rating: 4.6,
    images: ['/src/assets/gym_users.png', '/src/assets/trainer_workout.png', '/src/assets/workout_schedule.png'],
    description: 'PowerHouse Fitness combines modern equipment with traditional training methods. Known for our intense HIIT programs and yoga sessions, we cater to fitness enthusiasts of all levels.',
    amenities: ['CrossFit Area', 'Boxing Ring', 'Yoga Studio', 'Shower Rooms', 'Juice Bar', 'AC Training Hall'],
    hours: 'Mon-Sat: 5:30 AM - 9:30 PM | Sun: 7:00 AM - 6:00 PM',
    plans: [{ name: 'Monthly', price: 1000, duration: '1 Month' }, { name: 'Quarterly', price: 2700, duration: '3 Months', popular: true }, { name: 'Yearly', price: 9999, duration: '12 Months' }]
  },
  { id: 'g3', name: 'Iron Paradise', location: 'Mumbai, Andheri West', ownerId: 'o1', gst: 'GST27KLMNO9012P', members: 32, trainers: 3, rating: 4.9,
    images: ['/src/assets/workout_schedule.png', '/src/assets/trainer_workout.png', '/src/assets/gym_users.png'],
    description: 'Iron Paradise is the ultimate destination for serious lifters and athletes. With Olympic-grade equipment, certified trainers, and a motivating atmosphere, we help you push beyond limits.',
    amenities: ['Olympic Weights', 'Squat Racks', 'Deadlift Platforms', 'Swimming Pool', 'Sports Nutrition Store', 'Recovery Zone', 'Personal Training Rooms'],
    hours: 'Open 24/7',
    plans: [{ name: 'Monthly', price: 1000, duration: '1 Month' }, { name: 'Quarterly', price: 2700, duration: '3 Months', popular: true }, { name: 'Yearly', price: 9999, duration: '12 Months' }]
  }
];
