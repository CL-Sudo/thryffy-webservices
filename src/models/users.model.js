import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import {
  AT_RECORDER,
  BY_RECORDER,
  primaryKey,
  active,
  defaultExcludeFields
} from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { hashPassword, comparePassword } from '@tools/bcrypt';
import {
  Products,
  FavouriteProducts,
  Brands,
  SalesOrders,
  OrderItems,
  ShippingFees,
  Sizes
} from '@models';

import { Reviews } from '@models/reviews.model';
import { NotificationSettings } from '@models/notification_settings.model';

import R from 'ramda';
import { PAYMENT_STATUS, DELIVERY_STATUS } from '@constants';

const Users = SequelizeConnector.define(
  'Users',
  {
    id: primaryKey,
    username: {
      type: Sequelize.STRING(100)
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.STRING
    },
    firstName: {
      type: Sequelize.STRING(100),
      field: 'first_name'
    },
    lastName: {
      type: Sequelize.STRING(100),
      field: 'last_name'
    },
    fullName: {
      type: Sequelize.STRING(150),
      field: 'full_name'
    },
    state: {
      type: Sequelize.STRING(100)
    },
    country: {
      type: Sequelize.STRING(100)
    },
    location: {
      type: Sequelize.VIRTUAL,
      set(location) {
        const splitted = R.map(R.trim, R.split(',')(location));
        const state = splitted[0];
        const country = R.last(splitted);
        this.setDataValue('state', state);
        this.setDataValue('country', country);
      },
      get() {
        const { state, country } = this;
        if (!state && !country) return null;
        return `${state}, ${country}`;
      }
    },
    phoneCountryCode: {
      type: Sequelize.STRING(5),
      field: 'phone_country_code'
    },
    phoneNumber: {
      type: Sequelize.STRING(25),
      field: 'phone_number'
    },
    completePhoneNumber: {
      type: Sequelize.VIRTUAL,
      get() {
        return `${this.phoneCountryCode}${this.phoneNumber}`;
      }
    },
    dateOfBirth: {
      type: Sequelize.DATEONLY(),
      field: 'date_of_birth'
    },
    facebookId: {
      type: Sequelize.STRING,
      field: 'facebook_id'
    },
    googleId: {
      type: Sequelize.STRING,
      field: 'google_id'
    },
    deviceToken: {
      type: Sequelize.STRING,
      field: 'device_token'
    },
    profilePicture: {
      type: Sequelize.STRING,
      field: 'profile_picture'
    },
    otp: {
      type: Sequelize.STRING(20)
    },
    otpValidity: {
      type: Sequelize.DATE,
      field: 'otp_validity'
    },
    isVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      field: 'is_verified'
    },
    active,
    refreshToken: {
      type: Sequelize.STRING,
      field: 'refresh_token'
    },
    resetToken: {
      type: Sequelize.STRING,
      field: 'reset_token'
    },
    loginFrequency: {
      type: Sequelize.INTEGER,
      field: 'login_frequency'
    },
    lastLogin: {
      type: Sequelize.DATE,
      field: 'last_login'
    },
    hasValidSubscription: {
      type: Sequelize.BOOLEAN,
      field: 'has_valid_subscription',
      defaultValue: false
    },
    beneficiaryName: {
      type: Sequelize.STRING(100),
      field: 'beneficiary_name'
    },
    beneficiaryBank: {
      type: Sequelize.STRING(50),
      field: 'beneficiary_bank'
    },
    beneficiaryPhoneNo: {
      type: Sequelize.STRING(30),
      field: 'beneficiary_phone_no'
    },
    bankAccountNo: {
      type: Sequelize.STRING(50),
      field: 'bank_account_no'
    },
    reviewCount: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.getDataValue('reviewCount');
      }
    },
    averageRating: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.getDataValue('averageRating');
      }
    },
    earning: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.getDataValue('earning');
      }
    },
    totalView: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.getDataValue('totalView');
      }
    },
    totalLike: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.getDataValue('totalLike');
      }
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'users',
    underscored: false,
    defaultScope: {
      attributes: { exclude: ['password'] },
      include: [{ model: NotificationSettings, as: 'notificationSetting' }]
    },
    scopes: {
      search: params => search(Users, params, []),
      cart(productIds) {
        return {
          attributes: ['id', 'fullName', 'username', 'profilePicture'],
          include: [
            {
              model: Products,
              as: 'products',
              where: {
                id: productIds
              },
              include: [
                {
                  model: Brands,
                  as: 'brand',
                  attributes: ['id', 'title']
                },
                { model: Sizes, as: 'size', attributes: { exclude: defaultExcludeFields } }
              ]
            }
          ]
        };
      },
      editProfile(userId) {
        return {
          where: { id: userId },
          attributes: [
            'id',
            'username',
            'fullName',
            'email',
            'phoneNumber',
            'location',
            'state',
            'country',
            'dateOfBirth',
            'profilePicture'
          ]
        };
      },
      order: {
        attributes: ['id', 'username', 'state', 'reviewCount', 'averageRating', 'profilePicture']
      },
      sellerDetail: {
        attributes: {
          exclude: [
            'password',
            'facebookId',
            'googleId',
            'deviceToken',
            'otp',
            'otpValidity',
            'refreshToken',
            'resetToken',
            'loginFrequency',
            'lastLogin',
            ...defaultExcludeFields
          ]
        },
        include: [
          {
            model: Reviews,
            as: 'buyerReviews'
          }
        ]
      }
    },
    hooks: {
      beforeCreate: async user => {
        if (user.password) {
          user.password = hashPassword(user.password);
        }
      },
      afterCreate: async (user, options) => {
        try {
          const { transaction } = options;
          await NotificationSettings.create({ userId: user.id }, { transaction });
        } catch (e) {
          throw e;
        }
      },
      beforeFind: query => {
        parseParanoidToIncludes(query);
      },
      afterFind: async user => {
        if (!R.isNil(user) && !R.isEmpty(user)) {
          if (!Array.isArray(user)) user = [user];
          await Promise.all(
            user.map(async instance => {
              await instance.getAverageRating();
              await instance.getReviewCount();
              await instance.getEarnings();
              await instance.getTotalLike();
              await instance.getTotalView();
            })
          );
        }
      }
    }
  }
);

addScopesByAllFields(Users, []);

Users.prototype.comparePassword = async function(password) {
  const match = await comparePassword(password, this.password);
  return match;
};

Users.prototype.getReviewCount = async function() {
  const reviewCount = await Reviews.count({ where: { sellerId: this.id } });
  this.setDataValue('reviewCount', reviewCount);
};

Users.prototype.getAverageRating = async function() {
  const reviews = await Reviews.findAll({ where: { sellerId: this.id } });
  const getRating = R.map(R.prop('rating'));
  const averageRating = R.pipe(getRating, R.mean)(reviews);

  this.setDataValue('averageRating', averageRating);
  return averageRating;
};

Users.prototype.getEarnings = async function() {
  try {
    const sales = await SalesOrders.findAll({
      where: {
        id: [
          Sequelize.literal(
            `SELECT id FROM order_items
              WHERE product_id IN (
                SELECT id FROM products
                WHERE user_id = ${this.id}
          )`
          )
        ],
        paymentStatus: PAYMENT_STATUS.SUCCESS,
        deliveryStatus: DELIVERY_STATUS.COMPLETED
      },
      include: [
        {
          model: OrderItems,
          as: 'orderItems',
          include: [
            {
              model: Products,
              as: 'product'
            }
          ]
        },
        {
          model: ShippingFees,
          as: 'shippingFee'
        }
      ]
    });

    const productOriginalPrices = R.pipe(
      R.map(R.prop('orderItems')),
      R.flatten,
      R.map(R.prop('product')),
      R.map(R.prop('originalPrice'))
    )(sales);

    const shippingFees = R.map(R.path(['shippingFee', 'actualPrice']))(sales);

    // const commission = R.sum(
    //   await Promise.all(
    //     sales.map(async sale => {
    //       console.log('sale', sale);
    //       const c = await sale.getCommission();
    //       return c;
    //     })
    //   )
    // );

    const commission = R.sum(R.map(R.prop('commission'))(sales));

    const earning = R.sum(productOriginalPrices) + R.sum(shippingFees) - commission;
    this.setDataValue('earning', Number(earning.toFixed(2)));
    return Number(earning.toFixed(2));
  } catch (e) {
    throw e;
  }
};

Users.prototype.getTotalView = async function() {
  try {
    const products = await Products.findAll({
      attributes: ['id', 'viewCount'],
      raw: true,
      where: { userId: this.id }
    });

    const getViewCount = R.map(R.prop('viewCount'))(products);

    const totalView = R.cond([
      [R.isEmpty, R.always(0)],
      [R.T, R.sum]
    ])(getViewCount);

    this.setDataValue('totalView', totalView);
  } catch (e) {
    throw e;
  }
};

Users.prototype.getTotalLike = async function() {
  try {
    const products = await Products.findAll({ raw: true, where: { userId: this.id } });
    const productIds = R.map(R.prop('id'))(products);

    const totalLike = await FavouriteProducts.count({ where: { productId: productIds } });

    this.setDataValue('totalLike', totalLike);
  } catch (e) {
    throw e;
  }
};

Users.prototype.getExtraFields = async function() {
  await this.getReviewCount();
  await this.getAverageRating();
  await this.getEarnings();
  await this.getTotalView();
  await this.getTotalLike();
};

export { Users };
export default Users;
