import * as Models from '@models';

Models.Users.hasMany(Models.Addresses, { foreignKey: 'userId', as: 'addresses' });
Models.Users.hasMany(Models.SalesOrders, { foreignKey: 'userId', as: 'orders' });
Models.Users.hasMany(Models.Products, { foreignKey: 'userId', as: 'products' });
Models.Users.hasMany(Models.CartItems, { foreignKey: 'userId', as: 'cartItems' });
Models.Users.hasMany(Models.FavouriteProducts, { foreignKey: 'productId', as: 'favouriteProducts' });

Models.Addresses.belongsTo(Models.Users, { foreignKey: 'userId', as: 'user' });

Models.SalesOrders.belongsTo(Models.Users, { foreignKey: 'userId', as: 'buyer' });
Models.SalesOrders.hasMany(Models.OrderItems, { foreignKey: 'saleOrderId', as: 'orderItems' });

Models.OrderItems.belongsTo(Models.SalesOrders, { foreignKey: 'salesOrderId', as: 'order' });
Models.OrderItems.belongsTo(Models.Products, { foreignKey: 'productId', as: 'product' });
Models.OrderItems.hasOne(Models.Reviews, { foreignKey: 'orderItemId', as: 'review' });

Models.Products.belongsTo(Models.Categories, { foreignKey: 'categoryId', as: 'category' });
Models.Products.belongsTo(Models.Users, { foreignKey: 'userId', as: 'seller' });
Models.Products.hasMany(Models.Galleries, { foreignKey: 'productId', as: 'photos' });
Models.Products.belongsToMany(Models.Subcategories, { foreignKey: 'productId', through: Models.ProductsSubcategories, as: 'subcategories' });
Models.Products.hasMany(Models.ProductColors, { foreignKey: 'productId', as: 'colors' });

Models.Categories.hasMany(Models.Products, { foreignKey: 'categoryId', as: 'products' });

Models.CartItems.belongsTo(Models.Users, { foreignKey: 'userId', as: 'buyer' });
Models.CartItems.belongsTo(Models.Products, { foreignKey: 'productId', as: 'product' });

Models.Galleries.belongsTo(Models.Products, { foreignKey: 'productId', as: 'product' });

Models.Subcategories.belongsToMany(Models.Products, { foreignKey: 'subcategoryId', through: Models.ProductsSubcategories, as: 'products' });

Models.Reviews.belongsTo(Models.OrderItems, { foreignKey: 'orderItemId', as: 'orderItem' });

Models.FavouriteProducts.belongsTo(Models.Products, { foreignKey: 'productId', as: 'product' });
