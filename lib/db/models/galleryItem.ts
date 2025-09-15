import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

interface GalleryItemAttributes {
  id: string;
  imageUrl: string;
  alt: string;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface GalleryItemCreationAttributes extends Optional<GalleryItemAttributes, 'id' | 'sortOrder' | 'active' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export class GalleryItem extends Model<GalleryItemAttributes, GalleryItemCreationAttributes> implements GalleryItemAttributes {
  public id!: string;
  public imageUrl!: string;
  public alt!: string;
  public sortOrder!: number;
  public active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
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

export default GalleryItem;