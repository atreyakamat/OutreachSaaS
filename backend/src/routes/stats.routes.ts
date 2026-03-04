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
      prisma.emailJob.count({ where: { contact: { company: { organizationId } } }, status: 'SENT' }),
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

    res.json({
      stats: {
        companies: companiesCount,
        leads: leadsCount,
        activeSequences: activeSequencesCount,
        emailsSent: emailsSentCount,
        onboarded: onboardedCount,
      },
      highValueCompanies,
      pipelineDistribution: pipelineDistribution.map(item => ({
        stage: item.stage,
        count: item._count,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

export default router;
