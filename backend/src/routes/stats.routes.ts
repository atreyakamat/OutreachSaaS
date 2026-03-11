import { Router, Response } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import prisma from '../config/prisma.js';

const router = Router();

router.get('/', authMiddleware, async (req: any, res: Response) => {
  const organizationId = req.user.organizationId;

  try {
    const [companiesCount, leadsCount, activeSequencesCount, emailsSentCount, onboardedCount] = await Promise.all([
      prisma.company.count({ where: { organizationId } }),
      prisma.contact.count({ where: { company: { organizationId } } }),
      prisma.sequence.count({ where: { organizationId, status: 'ACTIVE' } }),
      prisma.emailJob.count({ where: { contact: { company: { organizationId } }, status: 'SENT' } }),
      prisma.outreachPipeline.count({ where: { company: { organizationId }, stage: 'partner onboarded' } }),
    ]);

    // High score companies
    const highValueCompanies = await prisma.company.findMany({
      where: { organizationId, score: { gte: 5 } },
      orderBy: { score: 'desc' },
      take: 5,
    });

    // Pipeline Distribution
    const pipelineDistribution = await prisma.outreachPipeline.groupBy({
      by: ['stage'],
      where: { company: { organizationId } },
      _count: true,
    });

    // Regional Distribution
    const regionalDistributionRaw = await prisma.company.groupBy({
      by: ['country'],
      where: { organizationId, country: { not: null } },
      _count: true,
      orderBy: { _count: { country: 'desc' } },
      take: 5,
    });

    // Top Industry
    const topIndustryRaw = await prisma.company.groupBy({
      by: ['industry'],
      where: { organizationId, industry: { not: null } },
      _count: true,
      orderBy: { _count: { industry: 'desc' } },
      take: 1,
    });

    const conversionRate = leadsCount > 0 ? ((onboardedCount / leadsCount) * 100).toFixed(1) : "0.0";
    const topIndustry = topIndustryRaw.length > 0 ? topIndustryRaw[0].industry : "N/A";
    const topIndustryPercent = companiesCount > 0 && topIndustryRaw.length > 0 
      ? Math.round((topIndustryRaw[0]._count / companiesCount) * 100) 
      : 0;

    res.json({
      stats: {
        companies: companiesCount,
        leads: leadsCount,
        activeSequences: activeSequencesCount,
        emailsSent: emailsSentCount,
        onboarded: onboardedCount,
        conversionRate,
        topIndustry,
        topIndustryPercent
      },
      highValueCompanies,
      pipelineDistribution: pipelineDistribution.map(item => ({
        stage: item.stage,
        count: item._count,
      })),
      regionalDistribution: regionalDistributionRaw.map(item => ({
        country: item.country,
        count: item._count,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

export default router;
