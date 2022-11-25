import { LoremIpsum } from 'lorem-ipsum';
import {
  IUserBasicInfo,
  IConvList,
  IConvItem,
  IMessageList,
  IMessage,
  UserScores,
  MatchHistory,
  IUserMatchInfo,
  IMatchRecap,
  OnlineStatus,
  Scope,
} from './models'

let lorem: LoremIpsum = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
})

export function makeid(length: number = 10) {
  var result           = '';
  var characters       = 'abcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function makeavatar() {
  return ('src/assets/tharchen_2.jpeg')
  let url = 'https://avatars.githubusercontent.com/'
  let id: string = makeid(10)
  let uri: string = url + id
  return String(uri)
}

export function randomDate(start: number = 1668486420, end: number = 1668686420, startHour: number = 0, endHour: number = 23) {
  let date: Date = new Date(start + Math.random() * (end - start));
  let hour = startHour + Math.random() * (endHour - startHour) | 0;
  date.setHours(hour);
  return date;
}

/////////////////////

export function fake_IUserBasicInfo() {
  let ret: IUserBasicInfo = {
    id: makeid() as string,
    name: 'name_'+makeid(5) as string,
    avatar: makeavatar() as string,
    onlineStatus: fake_OnlineStatus() as OnlineStatus,
  }
  return ret
}
export function fakeArray_IUserBasicInfo(count: number = 10) {
  let ret: Array<IUserBasicInfo> = []
  for ( var i = 0; i < count; i++ ) {
    ret.push(fake_IUserBasicInfo())
  }
  return ret
}

export function fake_IConvList(count: number = 10) {
  let ret: IConvList = fakeArray_IConvItem(count)
  return ret
}
export function fakeArray_IConvList(count: number = 10) {
  let ret: Array<IConvList> = []
  for ( var i = 0; i < count; i++ ) {
    ret.push(fake_IConvList())
  }
  return ret
}

export function fake_IConvItem() {
  let ret: IConvItem = {
    identity: fake_IUserBasicInfo() as IUserBasicInfo,
    scope: fake_Scope() as Scope,
  }
  return ret
}
export function fakeArray_IConvItem(count: number = 10) {
  let ret: Array<IConvItem> = []
  for ( var i = 0; i < count; i++ ) {
    ret.push(fake_IConvItem())
  }
  return ret
}

export function fake_IMessageList(count: number = 10) {
  let ret: IMessageList = fakeArray_IMessage(count)
  return ret
}
export function fakeArray_IMessageList(count: number = 10) {
  let ret: Array<IMessageList> = []
  for ( var i = 0; i < count; i++ ) {
    ret.push(fake_IMessageList())
  }
  return ret
}

export function fake_IMessage() {
  let ret: IMessage = {
    id: makeid() as string,
    identity: fake_IUserBasicInfo() as IUserBasicInfo,
    timestamp: randomDate() as Date,
    body: lorem.generateSentences(1) as string,
  }
  return ret
}
export function fakeArray_IMessage(count: number = 10) {
  let ret: Array<IMessage> = []
  for ( var i = 0; i < count; i++ ) {
    ret.push(fake_IMessage())
  }
  return ret
}

export function fake_UserScores() {
  let ret: UserScores = {
    identity: fake_IUserBasicInfo() as IUserBasicInfo,
    victoryScore: Math.floor(Math.random() * 500) as number,
    defeatScore: Math.floor(Math.random() * 500) as number,
  }
  return ret
}
export function fakeArray_UserScores(count: number = 10) {
  let ret: Array<UserScores> = []
  for ( var i = 0; i < count; i++ ) {
    ret.push(fake_UserScores())
  }
  return ret
}

export function fake_MatchHistory(count: number = 10) {
  let ret: MatchHistory = fakeArray_IMatchRecap(count)
  return ret
}
export function fakeArray_MatchHistory(count: number = 10) {
  let ret: Array<MatchHistory> = []
  for ( var i = 0; i < count; i++ ) {
    ret.push(fake_MatchHistory())
  }
  return ret
}

export function fake_IUserMatchInfo() {
  let ret: IUserMatchInfo = {
    identity: fake_IUserBasicInfo() as IUserBasicInfo,
    score: Math.floor(Math.random() * 10) as number,
  }
  return ret
}
export function fakeArray_IUserMatchInfo(count: number = 10) {
  let ret: Array<IUserMatchInfo> = []
  for ( var i = 0; i < count; i++ ) {
    ret.push(fake_IUserMatchInfo())
  }
  return ret
}

export function fake_IMatchRecap() {
  let ret: IMatchRecap = {
    user: fake_IUserMatchInfo() as IUserMatchInfo,
    opponent: fake_IUserMatchInfo() as IUserMatchInfo,
  }
  return ret
}
export function fakeArray_IMatchRecap(count: number = 10) {
  let ret: Array<IMatchRecap> = []
  for ( var i = 0; i < count; i++ ) {
    ret.push(fake_IMatchRecap())
  }
  return ret
}

export function fake_OnlineStatus() {
  let i = Math.floor(Math.random() * 4);
  switch (i) {
    case 0: return OnlineStatus.ONLINE
    case 1: return OnlineStatus.OFFLINE
    case 2: return OnlineStatus.INGAME
    case 3: return OnlineStatus.NONE
  }
}
export function fake_Scope() {
  let i = Math.floor(Math.random() * 2);
  switch (i) {
    case 0: return Scope.PRIVATE
    case 1: return Scope.PUBLIC
  }
}
// export function fake_MatchResultVD() {
//   let i = Math.floor(Math.random() * 2);
//   switch (i) {
//     case 0: return MatchResultVD.VICTORY
//     case 1: return MatchResultVD.DEFEAT
//   }
// }
