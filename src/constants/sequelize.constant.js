import { Sequelize } from '@configs/sequelize-connector.config';

export const primaryKey = {
  type: Sequelize.INTEGER.UNSIGNED,
  autoIncrement: true,
  primaryKey: true
};

export const foreignKey = (
  field,
  model,
  { referenceKey = 'id', onDelete = null, onUpdate = 'CASCADE', allowNull = true } = {}
) => ({
  type: Sequelize.INTEGER.UNSIGNED,
  allowNull,
  field,
  references: {
    model,
    key: referenceKey
  },
  onDelete,
  onUpdate
});

export const AT_RECORDER = {
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'updated_at'
  },
  deletedAt: {
    type: Sequelize.DATE,
    allowNull: true,
    field: 'deleted_at'
  }
};

export const BY_RECORDER = {
  createdBy: {
    type: Sequelize.INTEGER.UNSIGNED,
    field: 'created_by',
    allowNull: true
  },
  updatedBy: {
    type: Sequelize.INTEGER.UNSIGNED,
    field: 'updated_by',
    allowNull: true
  },
  deletedBy: {
    type: Sequelize.INTEGER.UNSIGNED,
    field: 'deleted_by',
    allowNull: true
  }
};

export const STATUS = {
  ACTIVE: 'Active',
  FREEZE: 'Freeze'
};

export const defaultExcludeFields = [
  'createdAt',
  'deletedAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'deletedBy'
];

export const active = {
  type: Sequelize.BOOLEAN,
  allowNull: false,
  defaultValue: true
};
