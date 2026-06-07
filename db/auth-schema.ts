import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, date, numeric, unique, integer } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  username: text("username").unique(),
  displayUsername: text("display_username"),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const children = pgTable(
  "children",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    bornDate: date("born_date").notNull(),
    fatherName: text("father_name").notNull(),
    motherName: text("mother_name").notNull(),
    address: text("address").notNull(),
    gender: text("gender", { enum: ["laki-laki", "perempuan"] }).notNull(),
    bornWeight: numeric("born_weight", { precision: 5, scale: 2 }).notNull(),
    bornLength: numeric("born_length", { precision: 5, scale: 2 }).notNull(),
    bornCircumference: numeric("born_circumference", { precision: 5, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("children_name_father_mother_unique").on(
      table.name,
      table.fatherName,
      table.motherName
    ),
  ]
);

export const childGrowth = pgTable(
  "child_growth",
  {
    id: text("id").primaryKey(),
    childId: text("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    month: integer("month").notNull(), // pure counter: 1, 2, 3...
    weight: numeric("weight", { precision: 5, scale: 2 }),
    length: numeric("length", { precision: 5, scale: 2 }),
    headCircumference: numeric("head_circumference", { precision: 5, scale: 2 }),
    status: text("status", { enum: ["up", "down", "stale"] }),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("child_growth_child_id_idx").on(table.childId),
    unique("child_growth_child_month_unique").on(table.childId, table.month),
  ]
);

export const childImmunization = pgTable(
  "child_immunization",
  {
    id: text("id").primaryKey(),
    childId: text("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["vitamin", "vaksin", "obat"] }).notNull(),
    name: text("name").notNull(),
    date: date("date").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("child_immunization_child_id_idx").on(table.childId)]
);

export const childrenRelations = relations(children, ({ many }) => ({
  growth: many(childGrowth),
  immunizations: many(childImmunization),
}));

export const childGrowthRelations = relations(childGrowth, ({ one }) => ({
  child: one(children, { fields: [childGrowth.childId], references: [children.id] }),
}));

export const childImmunizationRelations = relations(childImmunization, ({ one }) => ({
  child: one(children, {
    fields: [childImmunization.childId],
    references: [children.id],
  }),
}));

export const schema = {
  user,
  session,
  account,
  verification,
  children,
  childGrowth,
  childImmunization,
}
