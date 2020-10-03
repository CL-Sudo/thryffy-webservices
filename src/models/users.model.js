import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, active } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { hashPassword, comparePassword } from '@tools/bcrypt';
import { Products, Reviews, FavouriteProducts, Brands } from '@models';
import R from 'ramda';
import { Op } from 'sequelize';
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
    // fullName: {
    //   type: Sequelize.VIRTUAL,
    //   get() {
    //     const { firstName, lastName } = this;
    //     switch (true) {
    //       case R.isNil(firstName) && R.not(R.isNil(lastName)):
    //         return lastName;
    //       case R.not(R.isNil(firstName)) && R.isNil(lastName):
    //         return firstName;
    //       case R.isNil(firstName) && R.isNil(lastName):
    //         return null;
    //       default:
    //         return `${firstName} ${lastName}`;
    //     }
    //   },
    //   set(fullName) {
    //     const { firstName, lastName } = parseFirstNameLastName(fullName);
    //     this.setDataValue('firstName', firstName);
    //     this.setDataValue('lastName', lastName);
    //   }
    // },
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
    reviewCount: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.getDataValue('reviewQuantity');
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
    defaultScope: { attributes: { exclude: ['password'] } },
    scopes: {
      search: params => search(Users, params, []),
      cart(productIds) {
        return {
          attributes: ['fullName', 'username', 'profilePicture'],
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
                }
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
      }
    },
    hooks: {
      beforeCreate: async user => {
        if (user.password) {
          user.password = hashPassword(user.password);
        }
      },
      beforeFind: query => {
        parseParanoidToIncludes(query);
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
};

Users.prototype.getEarnings = async function() {
  try {
    const products = await Products.findAll({
      where: {
        id: {
          [Op.in]: [
            Sequelize.literal(`
            SELECT product_id from order_items
            WHERE sales_order_id IN (
              SELECT id FROM sales_orders
              WHERE
              payment_status = '${PAYMENT_STATUS.SUCCESS}'
              AND
              delivery_status = '${DELIVERY_STATUS.COMPLETED}'
            )
          `)
          ]
        },
        userId: this.id
      }
    });

    const prices = R.map(R.prop('price'))(products);

    const earning = R.cond([
      [R.isEmpty, R.always(0)],
      [R.T, R.sum]
    ])(prices);

    this.setDataValue('earning', earning);
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
