// Auto-tagging utilities for customers based on their activities

export interface CustomerData {
  totalOrders?: number;
  totalSpent?: number;
  tags?: string[];
  workshopRegistrations?: any[];
  eventRegistrations?: any[];
  location?: string;
}

/**
 * Generate tags for customers based on their order history
 */
export function generateOrderTags(totalOrders: number, totalSpent: number): string[] {
  const tags: string[] = [];

  // Order frequency tags
  if (totalOrders > 0) {
    tags.push('food_customer');
  }

  if (totalOrders > 1) {
    tags.push('repeat_buyer');
  }

  if (totalOrders >= 5) {
    tags.push('frequent_buyer');
  }

  if (totalOrders >= 10) {
    tags.push('loyal_customer');
  }

  // Spending level tags
  const spentAmount = typeof totalSpent === 'number' ? totalSpent : parseFloat(String(totalSpent || 0));

  if (spentAmount > 100) {
    tags.push('high_value');
  }

  if (spentAmount > 250) {
    tags.push('vip_spender');
  }

  if (spentAmount > 500) {
    tags.push('premium_customer');
  }

  return tags;
}

/**
 * Generate tags for workshop participants
 */
export function generateWorkshopTags(registration: {
  workshopName?: string;
  location?: string;
  referralSource?: string;
  goals?: string;
  fbExperience?: string;
}): string[] {
  const tags: string[] = ['workshop_participant'];

  // Workshop-specific tags
  if (registration.workshopName?.toLowerCase().includes('mục tiêu')) {
    tags.push('workshop_goal_setting');
  }
  if (registration.workshopName?.toLowerCase().includes('f&b') || registration.workshopName?.toLowerCase().includes('căn bếp')) {
    tags.push('workshop_f&b');
  }

  // Location-based tags
  const location = registration.location?.toLowerCase() || '';
  if (location.includes('uk') || location.includes('anh')) {
    tags.push('uk_based');
  } else if (location.includes('việt nam') || location.includes('vietnam')) {
    tags.push('vietnam_based');
  } else if (location.includes('úc') || location.includes('australia')) {
    tags.push('australia_based');
  } else if (location.includes('pháp') || location.includes('france')) {
    tags.push('france_based');
  }

  // Experience level tags
  const fbExperience = registration.fbExperience?.toLowerCase() || '';
  if (fbExperience.includes('hoàn toàn không') || fbExperience.includes('chưa có')) {
    tags.push('fb_beginner');
  } else if (fbExperience.includes('đã có') || fbExperience.includes('kinh doanh')) {
    tags.push('fb_experienced');
  }

  // Goal-based tags
  const goals = registration.goals?.toLowerCase() || '';
  if (goals.includes('thu nhập thêm') || goals.includes('side income')) {
    tags.push('seeking_side_income');
  }
  if (goals.includes('thay thế công việc') || goals.includes('career change')) {
    tags.push('career_change');
  }
  if (goals.includes('gia đình') || goals.includes('family business')) {
    tags.push('family_business');
  }

  // Referral source tags
  const referralSource = registration.referralSource?.toLowerCase() || '';
  if (referralSource.includes('facebook cá nhân')) {
    tags.push('referral_facebook_personal');
  } else if (referralSource.includes('group') || referralSource.includes('cộng đồng')) {
    tags.push('referral_facebook_group');
  } else if (referralSource.includes('người quen')) {
    tags.push('referral_word_of_mouth');
  }

  return tags;
}

/**
 * Generate tags for event participants
 */
export function generateEventTags(event: { category?: string; titleEn?: string; titleVi?: string }): string[] {
  const tags: string[] = ['event_participant'];

  const category = event.category?.toLowerCase() || '';
  const title = `${event.titleEn || ''} ${event.titleVi || ''}`.toLowerCase();

  if (category.includes('workshop') || title.includes('workshop')) {
    tags.push('attended_workshop');
  }

  if (category.includes('cooking') || title.includes('cooking')) {
    tags.push('cooking_enthusiast');
  }

  if (category.includes('business') || title.includes('business')) {
    tags.push('business_interested');
  }

  return tags;
}

/**
 * Merge tags, removing duplicates and keeping existing tags
 */
export function mergeTags(existingTags: string[], newTags: string[]): string[] {
  return Array.from(new Set([...existingTags, ...newTags]));
}

/**
 * Calculate customer segment based on their activity
 */
export function calculateSegment(
  totalOrders: number,
  totalSpent: number,
  lastOrderDate?: Date | null
): string {
  const now = new Date();
  const daysSinceLastOrder = lastOrderDate
    ? Math.floor((now.getTime() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;

  // VIP: High value and recent activity
  const spentAmount = typeof totalSpent === 'number' ? totalSpent : parseFloat(String(totalSpent || 0));

  if (spentAmount > 250 && daysSinceLastOrder < 60) {
    return 'vip';
  }

  // Inactive: No recent orders
  if (daysSinceLastOrder > 180) {
    return 'inactive';
  }

  // Regular: Everyone else
  return 'regular';
}
