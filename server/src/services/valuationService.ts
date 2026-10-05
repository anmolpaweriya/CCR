export interface ValuationParams {
  category: string;
  estimatedDuration: number; // minutes
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiredSkills?: string[];
  complexity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ValuationResult {
  recommendedCredits: number;
  minAllowedCredits: number;
  maxAllowedCredits: number;
  reasons: string[];
}

export class ValuationService {
  /**
   * Calculates deterministic, explainable credit valuation for assistance requests
   */
  static evaluateAssistance(params: ValuationParams): ValuationResult {
    const reasons: string[] = [];

    // 1. Base duration valuation: 5 credits per hour
    const durationHours = Math.max(0.5, params.estimatedDuration / 60);
    let baseCredits = Math.round(durationHours * 6);
    reasons.push(`Base time commitment: ${params.estimatedDuration} mins (~${baseCredits} credits)`);

    // 2. Category / Complexity adjustment
    let complexityAdjustment = 0;
    const highSkillCategories = ['Tech & Digital', 'Tutoring & Skills', 'Home Improvement'];
    const mediumSkillCategories = ['Moving & Lifting', 'Gardening & Outdoor'];

    if (highSkillCategories.includes(params.category) || (params.requiredSkills && params.requiredSkills.length >= 2)) {
      complexityAdjustment += 4;
      reasons.push('High skill / technical complexity requirement (+4 credits)');
    } else if (mediumSkillCategories.includes(params.category)) {
      complexityAdjustment += 2;
      reasons.push('Moderate physical effort / tool usage (+2 credits)');
    } else {
      reasons.push('Standard everyday community task');
    }

    // 3. Urgency adjustment
    let urgencyAdjustment = 0;
    switch (params.urgency) {
      case 'CRITICAL':
        urgencyAdjustment = 6;
        reasons.push('Immediate critical turnaround (+6 credits)');
        break;
      case 'HIGH':
        urgencyAdjustment = 3;
        reasons.push('High urgency priority (+3 credits)');
        break;
      case 'MEDIUM':
        urgencyAdjustment = 0;
        reasons.push('Standard scheduled urgency (normal queue)');
        break;
      case 'LOW':
        urgencyAdjustment = -1;
        reasons.push('Flexible scheduling discount (-1 credit)');
        break;
    }

    // 4. Local community liquidity factor (simulated market balance)
    let communityFactor = 1;
    reasons.push('Community supply & demand index: steady contributor availability');

    const calculatedTotal = baseCredits + complexityAdjustment + urgencyAdjustment + communityFactor;
    const recommendedCredits = Math.max(3, Math.min(50, calculatedTotal));
    const minAllowedCredits = Math.max(1, Math.round(recommendedCredits * 0.6));
    const maxAllowedCredits = Math.round(recommendedCredits * 2.5);

    return {
      recommendedCredits,
      minAllowedCredits,
      maxAllowedCredits,
      reasons,
    };
  }

  /**
   * Calculates deterministic valuation for resource lending
   */
  static evaluateResource(category: string, condition: string): { recommendedDailyPrice: number; reasons: string[] } {
    const reasons: string[] = [];
    let basePrice = 8;

    if (category === 'Tools & Hardware' || category === 'Electronics & Audio') {
      basePrice = 12;
      reasons.push('High-utility equipment category (~12 credits/day)');
    } else if (category === 'Outdoor & Camping' || category === 'Bicycles & Mobility') {
      basePrice = 10;
      reasons.push('Recreational / mobility asset category (~10 credits/day)');
    } else {
      basePrice = 6;
      reasons.push('Standard household sharing asset (~6 credits/day)');
    }

    if (condition === 'LIKE_NEW' || condition === 'EXCELLENT') {
      basePrice += 2;
      reasons.push('Excellent/Like-New item condition (+2 credits/day)');
    }

    return {
      recommendedDailyPrice: basePrice,
      reasons,
    };
  }
}
