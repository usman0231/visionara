import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';
import { Service } from './service';

interface ProjectAttributes {
  id: string;
  title: string;
  description: string | null;
  serviceId: string | null;
  coverImage: string;
  priority: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface ProjectCreationAttributes extends Optional<ProjectAttributes, 'id' | 'description' | 'serviceId' | 'priority' | 'active' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
  declare id: string;
  declare title: string;
  declare description: string | null;
  declare serviceId: string | null;
  declare coverImage: string;
  declare priority: number;
  declare active: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;

  // Associations
  public service?: {
    id: string;
    title: string;
  };
  public images?: ProjectImage[];
}

// ProjectImage model
interface ProjectImageAttributes {
  id: string;
  projectId: string;
  imageUrl: string;
  alt: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectImageCreationAttributes extends Optional<ProjectImageAttributes, 'id' | 'sortOrder' | 'createdAt' | 'updatedAt'> {}

export class ProjectImage extends Model<ProjectImageAttributes, ProjectImageCreationAttributes> implements ProjectImageAttributes {
  declare id: string;
  declare projectId: string;
  declare imageUrl: string;
  declare alt: string;
  declare sortOrder: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

// Initialize Project model
Project.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    coverImage: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'cover_image',
    },
    priority: {
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
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at',
    },
  },
  {
    sequelize,
    modelName: 'Project',
    tableName: 'projects',
    timestamps: true,
    paranoid: true,
  }
);

// Initialize ProjectImage model
ProjectImage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'project_id',
      references: {
        model: 'projects',
        key: 'id',
      },
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'image_url',
    },
    alt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: 'ProjectImage',
    tableName: 'project_images',
    timestamps: true,
  }
);

// Associations
Project.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
Service.hasMany(Project, { foreignKey: 'serviceId', as: 'projects' });

Project.hasMany(ProjectImage, { foreignKey: 'projectId', as: 'images', onDelete: 'CASCADE' });
ProjectImage.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

export default Project;
