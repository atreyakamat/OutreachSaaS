import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const register = async (req: Request, res: Response) => {
  const { email, password, organizationName } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
      },
    });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        organizationId: organization.id,
      },
    });

    const token = jwt.sign({ userId: user.id, organizationId: organization.id }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(201).json({ token, user: { id: user.id, email: user.email, organizationId: organization.id } });
  } catch (error: any) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, organizationId: user.organizationId }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({ token, user: { id: user.id, email: user.email, organizationId: user.organizationId } });
  } catch (error: any) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};
