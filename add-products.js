const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/ecommerce')
  .then(async () => {
    console.log('✅ Подключено к MongoDB');
    
    const productSchema = new mongoose.Schema({
      name: String,
      description: String,
      price: Number,
      category: String,
      stock: Number,
      rating: { type: Number, default: 4.5 }
    });
    
    const Product = mongoose.model('Product', productSchema);
    
    // Очищаем старые товары
    await Product.deleteMany({});
    console.log('🗑️ Старые товары удалены');
    
    // Добавляем новые товары
    const products = [
      { name: "💻 Ноутбук ASUS", price: 69999, category: "Electronics", stock: 10, description: "15.6 дюймов, Core i5, 8GB RAM" },
      { name: "📱 Samsung Galaxy S23", price: 79999, category: "Electronics", stock: 15, description: "128GB, 8GB RAM, 50MP камера" },
      { name: "📚 Книга JavaScript", price: 2499, category: "Books", stock: 50, description: "Изучение программирования с нуля" },
      { name: "🎧 Наушники Sony WH-1000XM4", price: 29999, category: "Electronics", stock: 8, description: "Беспроводные, шумоподавление" },
      { name: "👕 Футболка Nike", price: 3999, category: "Clothing", stock: 25, description: "Спортивная, хлопок" },
      { name: "⌚ Apple Watch Series 8", price: 39999, category: "Electronics", stock: 12, description: "GPS, 45mm" },
      { name: "🎮 PlayStation 5", price: 49999, category: "Gaming", stock: 5, description: "Digital Edition" },
      { name: "🖥️ Монитор Samsung", price: 34999, category: "Electronics", stock: 7, description: "27 дюймов, 4K UHD" }
    ];
    
    await Product.insertMany(products);
    console.log(`✅ УСПЕХ! Добавлено ${products.length} товаров!`);
    console.log('\n📦 ТОВАРЫ:');
    products.forEach(p => console.log(`   ${p.name} - ${p.price}₽`));
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Ошибка:', err);
  });