import { pgTable, serial, text, timestamp, boolean, json, integer } from 'drizzle-orm/pg-core';

export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const pricing = pgTable('pricing', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: text('price').notNull(),
  description: text('description').notNull(),
  features: json('features').$type<string[]>().notNull(),
  popular: boolean('popular').default(false),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(), // Hashed password
  createdAt: timestamp('created_at').defaultNow(),
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url'),
  link: text('link'),
  createdAt: timestamp('created_at').defaultNow(),
});
