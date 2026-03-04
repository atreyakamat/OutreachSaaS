import axios from 'axios';
import prisma from '../config/prisma.js';
import { automationQueue } from './queue.service.js';

export interface RawCompanyData {
  name: string;
  website?: string;
  industry?: string;
  city?: string;
  country?: string;
  source: string;
}

export abstract class SourceCollector {
  abstract name: string;
  abstract collect(): Promise<RawCompanyData[]>;
}

export class JobBoardCollector extends SourceCollector {
  name = 'JobBoardMock';
  async collect(): Promise<RawCompanyData[]> {
    // Mocking collection from a job board
    return [
      { name: 'FutureTech AI', website: 'https://futuretech.ai', industry: 'AI/Tech', city: 'San Francisco', country: 'USA', source: this.name },
      { name: 'GreenEnergy Solutions', website: 'https://greenenergy.io', industry: 'Renewables', city: 'Berlin', country: 'Germany', source: this.name },
      { name: 'HealthSync', website: 'https://healthsync.co', industry: 'HealthTech', city: 'London', country: 'UK', source: this.name },
    ];
  }
}

export class DiscoveryService {
  private collectors: SourceCollector[] = [
    new JobBoardCollector(),
    // Add more collectors here
  ];

  async runDiscovery(organizationId: string) {
    console.log(`Running discovery for organization: ${organizationId}`);
    
    for (const collector of this.collectors) {
      try {
        const rawData = await collector.collect();
        for (const data of rawData) {
          await this.processDiscoveredCompany(organizationId, data);
        }
      } catch (err: any) {
        console.error(`Collector ${collector.name} failed:`, err.message);
      }
    }
  }

  private async processDiscoveredCompany(organizationId: string, data: RawCompanyData) {
    const domain = this.extractDomain(data.website);
    if (!domain) return;

    // Check for duplicates in main Company table or buffer Discovered table
    const existingCompany = await prisma.company.findUnique({ where: { domain } });
    if (existingCompany) return;

    await prisma.discoveredCompany.upsert({
      where: { organizationId_domain: { organizationId, domain } },
      update: {},
      create: {
        organizationId,
        name: data.name,
        domain,
        website: data.website,
        industry: data.industry,
        city: data.city,
        country: data.country,
        source: data.source,
        status: 'PENDING'
      }
    });
  }

  private extractDomain(url?: string): string | null {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      let host = parsed.hostname;
      if (host.startsWith('www.')) host = host.substring(4);
      return host;
    } catch (e) {
      return null;
    }
  }
}

export const discoveryService = new DiscoveryService();
