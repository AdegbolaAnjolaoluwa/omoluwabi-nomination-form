
export interface EligibleVoter {
  id: string;
  full_name: string;
  member_id: string;
  is_active: boolean;
  created_at: string;
}

export interface NominationSubmission {
  voter_name: string;
  president: string;
  tournament_director: string;
  hon_legal_adviser: string;
  secretary: string;
  hon_social_secretary: string;
}

export interface NominationStats {
  position: string;
  nominee_name: string;
  nomination_count: number;
}

export interface TopNominee {
  nominee_name: string;
  total_nominations: number;
}

export interface AdminUser {
  id: string;
  admin_name: string;
  is_super_admin: boolean;
  created_at: string;
}
