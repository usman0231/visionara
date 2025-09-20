import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';
import User from './user';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  PUBLISH = 'PUBLISH',
  LOGIN = 'LOGIN',
  SETUP = 'SETUP'
}

interface AuditLogAttributes {
  id: string;
  actorUserId: string | null;
  entity: string;
  entityId: string | null;
  action: AuditAction;
  diff: Record<string, any>;
  createdAt: Date;
}

interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'createdAt'> {}

export class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  public id!: string;
  public actorUserId!: string | null;
  public entity!: string;
  public entityId!: string | null;
  public action!: AuditAction;
  public diff!: Record<string, any>;
  public readonly createdAt!: Date;

  // Associations
  public actor?: User;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    actorUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    entity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    action: {
      type: DataTypes.ENUM(...Object.values(AuditAction)),
      allowNull: false,
    },
    diff: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    timestamps: false,
    updatedAt: false,
  }
);

// Associations
AuditLog.belongsTo(User, { foreignKey: 'actorUserId', as: 'actor' });

export default AuditLog;