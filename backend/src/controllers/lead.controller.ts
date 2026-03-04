import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import fs from 'fs';
import csv from 'csv-parser';
import { getTimezone } from '../utils/timezone.js';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
  };
}

export const createLead = async (req: AuthRequest, res: Response) => {
  const { companyName, domain, country, city, contactName, email } = req.body;
  const organizationId = req.user?.organizationId;

  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const timezone = getTimezone(country, city);
    const lead = await prisma.lead.create({
      data: {
        companyName,
        domain,
        country,
        city,
        timezone,
        contactName,
        email,
        organizationId,
      },
    });

    res.status(201).json(lead);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating lead', error: error.message });
  }
};

export const getLeads = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const leads = await prisma.lead.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(leads);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching leads', error: error.message });
  }
};

export const uploadLeads = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  const file = req.file;
  if (!file) return res.status(400).json({ message: 'No file uploaded' });

  const results: any[] = [];
  fs.createReadStream(file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const leadsData = results.map((row) => ({
          companyName: row.company_name || row.CompanyName,
          domain: row.domain || row.Domain,
          country: row.country || row.Country,
          city: row.city || row.City,
          contactName: row.contact_name || row.ContactName,
          email: row.email || row.Email,
          timezone: getTimezone(row.country || row.Country, row.city || row.City),
          organizationId,
        }));

        const leads = await prisma.lead.createMany({
          data: leadsData,
          skipDuplicates: true,
        });

        fs.unlinkSync(file.path);
        res.status(201).json({ message: 'Leads uploaded successfully', count: leads.count });
      } catch (error: any) {
        res.status(500).json({ message: 'Error processing CSV', error: error.message });
      }
    });
};
