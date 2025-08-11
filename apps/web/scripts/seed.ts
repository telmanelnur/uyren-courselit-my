/**
 * Database seeding script for CourseLit
 * This script creates a root domain and super admin user
 */

// Load environment variables from .env files
import dotenv from "dotenv";
import mongoose from "mongoose";
import { UIConstants } from "@workspace/common-models";
import constants from "../src/config/constants.js";

dotenv.config(); // Load .env as fallback

// Create a minimal DB connection function to avoid workspace import issues
async function connectToDatabase() {
  const MONGODB_URI =
    process.env.MONGODB_URI || process.env.DB_CONNECTION_STRING;
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI or DB_CONNECTION_STRING environment variable is required"
    );
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
}

// Define simplified schemas to avoid workspace import issues
const UserSchema = new mongoose.Schema(
  {
    domain: { type: mongoose.Schema.Types.ObjectId, required: true },
    userId: {
      type: String,
      required: true,
      default: () => Math.random().toString(36).substring(2, 15),
    },
    email: { type: String, required: true },
    active: { type: Boolean, required: true, default: true },
    name: { type: String, required: false },
    purchases: [{ type: mongoose.Schema.Types.Mixed }],
    bio: { type: String },
    permissions: [String],
    roles: [String],
    subscribedToUpdates: { type: Boolean, default: true },
    lead: { type: String, required: true, default: "website" },
    tags: [String],
    unsubscribeToken: {
      type: String,
      required: true,
      default: () => Math.random().toString(36).substring(2, 15),
    },
    avatar: { type: mongoose.Schema.Types.Mixed },
    invited: { type: Boolean },
    providerData: {
      type: {
        provider: { type: String, required: true },
        uid: { type: String, required: true },
        name: { type: String },
      },
      required: false,
    },
  },
  { timestamps: true }
);

UserSchema.index({ email: "text", name: "text" });
UserSchema.index({ domain: 1, email: 1 }, { unique: true });

const DomainSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    customDomain: { type: String, unique: true, sparse: true },
    email: { type: String, required: true },
    deleted: { type: Boolean, required: true, default: false },
    settings: {
      title: { type: String },
      subtitle: { type: String },
      logo: { type: mongoose.Schema.Types.Mixed },
      currencyISOCode: { type: String, maxlength: 3 },
      paymentMethod: { type: String },
      stripeKey: { type: String },
      codeInjectionHead: { type: String },
    },
    sharedWidgets: { type: mongoose.Schema.Types.Mixed, default: {} },
    draftSharedWidgets: { type: mongoose.Schema.Types.Mixed, default: {} },
    typefaces: [
      {
        section: { type: String },
        typeface: { type: String },
        fontWeights: [Number],
        fontSize: { type: Number },
        lineHeight: { type: Number },
        letterSpacing: { type: Number },
        case: { type: String },
      },
    ],
    draftTypefaces: [
      {
        section: { type: String },
        typeface: { type: String },
        fontWeights: [Number],
        fontSize: { type: Number },
        lineHeight: { type: Number },
        letterSpacing: { type: Number },
        case: { type: String },
      },
    ],
    firstRun: { type: Boolean, required: true, default: false },
    tags: { type: [String], default: [] },
    quota: {
      mail: {
        daily: { type: Number, default: 0 },
        monthly: { type: Number, default: 0 },
        dailyCount: { type: Number, default: 0 },
        monthlyCount: { type: Number, default: 0 },
        lastDailyCountUpdate: { type: Date, default: Date.now },
        lastMonthlyCountUpdate: { type: Date, default: Date.now },
      },
    },
  },
  { timestamps: true }
);

// Create models
const UserModel = mongoose.model("User", UserSchema);
const DomainModel = mongoose.model("Domain", DomainSchema);

// Simplified createUser function
async function createUser({
  domain,
  name,
  email,
  lead,
  superAdmin,
  subscribedToUpdates,
  invited,
  providerData,
  permissions = [],
}: {
  domain: {
    _id: string;
  };
  name: string;
  email: string;
  lead: string;
  superAdmin: boolean;
  subscribedToUpdates: boolean;
  invited?: boolean;
  providerData?: { provider: string; uid: string; name?: string };
  permissions?: string[];
}) {
  const superAdminPermissions = superAdmin
    ? [
        UIConstants.permissions.manageCourse,
        UIConstants.permissions.manageAnyCourse,
        UIConstants.permissions.publishCourse,
        UIConstants.permissions.manageMedia,
        UIConstants.permissions.manageSite,
        UIConstants.permissions.manageSettings,
        UIConstants.permissions.manageUsers,
        UIConstants.permissions.manageCommunity,
      ]
    : [
        UIConstants.permissions.enrollInCourse,
        UIConstants.permissions.manageMedia,
        ...permissions,
      ];

  const roles = superAdmin ? [UIConstants.roles.admin] : [];

  const userData = {
    $setOnInsert: {
      domain: domain._id,
      name,
      email: email.toLowerCase(),
      active: true,
      purchases: [],
      permissions: superAdminPermissions,
      roles,
      lead: lead || constants.leadWebsite,
      subscribedToUpdates,
      invited,
      providerData,
    },
  };

  const user = await UserModel.findOneAndUpdate(
    { domain: domain._id, email: email.toLowerCase() },
    userData,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return user;
}

/**
 * Creates or finds the root domain for single tenancy
 */
async function createRootDomain() {
  console.log("🌱 Creating or finding root domain...");

  const rootDomainName = constants.domainNameForSingleTenancy;
  let domain = await DomainModel.findOne({ name: rootDomainName });

  if (!domain) {
    console.log(`📝 Creating new domain: ${rootDomainName}`);

    const defaultSettings = {
      title: constants.schoolNameForSingleTenancy || "My Learning Platform",
      subtitle: "Welcome to your new learning platform",
      logo: null,
      currencyISOCode: "USD",
      paymentMethod: "stripe",
      stripeKey: "",
      codeInjectionHead: "",
    };

    domain = new DomainModel({
      name: rootDomainName,
      email: process.env.SUPER_ADMIN_EMAIL || "admin@example.com",
      deleted: false,
      firstRun: true,
      settings: defaultSettings,
      sharedWidgets: {},
      draftSharedWidgets: {},
      typefaces: [
        {
          section: "default",
          typeface: constants.typeface || "Roboto",
          fontWeights: [300, 400, 500, 700],
          fontSize: 0,
          lineHeight: 0,
          letterSpacing: 0,
          case: "captilize",
        },
      ],
      draftTypefaces: [
        {
          section: "default",
          typeface: constants.typeface || "Roboto",
          fontWeights: [300, 400, 500, 700],
          fontSize: 0,
          lineHeight: 0,
          letterSpacing: 0,
          case: "captilize",
        },
      ],
      tags: [],
      quota: {
        mail: {
          daily: 100,
          monthly: 1000,
          dailyCount: 0,
          monthlyCount: 0,
          lastDailyCountUpdate: new Date(),
          lastMonthlyCountUpdate: new Date(),
        },
      },
    });

    await domain.save();
    console.log(`✅ Created domain: ${rootDomainName} with ID: ${domain._id}`);
  } else {
    console.log(
      `✅ Found existing domain: ${rootDomainName} with ID: ${domain._id}`
    );
  }

  return domain;
}

/**
 * Creates or finds the super admin user
 */
async function createSuperAdmin(
  domain: mongoose.Document<any, any, any> & {
    _id: any;
    name: string;
    email: string;
    firstRun?: boolean;
  }
) {
  console.log("👤 Creating or finding super admin user...");

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminFirebaseUid = process.env.SUPER_ADMIN_FIREBASE_UID;

  if (!superAdminEmail) {
    console.error("❌ SUPER_ADMIN_EMAIL environment variable is required");
    console.log(
      "💡 Please set SUPER_ADMIN_EMAIL=your-email@example.com in your environment"
    );
    process.exit(1);
  }

  console.log(`📧 Using email: ${superAdminEmail}`);

  // Check if super admin already exists
  let existingAdmin = await UserModel.findOne({
    domain: domain._id,
    email: superAdminEmail.toLowerCase(),
  });

  if (existingAdmin) {
    console.log(`✅ Super admin already exists with ID: ${existingAdmin._id}`);
    console.log(
      `🔑 Current permissions: ${existingAdmin.permissions.join(", ")}`
    );
    console.log(
      `👥 Current roles: ${existingAdmin.roles?.join(", ") || "None"}`
    );
    return existingAdmin;
  }

  // Create super admin user
  console.log("👨‍💼 Creating new super admin user...");

  // Prepare provider data if Firebase UID is available
  const providerData = superAdminFirebaseUid
    ? {
        provider: "firebase",
        uid: superAdminFirebaseUid,
        name: process.env.SUPER_ADMIN_NAME || "Super Administrator",
      }
    : undefined;

  const superAdmin = await createUser({
    domain,
    name: process.env.SUPER_ADMIN_NAME || "Super Administrator",
    email: superAdminEmail,
    lead: constants.leadWebsite,
    superAdmin: true,
    subscribedToUpdates: true,
    invited: false,
    providerData,
  });

  console.log(`✅ Created super admin user with ID: ${superAdmin._id}`);
  console.log(`📧 Email: ${superAdmin.email}`);
  console.log(`👤 Name: ${superAdmin.name}`);
  console.log(`🔑 Permissions: ${superAdmin.permissions.join(", ")}`);
  console.log(`👥 Roles: ${superAdmin.roles.join(", ")}`);

  if (providerData) {
    console.log(
      `🔥 Firebase Provider: ${providerData.provider} (UID: ${providerData.uid})`
    );
  } else {
    console.log(
      "⚠️  No Firebase UID provided - you'll need to manually link this user in Firebase Auth"
    );
  }

  console.log("ℹ️  Note: Password authentication is handled by Firebase Auth");
  console.log(
    "ℹ️  Please set up the user in Firebase Auth console with the same email"
  );

  return superAdmin;
}

/**
 * Seeds additional default data
 */
async function seedDefaultData(
  domain: Awaited<ReturnType<typeof createRootDomain>>,
  superAdmin: Awaited<ReturnType<typeof createSuperAdmin>>
) {
  console.log("🌱 Seeding default data...");

  // Update domain first run status
  if (domain.firstRun) {
    await DomainModel.findByIdAndUpdate(domain._id, { firstRun: false });
    console.log("✅ Updated domain firstRun status to false");
  }

  // Add any additional default data seeding here
  // Examples: default pages, themes, courses, etc.

  console.log("✅ Default data seeding completed");
}

/**
 * Main seeding function
 */
async function seed(): Promise<void> {
  try {
    console.log("🚀 Starting database seeding for CourseLit...");
    console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🗄️  Database: Using MONGODB_URI from environment`);

    // Connect to database
    await connectToDatabase();
    console.log("✅ Connected to MongoDB successfully");

    // Create root domain
    const domain = await createRootDomain();

    // Create super admin
    const superAdmin = await createSuperAdmin(domain);

    // Seed default data
    await seedDefaultData(domain, superAdmin);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`  - Domain: ${domain.name} (${domain._id})`);
    console.log(`  - Super Admin: ${superAdmin.email} (${superAdmin._id})`);
    console.log(
      `  - Permissions: ${superAdmin.permissions.length} permissions assigned`
    );
    console.log(`  - Roles: ${superAdmin.roles.join(", ")}`);
    console.log(`  - First Run: ${domain.firstRun ? "Yes" : "No"}`);

    console.log("\n🔐 Next Steps for Authentication Setup:");
    console.log("1. Go to your Firebase Console");
    console.log("2. Navigate to Authentication > Users");
    console.log(`3. Create a user with email: ${superAdmin.email}`);
    console.log("4. Set a secure password for the user");
    console.log("5. The user will automatically have admin permissions");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    if (error instanceof Error && error.stack) {
      console.error("📍 Stack trace:", error.stack);
    }
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("🔌 Database connection closed");
    }
    process.exit(0);
  }
}

seed();
