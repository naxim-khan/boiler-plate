#!/usr/bin/env ts-node
import prisma from '../../src/PrismaClient'; // <-- use existing prisma client
import { hashPassword } from '../utils/password.util';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createAdmin() {
  try {
    console.log('🏗️  Create Admin User\n');

    const name = await prompt('Name: ');
    const email = await prompt('Email: ');
    const password = await prompt('Password: ');

    if (!name || !email || !password) {
      throw new Error('All fields are required');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('❌ User with this email already exists');
      return;
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created successfully!');
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdmin();
