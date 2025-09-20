import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../sequelize";

export enum AboutSection {
  HERO = "hero",
  STORY = "story",
  VALUES = "values",
  SERVICES = "services",
  TECH = "tech",
  TESTIMONIALS = "testimonials",
  CTA = "cta",
}

interface AboutContentAttributes {
  id: string;
  section: AboutSection;
  title: string;
  subtitle: string | null;
  content: Record<string, any>;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface AboutContentCreationAttributes
  extends Optional<
    AboutContentAttributes,
    | "id"
    | "subtitle"
    | "sortOrder"
    | "active"
    | "createdAt"
    | "updatedAt"
    | "deletedAt"
  > {}

export class AboutContent
  extends Model<AboutContentAttributes, AboutContentCreationAttributes>
  implements AboutContentAttributes
{
  public id!: string;
  public section!: AboutSection;
  public title!: string;
  public subtitle!: string | null;
  public content!: Record<string, any>;
  public sortOrder!: number;
  public active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

AboutContent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    section: {
      type: DataTypes.ENUM(...Object.values(AboutSection)),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    content: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
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
    modelName: "AboutContent",
    tableName: "about_content",
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ["section", "sortOrder"],
      },
      {
        fields: ["active"],
      },
    ],
  }
);

export default AboutContent;
