import { IUser, User } from '../models/User.js';
import { IPlan } from '../models/Plan.js';
import { calculateCandidateReliability } from './behavioralReliabilityService.js';

export interface MatchFactor {
  label: string;
  matched: boolean;
  detail: string;
}

export interface CandidateMatchResult {
  user: {
    _id: string;
    name: string;
    branch: string;
    year: string;
    avatar: string;
    campusZone: string;
    verified: boolean;
    roles: string[];
  };
  score: number;
  matchedFactors: MatchFactor[];
  summaryHeadline: string;
}

export async function findMatchesForPlan(plan: IPlan): Promise<CandidateMatchResult[]> {
  // Candidate pool: users who are not the creator and not already members
  const memberIds = plan.members.map((m) => m.userId.toString());
  const excludedIds = [plan.creatorId.toString(), ...memberIds];

  const allUsers = await User.find({ _id: { $nin: excludedIds } });

  const targetRole = plan.role.toLowerCase().trim();
  const targetZone = plan.campusZone || 'Main Block';
  const targetDay = plan.date; // e.g. "Saturday" or includes Saturday

  const results: CandidateMatchResult[] = [];

  for (const candidate of allUsers) {
    const factors: MatchFactor[] = [];
    let score = 0;

    // 1. Role match (Hard Filter & Weight)
    const userRoles = candidate.roles.map((r) => r.toLowerCase().trim());
    const roleMatch = userRoles.some(
      (r) => r.includes(targetRole) || targetRole.includes(r) || (targetRole.includes('ui') && r.includes('designer'))
    );
    if (roleMatch) {
      factors.push({
        label: 'Role Fit',
        matched: true,
        detail: `Possesses ${plan.role} skillset`,
      });
      score += 40;
    } else {
      factors.push({
        label: 'Role Fit',
        matched: false,
        detail: `Primary focus is ${candidate.roles.join(', ') || 'General'}`,
      });
    }

    // 2. Time / Availability match
    const hasDayAvail = candidate.availability.some(
      (a) => targetDay.toLowerCase().includes(a.day.toLowerCase()) || a.day.toLowerCase().includes('weekend')
    );
    if (hasDayAvail) {
      factors.push({
        label: 'Availability',
        matched: true,
        detail: `Available for slot (${plan.startTime})`,
      });
      score += 25;
    } else {
      factors.push({
        label: 'Availability',
        matched: false,
        detail: 'Flexible schedule',
      });
      score += 10;
    }

    // 3. Proximity / Campus Zone match
    const zoneMatch =
      candidate.campusZone.toLowerCase() === targetZone.toLowerCase() ||
      candidate.campusZone.includes('Hostel') ||
      targetZone === 'Main Block';
    if (zoneMatch) {
      factors.push({
        label: 'Proximity',
        matched: true,
        detail: `Based near ${targetZone} (${candidate.campusZone})`,
      });
      score += 15;
    } else {
      factors.push({
        label: 'Proximity',
        matched: false,
        detail: `Located at ${candidate.campusZone}`,
      });
      score += 5;
    }

    // 4. Interest Alignment
    const hasInterest = candidate.interests.some(
      (i) => plan.activity.toLowerCase().includes(i.toLowerCase()) || plan.category.toLowerCase().includes(i.toLowerCase())
    );
    if (hasInterest) {
      factors.push({
        label: 'Activity Interest',
        matched: true,
        detail: `Actively interested in ${plan.activity}`,
      });
      score += 15;
    } else {
      factors.push({
        label: 'Activity Interest',
        matched: false,
        detail: 'Open to campus collaborative activities',
      });
      score += 5;
    }

    // 5. Reliability Bonus (V1 deterministic)
    const rel = await calculateCandidateReliability(candidate._id);
    if (rel.completedCount > 0) {
      score += Math.min(rel.completedCount * 2, 10);
    }

    results.push({
      user: {
        _id: candidate._id.toString(),
        name: candidate.name,
        branch: candidate.branch,
        year: candidate.year,
        avatar: candidate.avatar,
        campusZone: candidate.campusZone,
        verified: candidate.verified,
        roles: candidate.roles,
      },
      score,
      matchedFactors: factors,
      summaryHeadline: roleMatch && hasDayAvail ? 'Strong Match' : 'Potential Match',
    });
  }

  // Rank by deterministic score descending
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 10);
}
