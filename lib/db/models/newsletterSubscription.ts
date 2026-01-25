import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

interface NewsletterSubscriptionAttributes {
  id: string;
  email: string;
  status: 'subscribed' | 'unsubscribed';
  subscribedAt: Date;
  unsubscribedAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface NewsletterSubscriptionCreationAttributes
  extends Optional<NewsletterSubscriptionAttributes, 'id' | 'status' | 'subscribedAt' | 'unsubscribedAt' | 'ipAddress' | 'userAgent' | 'createdAt' | 'updatedAt'> {}

export class NewsletterSubscription
  extends Model<NewsletterSubscriptionAttributes, NewsletterSubscriptionCreationAttributes>
  implements NewsletterSubscriptionAttributes {
  public id!: string;
  public email!: string;
  public status!: 'subscribed' | 'unsubscribed';
  public subscribedAt!: Date;
  public unsubscribedAt!: Date | null;
  public ipAddress!: string | null;
  public userAgent!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NewsletterSubscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    status: {
      type: DataTypes.ENUM('subscribed', 'unsubscribed'),
      defaultValue: 'subscribed',
      allowNull: false,
    },
    subscribedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    unsubscribedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    modelName: 'NewsletterSubscription',
    tableName: 'newsletter_subscriptions',
    timestamps: true,
  }
);

export default NewsletterSubscription;
