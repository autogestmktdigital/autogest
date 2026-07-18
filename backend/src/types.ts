// Tipos compartilhados - compatíveis com MySQL (enum) e SQLite (string)
// Use estes tipos nos services ao invés de importar diretamente do @prisma/client

export type UserRole = 'admin' | 'seller';
export type FuelType = 'flex' | 'gasoline' | 'diesel' | 'electric' | 'hybrid';
export type TransmissionType = 'manual' | 'automatic';
export type VehicleStatus = 'available' | 'reserved' | 'sold';
export type Channel = 'whatsapp' | 'instagram' | 'facebook';
export type LeadStatus = 'bot' | 'new' | 'in_conversation' | 'negotiating' | 'converted' | 'gave_up' | 'invalid';
export type ConversationStatus = 'active' | 'paused' | 'closed';
export type MessageRole = 'customer' | 'bot' | 'agent';
export type FollowUpType = 'welcome_24h' | 'check_interest' | 'new_vehicles' | 'price_drop';
export type FollowUpStatus = 'scheduled' | 'sent' | 'failed' | 'cancelled';
