///////////////////////////////////////////////////////////////////////////////
export interface IGameQuery {
  skip: string;
  take: string;
  order: string;
}

export function GameQueryBuilder(query: IGameQuery) {
  let query_str: string = "?";

  if (query?.order) query_str += "order=" + query?.order + "&";
  if (query?.skip) query_str += "skip=" + query?.skip + "&";
  if (query?.take) query_str += "take=" + query?.take + "&";

  return query_str;
}
///////////////////////////////////////////////////////////////////////////////
export interface ISearchQuery {
  key: string;
  skip?: string;
  take?: string;
}

export function SearchQueryBuilder(query: ISearchQuery) {
  let query_str: string = "?";

  if (query?.key) query_str += "key=" + query?.key + "&";
  if (query?.skip) query_str += "skip=" + query?.skip + "&";
  if (query?.take) query_str += "take=" + query?.take + "&";

  return query_str;
}
///////////////////////////////////////////////////////////////////////////////

export type eSubscriptionState = "BANNED" | "MUTED" | "OK";
export type eRole = "OWNER" | "ADMIN" | "USER";
export type eChannelType = "PUBLIC" | "PRIVATE" | "ONE_TO_ONE";

/*
 ** User
 */
export class User implements IUser {
  username: string;
  email: string;
  TwoFA: boolean;
  channelSubscriptions: Channel[];
  gameHistoryPOne: Game[];
  gameHistoryPTwo: Game[];
  followedBy: Follows[];
  following: Follows[];
  blocking: Blocks[];
  victoriesAsPOne: number;
  victoriesAsPTwo: number;
  defeatsAsPOne: number;
  defeatsAsPTwo: number;

  constructor(
    username: string,
    email: string,
    TwoFA: boolean,
    channelSubscriptions: Channel[],
    gameHistoryPOne: Game[],
    gameHistoryPTwo: Game[],
    followedBy: Follows[],
    following: Follows[],
    blocking: Blocks[],
    victoriesAsPOne: number,
    victoriesAsPTwo: number,
    defeatsAsPOne: number,
    defeatsAsPTwo: number
  ) {
    this.username = username;
    this.email = email;
    this.TwoFA = TwoFA;
    this.channelSubscriptions = channelSubscriptions;
    this.gameHistoryPOne = gameHistoryPOne;
    this.gameHistoryPTwo = gameHistoryPTwo;
    this.followedBy = followedBy;
    this.following = following;
    this.blocking = blocking;
    this.victoriesAsPOne = victoriesAsPOne;
    this.victoriesAsPTwo = victoriesAsPTwo;
    this.defeatsAsPOne = defeatsAsPOne;
    this.defeatsAsPTwo = defeatsAsPTwo;
  }
}
export interface IUser {
  username: string;
  email: string;
  TwoFA: boolean;
  channelSubscriptions: Channel[];
  gameHistoryPOne: Game[];
  gameHistoryPTwo: Game[];
  followedBy: Follows[];
  following: Follows[];
  blocking: Blocks[];
  victoriesAsPOne: number;
  victoriesAsPTwo: number;
  defeatsAsPOne: number;
  defeatsAsPTwo: number;
}

/*
 ** Follows
 */
export class Follows implements IFollows {
  follower: User;
  followerId: string;
  following: User;
  followingId: string;
  id: string;

  constructor(
    follower: User,
    followerId: string,
    following: User,
    followingId: string,
    id: string
  ) {
    this.follower = follower;
    this.followerId = followerId;
    this.following = following;
    this.followingId = followingId;
    this.id = id;
  }
}
export interface IFollows {
  follower: User;
  followerId: string;
  following: User;
  followingId: string;
  id: string;
}

/*
 ** Blocks
 */
export class Blocks implements IBlocks {
  blocker: User;
  blockerId: string;
  blocking: User;
  blockingId: string;
  id: string;

  constructor(
    blocker: User,
    blockerId: string,
    blocking: User,
    blockingId: string,
    id: string
  ) {
    this.blocker = blocker;
    this.blockerId = blockerId;
    this.blocking = blocking;
    this.blockingId = blockingId;
    this.id = id;
  }
}
export interface IBlocks {
  blocker: User;
  blockerId: string;
  blocking: User;
  blockingId: string;
  id: string;
}

/*
 ** Message
 */
export class Message implements IMessage {
  id: string;
  CreatedAt: string;
  ReceivedAt: string;
  content: string;
  user: User;
  username: string;
  channel: Channel;
  channelId: string;

  constructor(
    id: string,
    CreatedAt: string,
    ReceivedAt: string,
    content: string,
    user: User,
    username: string,
    channel: Channel,
    channelId: string
  ) {
    this.id = id;
    this.CreatedAt = CreatedAt;
    this.ReceivedAt = ReceivedAt;
    this.content = content;
    this.user = user;
    this.username = username;
    this.channel = channel;
    this.channelId = channelId;
  }
}
export interface IMessage {
  id: string;
  CreatedAt: string;
  ReceivedAt: string;
  content: string;
  user: User;
  username: string;
  channel: Channel;
  channelId: string;
}

/*
 ** Channel
 */
export class Channel implements IChannel {
  id: string;
  name: string;
  createdAt: string;
  updated: string;
  ispublic: boolean;
  SubscribedUsers: Subscription[];
  Message: Message[];
  hash: string;
  passwordProtected: boolean;
  channel_type: eChannelType;

  constructor(
    id: string,
    name: string,
    createdAt: string,
    updated: string,
    ispublic: boolean,
    SubscribedUsers: Subscription[],
    Message: Message[],
    hash: string,
    passwordProtected: boolean,
    channel_type: eChannelType
  ) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
    this.updated = updated;
    this.ispublic = ispublic;
    this.SubscribedUsers = SubscribedUsers;
    this.Message = Message;
    this.hash = hash;
    this.passwordProtected = passwordProtected;
    this.channel_type = channel_type;
  }
}
export interface IChannel {
  id: string;
  name: string;
  createdAt: string;
  updated: string;
  ispublic: boolean;
  SubscribedUsers: Subscription[];
  Message: Message[];
  hash: string;
  passwordProtected: boolean;
  channel_type: eChannelType;
}

/*
 ** Subscription
 */
export class Subscription implements ISubscription {
  channelId: string;
  role: eRole;
  channel: Channel;
  user: User;
  username: string;
  state: eSubscriptionState;
  stateActiveUntil: string;

  constructor(
    channelId: string,
    role: eRole,
    channel: Channel,
    user: User,
    username: string,
    state: eSubscriptionState,
    stateActiveUntil: string
  ) {
    this.channelId = channelId;
    this.role = role;
    this.channel = channel;
    this.user = user;
    this.username = username;
    this.state = state;
    this.stateActiveUntil = stateActiveUntil;
  }
}
export interface ISubscription {
  channelId: string;
  channel: Channel;
  user: User;
  username: string;
  role: eRole;
  state: eSubscriptionState;
  stateActiveUntil: string;
}

/*
 ** Game
 */
export class Game implements IGame {
  id: string;
  finishedAt: string;
  startedAt: string;
  score_playerOne: number;
  score_playerTwo: number;
  playerOne: User;
  playerOneName: string;
  playerTwo: User;
  playerTwoName: string;

  constructor(
    id: string,
    finishedAt: string,
    startedAt: string,
    score_playerOne: number,
    score_playerTwo: number,
    playerOne: User,
    playerOneName: string,
    playerTwo: User,
    playerTwoName: string
  ) {
    this.id = id;
    this.finishedAt = finishedAt;
    this.startedAt = startedAt;
    this.score_playerOne = score_playerOne;
    this.score_playerTwo = score_playerTwo;
    this.playerOne = playerOne;
    this.playerOneName = playerOneName;
    this.playerTwo = playerTwo;
    this.playerTwoName = playerTwoName;
  }
}
export interface IGame {
  id: string;
  finishedAt: string;
  startedAt: string;
  score_playerOne: number;
  score_playerTwo: number;
  playerOne: User;
  playerOneName: string;
  playerTwo: User;
  playerTwoName: string;
}

/*
 ** Avatar
 */
export class Avatar implements IAvatar {
  id: string;
  updatedAt: string;
  createdAt: string;
  user: User;
  username: string;
  linkOriginal: string;
  linkThumbnail: string;
  linkMedium: string;
  linkLarge: string;

  constructor(
    id: string,
    updatedAt: string,
    createdAt: string,
    user: User,
    username: string,
    linkOriginal: string,
    linkThumbnail: string,
    linkMedium: string,
    linkLarge: string
  ) {
    this.id = id;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
    this.user = user;
    this.username = username;
    this.linkOriginal = linkOriginal;
    this.linkThumbnail = linkThumbnail;
    this.linkMedium = linkMedium;
    this.linkLarge = linkLarge;
  }
}
export interface IAvatar {
  id: string;
  updatedAt: string;
  createdAt: string;
  user: User;
  username: string;
  linkOriginal: string;
  linkThumbnail: string;
  linkMedium: string;
  linkLarge: string;
}
