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
  meta: Record<string, any>;
  createdAt: Date;
}

interface ContactSubmissionCreationAttributes extends Optional<ContactSubmissionAttributes, 'id' | 'company' | 'phone' | 'serviceType' | 'budget' | 'timeline' | 'meta' | 'createdAt'> {}

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
  public meta!: Record<string, any>;
  public readonly createdAt!: Date;
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
    meta: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ContactSubmission',
    tableName: 'contact_submissions',
    timestamps: false,
    updatedAt: false,
  }
);

export default ContactSubmission;