// models/User.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelize } from '@/lib/sequelize';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  pass: string;
  role: 'superadmin' | 'admin' | 'member' | 'guest';
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Define attributes required for creation (id, createdAt, updatedAt are auto)
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// 3. Create the Sequelize Model
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public pass!: string;
  public role!: 'superadmin' | 'admin' | 'member' | 'guest';
  public status!: 'active' | 'inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 4. Initialize the model
const sequelize = getSequelize();

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        pass: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('superadmin', 'admin', 'member', 'guest'),
            allowNull: false,
            defaultValue: 'member',
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            allowNull: false,
            defaultValue: 'active',
        },
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
    }
);

export default User;
