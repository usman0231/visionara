import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../sequelize";

interface FAQAttributes {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface FAQCreationAttributes
  extends Optional<
    FAQAttributes,
    | "id"
    | "category"
    | "sortOrder"
    | "active"
    | "createdAt"
    | "updatedAt"
    | "deletedAt"
  > {}

export class FAQ
  extends Model<FAQAttributes, FAQCreationAttributes>
  implements FAQAttributes
{
  public id!: string;
  public question!: string;
  public answer!: string;
  public category!: string | null;
  public sortOrder!: number;
  public active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

FAQ.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
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
    modelName: "FAQ",
    tableName: "faqs",
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ["category"],
      },
      {
        fields: ["sortOrder"],
      },
      {
        fields: ["active"],
      },
    ],
  }
);

export default FAQ;
