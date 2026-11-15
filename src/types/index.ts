export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export type PageId =
  | 'dashboard'
  | 'connection'
  | 'chat'
  | 'countdown'
  | 'candle'
  | 'truth-or-dare'
  | 'guess-picture'
  | 'love-quiz'
  | 'music'
  | 'memories'
  | 'love-letter'
  | 'journey'
  | 'mini-games'
  | 'secret-message'
  | 'virtual-hug'
  | 'our-promise'
  | 'final-surprise'
  | 'admin';

export type MemoryCategory =
  | 'First Dates'
  | 'Jalan-Jalan'
  | 'Random Lucu'
  | 'Special Moments';

export type TruthOrDareCategory =
  | 'Romantic'
  | 'Funny'
  | 'Deep Talk'
  | 'Relationship'
  | 'Jealousy'
  | 'Childhood'
  | 'Future'
  | 'Random';

export type PartnerRoleName = 'Zikri' | 'Diann';

export interface SiteConfig {
  coupleNames: string;
  heroGreeting: string;
  couplePhotoUrl: string;
  finalLetter: string;
  secretHint: string;
  secretCodeHash: string;
  secretMessage: string;
  ownerUid?: string;
}

export interface MemoryItem {
  id: string;
  caption: string;
  dateLabel: string;
  category: MemoryCategory;
  imageUrl: string;
  storagePath?: string;
  isPublic: boolean;
  isLocalOnly?: boolean;
  ownerUid?: string;
  uploaderUid?: string;
  uploaderName?: string;
}

export interface MemoryCommentItem {
  id: string;
  authorUid: string;
  authorName: string;
  text: string;
  createdAtMs: number;
}

export interface TimelineItem {
  id: string;
  title: string;
  dateLabel: string;
  description: string;
  imageUrl?: string;
  sortOrder: number;
  isPublic: boolean;
  ownerUid?: string;
}

export type RadioMoodTag =
  | 'Romantic'
  | 'Chill'
  | 'Sad'
  | 'Special'
  | 'Mood'
  | 'Indie'
  | 'Rock'
  | '';

export interface SongItem {
  id: string;
  title: string;
  artist: string;
  youtubeUrl: string;
  youtubeId: string;
  audioUrl?: string;
  artworkUrl?: string;
  sourceType?: 'audio' | 'youtube';
  durationSec?: number;
  storagePath?: string;
  uploaderName?: string;
  playlistId?: string;
  moodTag?: RadioMoodTag;
  isFavorite?: boolean;
  isSpecialSong?: boolean;
  sortOrder: number;
  isPublic: boolean;
  ownerUid?: string;
}

export interface TruthOrDareItem {
  id: string;
  kind: 'truth' | 'dare';
  category: TruthOrDareCategory;
  prompt: string;
  isPublic?: boolean;
  ownerUid?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sortOrder: number;
  isPublic?: boolean;
  ownerUid?: string;
}

export interface LoveLetterItem {
  id: string;
  title: string;
  body: string;
  author: string;
  isPublic?: boolean;
  ownerUid?: string;
}

export interface PromiseItem {
  id: string;
  authorName: string;
  text: string;
  isPublic: boolean;
  isLocalOnly?: boolean;
  ownerUid?: string;
}

export interface GuessPicturePuzzle {
  id: string;
  level: number;
  title: string;
  hint: string;
  answers: string[];
  imageUrl?: string;
  sceneType: string;
}

export interface UserProfile {
  uid: string;
  roleName: PartnerRoleName;
  spaceId: string;
}

export interface CoupleSpace {
  id: string;
  title: string;
  inviteCode: string;
  ownerUid: string;
  member1Uid: string;
  member1Name: string;
  member2Uid: string;
  member2Name: string;
  memberCount: number;
  candleLit: boolean;
  candleWish: string;
  anniversaryOpened: boolean;
  sharedSongId: string;
  sharedSongTitle: string;
  sharedSongArtist: string;
  sharedSongPlaying: boolean;
}

export interface SpacePresence {
  uid: string;
  roleName: string;
  online: boolean;
  sharePage: boolean;
  currentPage: string;
  lastSeenMs: number;
}

export interface ChatMessage {
  id: string;
  senderUid: string;
  senderName: string;
  text: string;
  sticker: string;
  readByPartner: boolean;
  createdAtMs: number;
}

export type SharedGameType =
  | 'tictactoe'
  | 'truth-or-dare'
  | 'love-quiz'
  | 'spin-wheel'
  | 'guess-emoji';

export type MultiplayerGameType =
  | 'tictactoe'
  | 'connect_four'
  | 'memory_match'
  | 'quiz_battle'
  | 'guess_emoji'
  | 'truth_or_dare'
  | 'spin_wheel'
  | 'this_or_that'
  | 'who_knows_better'
  | 'guess_song';

export type GameRoomStatus = 'invited' | 'lobby' | 'playing' | 'finished' | 'closed';

export interface GameRoomScore {
  player1: number;
  player2: number;
}

export interface GameRoomRematchVotes {
  player1: boolean;
  player2: boolean;
}

export interface GameRoom {
  roomId: string;
  coupleSpaceId: string;
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  invitedByUid: string;
  gameType: MultiplayerGameType;
  status: GameRoomStatus;
  player1Ready: boolean;
  player2Ready: boolean;
  currentTurn: string;
  turnNumber: number;
  gameState: Record<string, unknown>;
  score: GameRoomScore;
  winnerId: string;
  rematchVotes: GameRoomRematchVotes;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface GameHistoryEntry {
  id: string;
  roomId: string;
  coupleSpaceId: string;
  gameType: MultiplayerGameType;
  gameTitle: string;
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  score: GameRoomScore;
  winnerId: string;
  winnerName: string;
  createdAtMs: number;
}

export type SharedPlaylistMood =
  | 'Romantic'
  | 'Chill'
  | 'Sad'
  | 'Special'
  | 'Mood'
  | 'Custom';

export interface SharedPlaylist {
  id: string;
  coupleSpaceId: string;
  name: string;
  description: string;
  moodType: SharedPlaylistMood;
  creatorUid: string;
  creatorName: string;
  createdAtMs: number;
}

export interface RadioSyncState {
  coupleSpaceId: string;
  songId: string;
  songTitle: string;
  songArtist: string;
  playlistId: string;
  currentIndex: number;
  playbackStatus: 'playing' | 'paused';
  currentPosition: number;
  lastUpdatedByUid: string;
  lastUpdatedByName: string;
  member1Joined: boolean;
  member2Joined: boolean;
  updatedAtMs: number;
}

export interface SongDedication {
  id: string;
  coupleSpaceId: string;
  senderUid: string;
  senderName: string;
  songId: string;
  songTitle: string;
  songArtist: string;
  artworkUrl: string;
  youtubeUrl: string;
  audioUrl: string;
  message: string;
  openedByPartner: boolean;
  createdAtMs: number;
}

export interface SongStory {
  id: string;
  coupleSpaceId: string;
  songTitle: string;
  artist: string;
  dateLabel: string;
  story: string;
  imageUrl?: string;
  storagePath?: string;
  uploaderUid: string;
  uploaderName: string;
  createdAtMs: number;
}

export interface MusicHistoryItem {
  id: string;
  coupleSpaceId: string;
  songId: string;
  songTitle: string;
  artist: string;
  sourceType: 'audio' | 'youtube';
  playedByUid: string;
  playedByName: string;
  createdAtMs: number;
}
