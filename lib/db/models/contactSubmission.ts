import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

interface ContactSubmissionAttributes {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  serviceType: string | null;
  budget: string | null;
  timeline: string | null;
  message: string;
  status: 'pending' | 'replied' | 'archived';
  replyMessage: string | null;
  repliedAt: Date | null;
  repliedBy: string | null;
  meta: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface ContactSubmissionCreationAttributes extends Optional<ContactSubmissionAttributes, 'id' | 'company' | 'phone' | 'serviceType' | 'budget' | 'timeline' | 'status' | 'replyMessage' | 'repliedAt' | 'repliedBy' | 'meta' | 'createdAt' | 'updatedAt'> {}

export class ContactSubmission extends Model<ContactSubmissionAttributes, ContactSubmissionCreationAttributes> implements ContactSubmissionAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public company!: string | null;
  public phone!: string | null;
  public serviceType!: string | null;
  public budget!: string | null;
  public timeline!: string | null;
  public message!: string;
  public status!: 'pending' | 'replied' | 'archived';
  public replyMessage!: string | null;
  public repliedAt!: Date | null;
  public repliedBy!: string | null;
  public meta!: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ContactSubmission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    serviceType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    budget: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timeline: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'replied', 'archived'),
      defaultValue: 'pending',
      allowNull: false,
    },
    replyMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    repliedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    repliedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    meta: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ContactSubmission',
    tableName: 'contact_submissions',
    timestamps: true,
  }
);

export default ContactSubmission;