import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
  };
}

export const createContact = async (req: AuthRequest, res: Response) => {
  const { companyId, name, role, email, linkedinUrl, phone, timezone } = req.body;
  const organizationId = req.user?.organizationId;

  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const contact = await prisma.contact.create({
      data: {
        companyId,
        name,
        role,
        email,
        linkedinUrl,
        phone,
        timezone: timezone || 'UTC',
      },
    });

    // Automatically create a pipeline entry if it doesn't exist for this company
    const existingPipeline = await prisma.outreachPipeline.findFirst({
      where: { companyId }
    });

    if (!existingPipeline) {
      await prisma.outreachPipeline.create({
        data: {
          companyId,
          contactId: contact.id,
          stage: 'contact identified',
        }
      });
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        companyId,
        contactId: contact.id,
        action: 'Contact Added',
        details: `Added decision maker: ${name} (${role})`,
      }
    });

    res.status(201).json(contact);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating contact', error: error.message });
  }
};

export const getContacts = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const contacts = await prisma.contact.findMany({
      where: { company: { organizationId } },
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(contacts);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching contacts', error: error.message });
  }
};
