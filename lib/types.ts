// ================================================================================
// File: lib/types.ts
// ================================================================================

export type Competition = {
    id: number;
    name: string;
    description?: string;
};

export type League = {
    id: string;
    name: string;
    admin_id: string;
    competition_id: number;
    invite_code: string;
    competitions: { name: string } | null;
    league_members: { profiles: { username: string } | null }[];
    created_at?: string;
};

export type Profile = {
    id: string;
    username: string;
    created_at?: string;
};

export type NotificationType = 'success' | 'error';

export type NotificationState = {
    message: string;
    type: NotificationType;
} | null;

export type ModalState = {
    showCreate: boolean;
    showJoin: boolean;
    showAuth: boolean;
};

// Database response types
export type LeagueJoinResponse = {
    success: boolean;
    message: string;
    league_id?: string;
    league_name?: string;
};

// Form states
export type LeagueFormData = {
    name: string;
    competitionId: number | string;
};

export type JoinLeagueFormData = {
    inviteCode: string;
};

// Analytics event types
export type AnalyticsEventType = 
    | 'page_view'
    | 'league_created'
    | 'league_joined'
    | 'league_deleted'
    | 'competition_view'
    | 'modal_open'
    | 'modal_close'
    | 'navigation'
    | 'error'
    | 'feature_usage'
    | 'milestone';

export type UserRole = 'admin' | 'member' | 'guest';

// Component prop types
export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
}

export interface LeagueCardProps extends BaseComponentProps {
    league: League;
    profile: Profile | null;
    onCopyInviteCode: (code: string, leagueId: string, leagueName: string) => void;
    onDeleteLeague: (leagueId: string) => void;
}

export interface CompetitionCardProps extends BaseComponentProps {
    competition: Competition;
    user: any; // User type from Supabase
    onClick?: () => void;
}