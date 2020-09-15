import * as Models from '@models';

Models.Users.hasMany(Models.Addresses, { foreignKey: 'userId', as: 'addresses' });
Models.Users.hasMany(Models.SalesOrders, { foreignKey: 'userId', as: 'orders' });
Models.Users.hasMany(Models.Products, { foreignKey: 'userId', as: 'products' });
Models.Users.belongsToMany(Models.Products, {
  foreignKey: 'userId',
  through: Models.CartItems,
  as: 'cartItems'
});
Models.Users.belongsToMany(Models.Products, {
  foreignKey: 'userId',
  through: Models.FavouriteProducts,
  as: 'favouriteProducts'
});

Models.Addresses.belongsTo(Models.Users, { foreignKey: 'userId', as: 'user' });

Models.SalesOrders.belongsTo(Models.Users, { foreignKey: 'userId', as: 'buyer' });
Models.SalesOrders.hasMany(Models.OrderItems, { foreignKey: 'salesOrderId', as: 'orderItems' });
Models.SalesOrders.belongsTo(Models.Addresses, { foreignKey: 'addressId', as: 'address' });

Models.OrderItems.belongsTo(Models.SalesOrders, { foreignKey: 'salesOrderId', as: 'order' });
Models.OrderItems.belongsTo(Models.Products, { foreignKey: 'productId', as: 'product' });
Models.OrderItems.hasOne(Models.Reviews, { foreignKey: 'orderItemId', as: 'review' });

Models.Products.belongsTo(Models.Categories, { foreignKey: 'categoryId', as: 'categories' });
Models.Products.belongsToMany(Models.Users, {
  foreignKey: 'productId',
  through: Models.FavouriteProducts,
  as: 'likers'
});
Models.Products.belongsToMany(Models.Users, {
  foreignKey: 'productId',
  through: Models.CartItems,
  as: 'cartOwners'
});
Models.Products.belongsTo(Models.Users, { foreignKey: 'userId', as: 'seller' });
Models.Products.hasMany(Models.Galleries, { foreignKey: 'productId', as: 'photos' });
Models.Products.hasMany(Models.ProductColors, { foreignKey: 'productId', as: 'colors' });

Models.Categories.hasMany(Models.Products, { foreignKey: 'categoryId', as: 'products' });
Models.Categories.hasMany(Models.Categories, { foreignKey: 'parentId', as: 'subCategories' });
Models.Categories.belongsTo(Models.Categories, { foreignKey: 'parentId', as: 'parentCategory' });

Models.Galleries.belongsTo(Models.Products, { foreignKey: 'productId', as: 'product' });

Models.Reviews.belongsTo(Models.OrderItems, { foreignKey: 'orderItemId', as: 'orderItem' });
Models.Reviews.belongsTo(Models.Users, { foreignKey: 'createdBy', as: 'buyer' });

Models.CartItems.belongsTo(Models.Products, { foreignKey: 'productId', as: 'cartItem' });
Models.CartItems.belongsTo(Models.Users, { foreignKey: 'userId', as: 'cartOnwer' });
