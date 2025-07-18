
export interface NominationResponse {
  success: boolean;
  nomination_id: string;
  action: 'vote_added' | 'new_candidate' | 'similar_found';
  candidate_id?: string;
  canonical_name?: string;
  suggestions?: Array<{
    candidate_id: string;
    canonical_name: string;
    distance: number;
  }>;
}

export interface NominationData {
  nomineeName: string;
  nominatorName: string;
  position: string;
  statementOfPurpose: string;
}
