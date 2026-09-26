const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const QRCode = require('qrcode');

dotenv.config();

const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Order = require('./models/Order');
const Report = require('./models/Report');

// ─── RAJ FOOD CENTRE (RFC) MENU ITEMS (Transcribed from Images) ───
const rfcMenuItems = [
  // ─── STARTERS ───
  { name: 'Tea', category: 'Starters', price: 20, description: 'Fresh hot spiced milk tea.' },
  { name: 'Coffee', category: 'Starters', price: 30, description: 'Hot brewed rich coffee.' },
  { name: 'Onion Pakoda', category: 'Starters', price: 100, description: 'Crispy deep-fried onion fritters with herbs and gram flour.' },
  { name: 'Veg Pakoda', category: 'Starters', price: 100, description: 'Assorted seasonal vegetable fritters served hot.' },
  { name: 'Egg Pakoda', category: 'Starters', price: 120, description: 'Boiled egg slices dipped in seasoned batter and crisp fried.' },
  { name: 'Mix Pakoda', category: 'Starters', price: 200, description: 'Chef special assortment of veg, paneer, and egg fritters.' },
  { name: 'Paneer Pakoda', category: 'Starters', price: 180, description: 'Tender cottage cheese slices coated in spiced gram flour.' },
  { name: 'Chicken Pakoda', category: 'Starters', price: 200, description: 'Juicy spiced chicken chunks deep-fried to golden perfection.' },
  { name: 'Crispy Chilly Baby Corn', category: 'Starters', price: 200, description: 'Crisp baby corn tossed in spicy chilli garlic sauce.' },
  { name: 'Crispy Chilly Mushroom', category: 'Starters', price: 220, description: 'Fresh button mushrooms wok-tossed in zesty sweet and spicy sauce.' },
  { name: 'Crispy Chilly Potato', category: 'Starters', price: 150, description: 'Golden potato fingers glazed in spicy chilli soya sauce.' },
  { name: 'French Fries', category: 'Starters', price: 120, description: 'Classic salted crispy golden potato fries.' },
  { name: 'Crunchy Crispy Chicken', category: 'Starters', price: 220, description: 'Extra crunchy battered chicken bites seasoned with spices.' },
  { name: 'Chicken Drumstick', category: 'Starters', price: 200, description: 'Marinated crispy chicken drumsticks fried to tender perfection.' },
  { name: 'Chicken Lollipop', category: 'Starters', price: 190, description: 'Popular Indo-Chinese chicken winglets with spicy coating.' },
  { name: 'Chicken 65', category: 'Starters', price: 250, description: 'Fiery South-Indian style deep fried chicken with curry leaves and chillies.' },

  // ─── RICE ───
  { name: 'Plain Rice', category: 'Rice', price: 70, description: 'Steamed fluffy white long-grain rice.' },
  { name: 'Jeera Rice', category: 'Rice', price: 110, description: 'Aromatic basmati rice tempered with roasted cumin seeds and ghee.' },
  { name: 'Veg Pulao', category: 'Rice', price: 130, description: 'Basmati rice cooked with fresh seasonal vegetables and spices.' },
  { name: 'Veg Fried Rice', category: 'Rice', price: 100, description: 'Wok-tossed rice with finely diced vegetables and soya sauce.' },
  { name: 'Egg Fried Rice', category: 'Rice', price: 120, description: 'Classic Chinese fried rice scrambled with eggs and spring onions.' },
  { name: 'Chicken Fried Rice', category: 'Rice', price: 150, description: 'Wok-tossed fragrant rice with shredded chicken and veggies.' },
  { name: 'Mix Fried Rice', category: 'Rice', price: 200, description: 'Special fried rice loaded with egg, chicken, and fresh veggies.' },
  { name: 'Schezwan Veg Fried Rice', category: 'Rice', price: 150, description: 'Spicy Schezwan pepper infused fried rice with vegetables.' },
  { name: 'Schezwan Chicken Fried Rice', category: 'Rice', price: 200, description: 'Fiery Schezwan style fried rice with tender chicken pieces.' },

  // ─── DAL ───
  { name: 'Dal Fry', category: 'Dal', price: 60, description: 'Yellow lentils tempered with cumin, garlic, onions and tomatoes.' },
  { name: 'Dal Makhani', category: 'Dal', price: 90, description: 'Slow-cooked whole black lentils with butter and fresh cream. (Half: ₹90 / Full: ₹140)' },
  { name: 'Plain Tadka', category: 'Dal', price: 80, description: 'Homestyle yellow dal tempered with desi ghee and whole chillies. (Half: ₹80 / Full: ₹150)' },
  { name: 'Egg Tadka', category: 'Dal', price: 90, description: 'Popular Punjabi style yellow dal enriched with scrambled spiced eggs. (Half: ₹90 / Full: ₹160)' },
  { name: 'Paneer Tadka', category: 'Dal', price: 100, description: 'Tempered lentils topped with soft cottage cheese cubes. (Half: ₹100 / Full: ₹180)' },
  { name: 'Chicken Tadka', category: 'Dal', price: 120, description: 'Rich flavorful dal cooked with tender minced & boneless chicken. (Half: ₹120 / Full: ₹200)' },

  // ─── NOODLES ───
  { name: 'Veg Noodles', category: 'Noodles', price: 90, description: 'Classic stir-fried Hakka noodles with julienned vegetables.' },
  { name: 'Egg Noodles', category: 'Noodles', price: 120, description: 'Wok-tossed noodles with scrambled egg ribbons and fresh veggies.' },
  { name: 'Chicken Noodles', category: 'Noodles', price: 150, description: 'Stir-fried noodles loaded with spiced chicken shreds and spring onions.' },
  { name: 'Schezwan Veg Noodles', category: 'Noodles', price: 120, description: 'Spicy wok-tossed noodles with hot Schezwan chilli pepper sauce.' },
  { name: 'Schezwan Egg Noodles', category: 'Noodles', price: 150, description: 'Zesty Schezwan noodles with eggs and crunchy vegetables.' },
  { name: 'Schezwan Chicken Noodles', category: 'Noodles', price: 200, description: 'Fiery Schezwan noodles packed with tender chicken morsels.' },

  // ─── VEG ITEMS ───
  { name: 'Mix Veg', category: 'Veg Items', price: 100, description: 'Fresh seasonal vegetables cooked in traditional semi-dry masala. (Half: ₹100 / Full: ₹180)' },
  { name: 'Mix Veg With Gravy', category: 'Veg Items', price: 120, description: 'Seasonal mixed veggies in aromatic onion-tomato gravy. (Half: ₹120 / Full: ₹200)' },
  { name: 'Vegetable Stir-Fry', category: 'Veg Items', price: 200, description: 'Crisp garden vegetables lightly sautéed with herbs and garlic.' },
  { name: 'Veg Kofta', category: 'Veg Items', price: 200, description: 'Deep-fried vegetable dumplings simmered in rich spiced curry.' },
  { name: 'Malai Kofta', category: 'Veg Items', price: 220, description: 'Melt-in-mouth cottage cheese dumplings in rich creamy cashew gravy.' },
  { name: 'Aloo Dum', category: 'Veg Items', price: 120, description: 'Baby potatoes cooked in aromatic robust Bengali-style gravy. (Half: ₹120 / Full: ₹200)' },
  { name: 'Garlic Vegetable', category: 'Veg Items', price: 200, description: 'Fresh vegetables tossed with abundant roasted garlic and mild spices.' },
  { name: 'Veg Manchurian', category: 'Veg Items', price: 200, description: 'Crisp vegetable balls in savory Indo-Chinese ginger garlic sauce.' },
  { name: 'Baby Corn Masala', category: 'Veg Items', price: 230, description: 'Tender baby corn cooked in thick tomato-onion spiced masala.' },
  { name: 'Mushroom Masala', category: 'Veg Items', price: 250, description: 'Fresh button mushrooms simmered in robust aromatic Indian gravy.' },

  // ─── ROLLS ───
  { name: 'Chicken Roll', category: 'Rolls', price: 100, description: 'Crispy flaky paratha wrapped around spiced roasted chicken & onions.' },
  { name: 'Egg Roll', category: 'Rolls', price: 80, description: 'Golden egg layered paratha roll with fresh sliced onions and tangy sauces.' },
  { name: 'Paneer Roll', category: 'Rolls', price: 90, description: 'Warm paratha rolled with seasoned paneer cubes and crunchy veggies.' },

  // ─── ROTI & BREADS ───
  { name: 'Plain Roti', category: 'Roti', price: 10, description: 'Freshly puffed whole wheat tawa phulka.' },
  { name: 'Puri', category: 'Roti', price: 15, description: 'Crisp golden deep-fried whole wheat puffed bread.' },
  { name: 'Butter Roti', category: 'Roti', price: 15, description: 'Hot wheat roti brushed with fresh creamy butter.' },
  { name: 'Plain Paratha', category: 'Roti', price: 40, description: 'Shallow fried triangular flaky whole wheat flatbread.' },
  { name: 'Aloo Paratha', category: 'Roti', price: 60, description: 'Wheat paratha stuffed with spicy seasoned mashed potatoes.' },
  { name: 'Lacha Paratha', category: 'Roti', price: 50, description: 'Multi-layered flaky crispy golden paratha with ghee.' },

  // ─── NAAN & TANDOORI BREAD ───
  { name: 'Plain Naan', category: 'Naan', price: 80, description: 'Soft leavened flatbread baked in traditional clay oven.' },
  { name: 'Butter Naan', category: 'Naan', price: 90, description: 'Tandoor-baked soft naan glazed with rich melted butter.' },
  { name: 'Garlic Naan', category: 'Naan', price: 100, description: 'Aromatic tandoori naan topped with roasted garlic and coriander.' },
  { name: 'Karbo Naan', category: 'Naan', price: 110, description: 'Chef specialty savory spiced naan.' },
  { name: 'Masala Kulcha', category: 'Naan', price: 120, description: 'Leavened tandoori bread stuffed with spiced potato and herb filling.' },
  { name: 'Plain Tandoori Roti', category: 'Naan', price: 20, description: 'Clay oven baked crispy whole wheat roti.' },
  { name: 'Butter Tandoori Roti', category: 'Naan', price: 25, description: 'Hot tandoor baked wheat roti finished with melted butter.' },

  // ─── PANEER ───
  { name: 'Paneer Masala', category: 'Paneer', price: 120, description: 'Cottage cheese cubes simmered in spiced onion-tomato curry. (Half: ₹120 / Full: ₹200)' },
  { name: 'Butter Paneer', category: 'Paneer', price: 270, description: 'Rich butter-infused paneer cooked in velvety creamy makhani gravy.' },
  { name: 'Butter Paneer Masala', category: 'Paneer', price: 150, description: 'Cottage cheese cooked in rich butter and spiced tomato gravy. (Half: ₹150 / Full: ₹250)' },
  { name: 'Aloo Paneer', category: 'Paneer', price: 120, description: 'Homestyle combination of potatoes and soft paneer in gravy. (Half: ₹120 / Full: ₹220)' },
  { name: 'Chilly Paneer', category: 'Paneer', price: 110, description: 'Wok-tossed paneer with capsicum and green chillies in Indo-Chinese sauce. (Half: ₹110 / Full: ₹200)' },
  { name: 'Shahi Paneer', category: 'Paneer', price: 250, description: 'Royal Mughlai preparation of paneer in fragrant cashew and cream sauce.' },
  { name: 'Kadhai Paneer', category: 'Paneer', price: 130, description: 'Paneer tossed with bell peppers and crushed coriander in iron wok. (Half: ₹130 / Full: ₹250)' },
  { name: 'Paneer Lababdar', category: 'Paneer', price: 140, description: 'Luscious paneer cubes cooked in grated cheese and rich tomato gravy. (Half: ₹140 / Full: ₹260)' },
  { name: 'Paneer Kofta', category: 'Paneer', price: 130, description: 'Soft paneer dumplings simmered in savory spiced curry. (Half: ₹130 / Full: ₹220)' },
  { name: 'Matar Paneer', category: 'Paneer', price: 140, description: 'Classic green peas and cottage cheese simmered in spiced gravy. (Half: ₹140 / Full: ₹250)' },

  // ─── BIRYANI ───
  { name: 'Veg Biryani', category: 'Biryani', price: 150, description: 'Fragrant basmati rice layered with spiced vegetables, saffron and fried onions.' },
  { name: 'Paneer Biryani', category: 'Biryani', price: 170, description: 'Dum-cooked aromatic basmati rice with marinated paneer cubes and spices.' },
  { name: 'Egg Biryani', category: 'Biryani', price: 180, description: 'Rich layered biryani with boiled golden-fried eggs and caramelized onions.' },
  { name: 'Chicken Biryani', category: 'Biryani', price: 200, description: 'Traditional dum cooked biryani with tender marinated chicken and aromatics.' },
  { name: 'Hyderabadi Chicken Biryani', category: 'Biryani', price: 220, description: 'Authentic fiery Hyderabadi dum biryani with marinated bone-in chicken.' },
  { name: 'Chicken Dum Biryani', category: 'Biryani', price: 250, description: 'Chef special slow-cooked royal dum biryani with succulent chicken pieces.' },

  // ─── TANDOORI CHICKEN ───
  { name: 'Chicken Tikka Masala', category: 'Tandoori Chicken', price: 200, description: 'Smoky roasted chicken tikka cooked in rich spiced tomato-onion masala.' },
  { name: 'Tandoori Butter Chicken Masala', category: 'Tandoori Chicken', price: 200, description: 'Char-grilled tandoori chicken simmered in rich buttery gravy. (Half: ₹200 / Full: ₹380)' },
  { name: 'Tandoori Chicken', category: 'Tandoori Chicken', price: 250, description: 'Classic whole chicken marinated in yogurt and tandoori spices, char-grilled. (Half: ₹250 / Full: ₹450)' },
  { name: 'Chicken Tikka', category: 'Tandoori Chicken', price: 250, description: 'Boneless tender chicken skewers marinated in hung curd and red spices.' },
  { name: 'Chicken Kabab', category: 'Tandoori Chicken', price: 200, description: 'Minced chicken kebabs seasoned with fresh herbs and clay-oven roasted.' },
  { name: 'Paneer Tikka', category: 'Tandoori Chicken', price: 180, description: 'Cottage cheese cubes and bell peppers marinated and char-grilled.' },
  { name: 'Mushroom Tikka', category: 'Tandoori Chicken', price: 200, description: 'Button mushrooms seasoned with aromatic tandoori masala and roasted.' },

  // ─── NON VEG CURRIES & SPECIALS ───
  { name: 'Chicken Kolhapuri', category: 'Non Veg Curries', price: 150, description: 'Spicy Maharashtrian chicken curry with roasted coconut and dried red chillies. (Half: ₹150 / Full: ₹280)' },
  { name: 'Chicken Curry', category: 'Non Veg Curries', price: 120, description: 'Homestyle delicious tender chicken in savory onion-tomato broth. (Half: ₹120 / Full: ₹200)' },
  { name: 'Chicken Masala', category: 'Non Veg Curries', price: 140, description: 'Tender chicken braised in thick aromatic spiced Indian gravy. (Half: ₹140 / Full: ₹220)' },
  { name: 'Butter Chicken Masala', category: 'Non Veg Curries', price: 150, description: 'Chicken in creamy butter-tomato gravy with aromatic fenugreek. (Half: ₹150 / Full: ₹240)' },
  { name: 'Butter Chicken', category: 'Non Veg Curries', price: 270, description: 'Classic North Indian specialty in smooth, creamy, mildly sweet tomato sauce.' },
  { name: 'Chicken Hara Masala', category: 'Non Veg Curries', price: 250, description: 'Chicken cooked in fresh mint, coriander, and green chilli herb paste.' },
  { name: 'Chicken Kosha', category: 'Non Veg Curries', price: 140, description: 'Authentic Bengali style slow-cooked dry spiced chicken curry. (Half: ₹140 / Full: ₹220)' },
  { name: 'Chicken Handi', category: 'Non Veg Curries', price: 140, description: 'Clay handi simmered tender chicken in rich aromatic gravy. (Half: ₹140 / Full: ₹220)' },
  { name: 'Chicken Do Pyaza', category: 'Non Veg Curries', price: 130, description: 'Chicken prepared with double the onions in savory spiced masala. (Half: ₹130 / Full: ₹210)' },
  { name: 'Kadhai Chicken', category: 'Non Veg Curries', price: 160, description: 'Wok-cooked chicken with bell peppers, crushed coriander & black pepper. (Half: ₹160 / Full: ₹260)' },
  { name: 'Chilly Chicken Gravy', category: 'Non Veg Curries', price: 130, description: 'Juicy chicken chunks in tangy, spicy soya chilli garlic sauce. (Half: ₹130 / Full: ₹240)' },
  { name: 'Chilly Chicken Dry Fry', category: 'Non Veg Curries', price: 220, description: 'Crispy fried chicken tossed dry with bell peppers and green chillies.' },
  { name: 'Indian Chicken Dry Fry', category: 'Non Veg Curries', price: 240, description: 'Chef special pan-roasted chicken with roasted Indian spices and curry leaves.' },
  { name: 'Chicken Bharta', category: 'Non Veg Curries', price: 250, description: 'Shredded chicken in rich creamy egg-infused gravy, a Dhaba classic.' },
  { name: 'Butter Garlic Chicken (Dry)', category: 'Non Veg Curries', price: 250, description: 'Pan-seared tender chicken tossed with loads of golden garlic and butter.' },
  { name: 'Butter Gravy Chicken', category: 'Non Veg Curries', price: 250, description: 'Succulent chicken pieces cooked in rich buttery and silky tomato gravy.' },
  { name: 'Shahi Chicken', category: 'Non Veg Curries', price: 150, description: 'Royal Mughlai chicken preparation in cashew, almond, and saffron sauce. (Half: ₹150 / Full: ₹260)' },
  { name: 'Chicken Lababdar', category: 'Non Veg Curries', price: 150, description: 'Boneless chicken chunks in rich, velvety tomato and grated cheese gravy. (Half: ₹150 / Full: ₹260)' },
  { name: 'Egg Curry', category: 'Non Veg Curries', price: 110, description: 'Boiled golden fried eggs simmered in spiced onion and tomato gravy.' },
  { name: 'Egg Masala', category: 'Non Veg Curries', price: 120, description: 'Eggs cooked in thick, spicy, flavorful masala.' },
  { name: 'Omelet', category: 'Non Veg Curries', price: 50, description: 'Fluffy two-egg omelet made with fresh chopped onions, chillies, and herbs.' },
];

const seedAll = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log('Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      tls: true,
    });
    console.log(`✅ Connected to MongoDB Atlas host: ${conn.connection.host}`);

    // Drop old collections to ensure clean state
    console.log('🧹 Clearing old collections from database...');
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await Table.deleteMany({});
    await Order.deleteMany({});
    await Report.deleteMany({});
    console.log('✅ Collections cleared.');

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

    // ─── 1. CREATE SUPER ADMIN ───
    console.log('Creating Super Admin account...');
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@restropilot.com',
      password: 'adminpassword123',
      role: 'super_admin',
      approved: true,
      active: true,
      avatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=SuperAdmin',
    });
    console.log(`✅ Super Admin created: ${superAdmin.email}`);

    // ─── 2. CREATE BROTHERHOOD RESTAURANT ───
    console.log('\nCreating Brotherhood Lounge & Dining...');
    const brotherhoodOwner = await User.create({
      name: 'Brotherhood Manager',
      email: 'brotherhood@restropilot.com',
      password: 'password123',
      role: 'owner',
      approved: true,
      active: true,
      avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Brotherhood',
    });

    const brotherhood = await Restaurant.create({
      name: 'Brotherhood Lounge & Dining',
      description: 'Multi-Cuisine Casual Dining & Lounge • Chinese, Tandoori, Biryani, Sizzlers & Mocktails',
      logo: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
      ownerId: brotherhoodOwner._id,
      active: true,
    });

    brotherhoodOwner.restaurantId = brotherhood._id;
    await brotherhoodOwner.save();

    // Tables 1 to 5 for Brotherhood
    for (let t = 1; t <= 5; t++) {
      const qrContent = `${clientUrl}/restaurant/${brotherhood._id}/table/${t}`;
      const qrUrl = await QRCode.toDataURL(qrContent, { width: 400, margin: 2 });
      await Table.create({
        restaurantId: brotherhood._id,
        tableNumber: t,
        qrUrl,
      });
    }
    console.log('✅ Created Brotherhood restaurant and 5 tables.');

    // ─── 3. CREATE RAJ FOOD CENTRE (RFC) ───
    console.log('\nCreating RAJ FOOD CENTRE (RFC)...');
    const rfcOwner = await User.create({
      name: 'RFC Manager',
      email: 'rfc@restropilot.com',
      password: 'password123',
      role: 'owner',
      approved: true,
      active: true,
      avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=RajFoodCentre',
    });

    const rfc = await Restaurant.create({
      name: 'RAJ FOOD CENTRE (RFC)',
      description: 'Authentic Indian, Chinese & Tandoori Delicacies • Home delivery services available • Call/WhatsApp: 8099098657',
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80',
      ownerId: rfcOwner._id,
      active: true,
    });

    rfcOwner.restaurantId = rfc._id;
    await rfcOwner.save();

    // Tables 1 to 10 for RFC
    console.log('Generating Tables 1 to 10 with QR codes for RFC...');
    for (let t = 1; t <= 10; t++) {
      const qrContent = `${clientUrl}/restaurant/${rfc._id}/table/${t}`;
      const qrUrl = await QRCode.toDataURL(qrContent, { width: 400, margin: 2 });
      await Table.create({
        restaurantId: rfc._id,
        tableNumber: t,
        qrUrl,
      });
    }
    console.log('✅ Created 10 tables for RFC.');

    // Insert all RFC Menu Items
    const rfcDocs = rfcMenuItems.map((item) => ({
      ...item,
      restaurantId: rfc._id,
      available: true,
    }));
    const insertedRFC = await MenuItem.insertMany(rfcDocs);
    console.log(`✅ Successfully seeded ${insertedRFC.length} menu items for RAJ FOOD CENTRE (RFC)!`);

    console.log('\n========================================================');
    console.log('🎉 SEEDING COMPLETE WITH MONGODB ATLAS!');
    console.log('Super Admin: admin@restropilot.com / adminpassword123');
    console.log('Brotherhood: brotherhood@restropilot.com / password123');
    console.log('RFC (Raj Food Centre): rfc@restropilot.com / password123');
    console.log(`RFC Menu Items: ${insertedRFC.length}`);
    console.log('========================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedAll();
