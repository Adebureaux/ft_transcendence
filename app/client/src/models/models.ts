//
//// API to front
//

// requested in IndexPage.vue
// used in components:
//   - ConversationsList
//   - Settings
//   - Profil
//   - un peu partout (ce sont les infos de base du user courant)
export interface IUserBasicInfo {
  id: string;
  name: string;
  avatar: string; // url of the avatar
  onlineStatus: OnlineStatus; // enum de l’online status
}

// requested in ConversationsList.component.vue
export type IConvList = Array<IConvItem>;

export interface IConvItem {
  identity: IUserBasicInfo;
  scope: Scope; // la conv est privé ou public (password ou pas)
}


// requested in Conversation.component.vue
export type IMessageList = Array<IMessage>;

export interface IMessage {
  id: string;
  identity: IUserBasicInfo;
  timestamp: Date;
  body: string;
}


// requested in Profil.component.vue
export interface UserScores {
  identity: IUserBasicInfo;
  victoryScore: number;
  defeatScore: number;
}

export interface IUserMatchInfo {
  identity: IUserBasicInfo;
  score: number; // score of the identity
}

export type MatchHistory = Array<IMatchRecap>

export interface IMatchRecap {
  user: IUserMatchInfo;
  opponent: IUserMatchInfo;
}

//
// ENUM
//
export enum OnlineStatus {
  ONLINE,
  OFFLINE,
  INGAME,
  NONE
}

export enum Scope {
  PRIVATE,
  PUBLIC,
}

// export enum MatchResultVD {
//   VICTORY,
//   DEFEAT,
//   DRAW,
// }
