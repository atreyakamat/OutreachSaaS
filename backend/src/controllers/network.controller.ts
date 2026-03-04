import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
  };
}

// Universities
export const createUniversity = async (req: AuthRequest, res: Response) => {
  const { name, city, state, country, website } = req.body;
  const organizationId = req.user?.organizationId;
  if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const university = await prisma.university.create({
      data: { name, city, state, country, website, organizationId }
    });
    res.status(201).json(university);
  } catch (error: any) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

export const getUniversities = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  try {
    const universities = await prisma.university.findMany({
      where: { organizationId },
      include: { colleges: { include: { _count: { select: { students: true } } } } }
    });
    res.json(universities);
  } catch (error: any) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

// Colleges
export const createCollege = async (req: AuthRequest, res: Response) => {
  const { name, universityId, city, state, website } = req.body;
  try {
    const college = await prisma.college.create({
      data: { name, universityId, city, state, website }
    });
    res.status(201).json(college);
  } catch (error: any) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

// Students
export const createStudent = async (req: AuthRequest, res: Response) => {
  const { name, collegeId, degree, graduationYear, skills, portfolioLink } = req.body;
  try {
    const student = await prisma.student.create({
      data: { name, collegeId, degree, graduationYear, skills, portfolioLink }
    });
    res.status(201).json(student);
  } catch (error: any) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

export const getStudents = async (req: AuthRequest, res: Response) => {
  const { skill, collegeId, universityId } = req.query;
  const organizationId = req.user?.organizationId;

  try {
    const students = await prisma.student.findMany({
      where: {
        ...(collegeId && { collegeId: collegeId as string }),
        ...(universityId && { college: { universityId: universityId as string } }),
        ...(skill && { skills: { contains: skill as string } }),
        college: { university: { organizationId } }
      },
      include: { college: { include: { university: true } } }
    });
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

// Opportunities
export const createOpportunity = async (req: AuthRequest, res: Response) => {
  const { companyId, title, description, requiredSkills, location, type } = req.body;
  try {
    const opportunity = await prisma.opportunity.create({
      data: { companyId, title, description, requiredSkills, location, type }
    });
    res.status(201).json(opportunity);
  } catch (error: any) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

export const getOpportunities = async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  try {
    const opportunities = await prisma.opportunity.findMany({
      where: { company: { organizationId } },
      include: { company: true }
    });
    res.json(opportunities);
  } catch (error: any) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};
