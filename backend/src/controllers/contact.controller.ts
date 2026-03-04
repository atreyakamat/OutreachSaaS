import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
  };
}

const ROLE_PRIORITY: Record<string, number> = {
  'Founder': 100,
  'Co-Founder': 100,
  'CEO': 90,
  'Managing Director': 90,
  'Head of HR': 80,
  'HR Manager': 70,
  'Talent Acquisition Manager': 60,
  'Operations Manager': 50,
};

const getPriority = (role?: string | null) => {
  if (!role) return 0;
  for (const [key, value] of Object.entries(ROLE_PRIORITY)) {
    if (role.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return 10;
};

export const createContact = async (req: AuthRequest, res: Response) => {
  const { companyId, name, role, email, linkedinUrl, phone, timezone } = req.body;
  const organizationId = req.user?.organizationId;

  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const priorityScore = getPriority(role);
    
    // Check if it should be primary (if first contact)
    const existingCount = await prisma.contact.count({ where: { companyId } });

    const contact = await prisma.contact.create({
      data: {
        companyId,
        name,
        role,
        email,
        linkedinUrl,
        phone,
        priorityScore,
        isPrimary: existingCount === 0,
        timezone: timezone || 'UTC',
      },
    });

    // Pipeline Logic
    const existingPipeline = await prisma.outreachPipeline.findFirst({ where: { companyId } });
    if (!existingPipeline) {
      await prisma.outreachPipeline.create({
        data: { companyId, contactId: contact.id, stage: 'contact identified' }
      });
    }

    await prisma.activityLog.create({
      data: { companyId, contactId: contact.id, action: 'Contact Added', details: `Added: ${name} (${role})` }
    });

    res.status(201).json(contact);
  } catch (error: any) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

export const getContacts = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  const { role, companyId } = req.query;

  try {
    const contacts = await prisma.contact.findMany({
      where: { 
        company: { organizationId },
        ...(role && { role: { contains: role as string, mode: 'insensitive' } }),
        ...(companyId && { companyId: companyId as string }),
      },
      include: { company: true },
      orderBy: [
        { isPrimary: 'desc' },
        { priorityScore: 'desc' },
        { createdAt: 'desc' }
      ],
    });
    res.json(contacts);
  } catch (error: any) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

export const setPrimaryContact = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact) return res.status(404).json({ message: 'Not found' });

    // Remove primary from others in company
    await prisma.contact.updateMany({
      where: { companyId: contact.companyId },
      data: { isPrimary: false }
    });

    await prisma.contact.update({
      where: { id },
      data: { isPrimary: true }
    });

    res.json({ message: 'Primary contact updated' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};
