import { Router, Response } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import prisma from '../config/prisma';

const router = Router();

router.get('/', authMiddleware, async (req: any, res: Response) => {
  const organizationId = req.user.organizationId;

  try {
    const [leadsCount, activeCampaignsCount, emailsSentCount, pendingEmailsCount] = await Promise.all([
      prisma.lead.count({ where: { organizationId } }),
      prisma.campaign.count({ where: { organizationId, status: 'ACTIVE' } }),
      prisma.emailJob.count({ where: { organizationId, status: 'SENT' } }),
      prisma.emailJob.count({ where: { organizationId, status: 'QUEUED' } }),
    ]);

    // Simple timezone distribution for the chart
    const tzDistribution = await prisma.lead.groupBy({
      by: ['timezone'],
      where: { organizationId },
      _count: true,
    });

    // Recent activity (latest 5 email jobs)
    const recentActivity = await prisma.emailJob.findMany({
      where: { organizationId },
      include: { lead: true, campaign: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.json({
      stats: {
        leads: leadsCount,
        activeCampaigns: activeCampaignsCount,
        emailsSent: emailsSentCount,
        pendingEmails: pendingEmailsCount,
      },
      tzDistribution: tzDistribution.map(item => ({
        timezone: item.timezone,
        count: item._count,
      })),
      recentActivity,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

export default router;
