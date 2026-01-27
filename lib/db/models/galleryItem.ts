import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';
import { Service } from './service';

interface GalleryItemAttributes {
  id: string;
  imageUrl: string;
  alt: string;
  serviceId: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface GalleryItemCreationAttributes extends Optional<GalleryItemAttributes, 'id' | 'serviceId' | 'sortOrder' | 'active' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export class GalleryItem extends Model<GalleryItemAttributes, GalleryItemCreationAttributes> implements GalleryItemAttributes {
  declare id: string;
  declare imageUrl: string;
  declare alt: string;
  declare serviceId: string | null;
  declare sortOrder: number;
  declare active: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;

  // Association
  public service?: {
    id: string;
    title: string;
  };
}

GalleryItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    alt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    serviceId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'service_id',
      references: {
        model: 'services',
        key: 'id',
      },
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'GalleryItem',
    tableName: 'gallery_items',
    timestamps: true,
    paranoid: true,
  }
);

// Associations
GalleryItem.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
Service.hasMany(GalleryItem, { foreignKey: 'serviceId', as: 'galleryItems' });

export default GalleryItem;