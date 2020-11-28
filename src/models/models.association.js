import * as Models from '@models';

/**
 * Users
 */
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
Models.Users.belongsToMany(Models.Products, {
  foreignKey: 'userId',
  through: Models.ViewHistories,
  as: 'viewedProducts'
});
Models.Users.hasMany(Models.SalesOrders, { foreignKey: 'sellerId', as: 'seller' });
Models.Users.hasMany(Models.Notifications, { foreignKey: 'notifierId', as: 'notifications' });
Models.Users.hasOne(Models.Subscriptions, { foreignKey: 'userId', as: 'subscription' });
Models.Users.hasMany(Models.Preferences, {
  foreignKey: 'userId',
  as: 'preferences'
});

/**
 * Addresses
 */
Models.Addresses.belongsTo(Models.Users, { foreignKey: 'userId', as: 'user' });

/**
 * SalesOrders
 */
Models.SalesOrders.belongsTo(Models.Users, { foreignKey: 'userId', as: 'buyer' });
Models.SalesOrders.hasMany(Models.OrderItems, { foreignKey: 'salesOrderId', as: 'orderItems' });
Models.SalesOrders.belongsTo(Models.Addresses, { foreignKey: 'addressId', as: 'address' });
Models.SalesOrders.hasOne(Models.Reviews, { foreignKey: 'orderId', as: 'review' });
Models.SalesOrders.belongsTo(Models.ShippingFees, {
  foreignKey: 'shippingFeeId',
  as: 'shippingFee'
});
Models.SalesOrders.belongsTo(Models.Users, { foreignKey: 'sellerId', as: 'seller' });
Models.SalesOrders.hasOne(Models.Disputes, { foreignKey: 'orderId', as: 'dispute' });

/**
 * OrderItems
 */
Models.OrderItems.belongsTo(Models.SalesOrders, { foreignKey: 'salesOrderId', as: 'order' });
Models.OrderItems.belongsTo(Models.Products, { foreignKey: 'productId', as: 'product' });

/**
 * Products
 */
Models.Products.belongsTo(Models.Categories, { foreignKey: 'categoryId', as: 'category' });
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
Models.Products.belongsTo(Models.Brands, { foreignKey: 'brandId', as: 'brand' });
Models.Products.hasMany(Models.Galleries, { foreignKey: 'productId', as: 'photos' });
Models.Products.hasMany(Models.ProductColors, { foreignKey: 'productId', as: 'colors' });
Models.Products.belongsTo(Models.Sizes, { foreignKey: 'sizeId', as: 'size' });
Models.Products.belongsTo(Models.Conditions, { foreignKey: 'conditionId', as: 'condition' });

/**
 * Categories
 */
Models.Categories.hasMany(Models.Products, { foreignKey: 'categoryId', as: 'products' });
Models.Categories.hasMany(Models.Categories, { foreignKey: 'parentId', as: 'subCategories' });
Models.Categories.belongsTo(Models.Categories, { foreignKey: 'parentId', as: 'parentCategory' });
Models.Categories.belongsTo(Models.ShippingFees, {
  foreignKey: 'shippingFeeId',
  as: 'shippingFee'
});
Models.Categories.belongsToMany(Models.Sizes, {
  foreignKey: 'categoryId',
  through: Models.CategorySize,
  as: 'sizes'
});
Models.Categories.hasMany(Models.Preferences, {
  foreignKey: 'preferableId',
  constraints: false,
  as: 'preferences',
  scope: { preferableType: 'category' }
});

/**
 * Galleries
 */
Models.Galleries.belongsTo(Models.Products, { foreignKey: 'productId', as: 'product' });

/**
 * Reviews
 */
Models.Reviews.belongsTo(Models.SalesOrders, { foreignKey: 'orderId', as: 'order' });
Models.Reviews.belongsTo(Models.Users, { foreignKey: 'createdBy', as: 'buyer' });

/**
 * CartItems
 */
Models.CartItems.belongsTo(Models.Products, { foreignKey: 'productId', as: 'cartItem' });
Models.CartItems.belongsTo(Models.Users, { foreignKey: 'userId', as: 'cartOnwer' });

/**
 * Brands
 */
Models.Brands.hasMany(Models.Products, { foreignKey: 'brand_id', as: 'product' });
Models.Brands.hasMany(Models.Preferences, {
  foreignKey: 'preferableId',
  constraints: false,
  as: 'preferences',
  scope: { preferableType: 'brand' }
});

/**
 * Sizes
 */
Models.Sizes.belongsToMany(Models.Categories, {
  foreignKey: 'sizeId',
  through: Models.CategorySize,
  as: 'categories'
});
Models.Sizes.hasMany(Models.Products, { foreignKey: 'sizeId', as: 'products' });

/**
 * ShippingFees
 */
Models.ShippingFees.hasMany(Models.Categories, { foreignKey: 'shippingFeeId', as: 'category' });

/**
 * Enquiries
 */
Models.Enquiries.hasMany(Models.EnquiryImages, { foreignKey: 'enquiryId', as: 'images' });

/**
 * Disputes
 */
Models.Disputes.hasMany(Models.DisputesImages, { foreignKey: 'disputeId', as: 'images' });
Models.Disputes.belongsTo(Models.SalesOrders, { foreignKey: 'orderId', as: 'order' });
Models.Disputes.hasOne(Models.DisputeResponses, { foreignKey: 'disputeId', as: 'response' });

/**
 * DisputeImages
 */
Models.DisputesImages.belongsTo(Models.Disputes, { foreignKey: 'disputeId', as: 'dispute' });

/**
 * Notifications
 */

Models.Notifications.belongsTo(Models.Users, { foreignKey: 'notifierId', as: 'notifier' });
Models.Notifications.belongsTo(Models.Users, { foreignKey: 'actorId', as: 'actor' });
Models.Notifications.belongsTo(Models.Products, {
  foreignKey: 'notifiableId',
  as: 'product',
  constraints: false
});
Models.Notifications.belongsTo(Models.Disputes, {
  foreignKey: 'notifiableId',
  as: 'dispute',
  constraints: false
});
Models.Notifications.belongsTo(Models.SalesOrders, {
  foreignKey: 'notifiableId',
  as: 'order',
  constraints: false
});
Models.Notifications.belongsTo(Models.Reviews, {
  foreignKey: 'notifiableId',
  as: 'review',
  constraints: false
});

/**
 * DisputeResponses
 */
Models.DisputeResponses.hasMany(Models.ResponseImages, { foreignKey: 'responseId', as: 'images' });
Models.DisputeResponses.belongsTo(Models.Disputes, { foreignKey: 'disputeId', as: 'dispute' });

/**
 * ResponseImages
 */
Models.ResponseImages.belongsTo(Models.DisputeResponses, {
  foreignKey: 'responseId',
  as: 'response'
});

Models.FeatureItems.belongsTo(Models.Products, { foreignKey: 'productId', as: 'product' });

Models.Subscriptions.belongsTo(Models.Users, { foreignKey: 'userId', as: 'user' });
Models.Subscriptions.belongsTo(Models.Packages, { foreignKey: 'packageId', as: 'package' });

Models.Preferences.belongsTo(Models.Categories, {
  foreignKey: 'preferableId',
  as: 'category',
  constraints: false
});
Models.Preferences.belongsTo(Models.Brands, {
  foreignKey: 'preferableId',
  as: 'brand',
  constraints: false
});
Models.Preferences.belongsTo(Models.Conditions, {
  foreignKey: 'preferableId',
  as: 'condition',
  constraints: false
});

/**
 * Conditions
 */
Models.Conditions.hasMany(Models.Preferences, {
  foreignKey: 'preferableId',
  as: 'preferences',
  constraints: false,
  scope: { preferableType: 'condition' }
});
