import { PrismaClient, ChannelType, Role } from "@prisma/client";
import * as messages from "./messages.json";
import namesList from "./names";
import * as bcrypt from "bcrypt";

class ProgressBar {
    private readonly total: number;
    private current: number = 0;

    constructor(total: number) {
        this.total = total;
    }

    increment(amount: number = 1) {
        this.current += amount;
        this.render();
    }

    render() {
        const width = 40;
        const complete = Math.round((this.current / this.total) * width);
        const incomplete = width - complete;
        const progress = `${this.current}/${this.total} [` + "█".repeat(complete) + "░".repeat(incomplete) + "]";
        const percent = Math.round((this.current / this.total) * 100);
        process.stdout.write(`\r${progress} ${percent}%`);
        if (this.current === this.total) {
            process.stdout.write("\n");
        }
    }
}

function shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const OlduserData: any[] = [
    {
        username: "adeburea",
        email: "adeburea@student.42.bzh",
        password: bcrypt.hashSync("null", 10),
    },
    {
        username: "rballage",
        email: "rballage@student.42.bzh",
        password: bcrypt.hashSync("null", 10),
    },
    {
        username: "ssingevi",
        email: "ssingevi@student.42.bzh",
        password: bcrypt.hashSync("null", 10),
    },
    {
        username: "admin",
        email: "admin@student.42.bzh",
        password: bcrypt.hashSync("null", 10),
    },
    {
        username: "guestman",
        email: "guest@student.42.bzh",
        password: bcrypt.hashSync("null", 10),
    },
    {
        username: "HelloTheDude",
        email: "hello@student.42.bzh",
        password: bcrypt.hashSync("null", 10),
    },
    {
        username: "BigBoss",
        email: "BigBoss@student.42.bzh",
        password: bcrypt.hashSync("null", 10),
    },
    {
        username: "Victor",
        email: "victor@student.42.bzh",
        password: bcrypt.hashSync("null", 10),
    },
    {
        username: "Alice99",
        email: "alice99student.42.bzh",
        password: bcrypt.hashSync("null", 10),
    },
    {
        username: "dracula",
        email: "dracula_luv_blood@student.42.bzh",
        password: bcrypt.hashSync("null", 10),
    },
    {
        username: "Jasper",
        email: "cantseeme@student.42.bzh",
        password: bcrypt.hashSync("null", 10),
    },
    {
        username: "PongMaster",
        email: "ping@student.42.bzh",
        password: bcrypt.hashSync("null", 10),
    },
    {
        username: "toto",
        email: "toto@42.fr",
        password: bcrypt.hashSync("null", 10),
    },
];

console.log("messsages dataset stats:");
var stat = {
    min: 1e30,
    max: 0,
    mean: 0,
};
for (const k of Object.keys(messages)) {
    if (messages[k].length < stat.min) {
        stat.min = messages[k].length;
    }
    if (messages[k].length > stat.max) {
        stat.max = messages[k].length;
    }
    stat.mean += messages[k].length;
}
stat.mean /= Object.keys(messages).length;
console.log(stat);

const prisma = new PrismaClient();

//////////////////////////////////////////////
// VARIABLES /////////////////////////////////
const message_count_max = 16;
const userCount = 64 - 14;
const match_per_user = 16;

const follow_coef = 0.2;
const message_coef_private = 0.6;
const message_coef_public = 0.1;
//////////////////////////////////////////////
//////////////////////////////////////////////

type UserScore = {
    username: string;
    victoriesAsPOne: number;
    victoriesAsPTwo: number;
    defeatsAsPOne: number;
    defeatsAsPTwo: number;
};

type Game = {
    score_playerOne: number;
    score_playerTwo: number;
    playerOneName: string;
    playerTwoName: string;
};

type User = {
    username: string;
    password: string;
    email: string;
};

type Message = {
    content: string;
    username: string;
    channelId: string;
    CreatedAt: Date;
    ReceivedAt: Date;
};

type Channel = {
    name: string;
    channelType: string;
    subscribedUsers: any;
    messages: any;
    passwordProtected?: boolean;
};

type Follow = {
    followerId: string;
    followingId: string;
};

class Generator {
    private getRandomAnwser(coef: number) {
        return Math.random() < coef;
    }
    follow() {
        return this.getRandomAnwser(follow_coef);
    }
    private_message() {
        return this.getRandomAnwser(message_coef_private);
    }
    public_message() {
        return this.getRandomAnwser(message_coef_public);
    }
    followCount() {
        return message_count_max * follow_coef;
    }
    private_messageCount() {
        return message_count_max * message_coef_private;
    }
    public_messageCount() {
        return message_count_max * message_coef_public;
    }
}
const gen = new Generator();

/// UTILS //////////////////////////////////////////////////////////////////////
function randomProperty(obj: Object) {
    var keys = Object.keys(obj);
    return obj[keys[(keys.length * Math.random()) << 0]];
}

function randomDate(start: number = new Date().getTime() - 604800000 * 2, end: number = new Date().getTime() - 3600000, startHour: number = 0, endHour: number = 23) {
    let date: Date = new Date(start + Math.random() * (end - start));
    let hour = (startHour + Math.random() * (endHour - startHour)) | 0;
    date.setHours(hour);
    return date;
}

function genUser() {
    const idx = Math.floor(Math.random() * namesList.length);
    return {
        username: namesList[idx],
        password: bcrypt.hashSync("null", 10),
        email: namesList[idx] + "@student.42.bzh",
    };
    // const idx = Math.floor(Math.random() * namesList.length);
    // const idx2 = Math.floor(Math.random() * namesList.length);
    // return {
    //     username: namesList[idx] + namesList[idx2],
    //     password: "null",
    //     email: namesList[idx] + namesList[idx2] + "@student.42.bzh",
    // };
}

function findEmailByUsername(users: Array<User>, username: string) {
    return users.find((elem) => {
        return elem.username == username;
    });
}
////////////////////////////////////////////////////////////////////////////////
async function main() {
    console.log(`USERS CREATION (count: ${userCount + OlduserData.length})`);
    /// USERS //////////////////////////////////////////////////////////////////////
    // const users: Array<User> = OlduserData;
    const users: Array<User> = Array.from({ length: userCount })
        .map(() => {
            return genUser();
        })
        .concat(OlduserData);
    const usersNames = users.map((elem) => {
        return { username: elem.username };
    });
    const userCountReal = (await prisma.user.createMany({ data: users as Array<any>, skipDuplicates: true })).count;
    console.log(`total of created users: ${userCountReal})`);

    //////////////////////////////////////////////////////////////////////////////////

    /// PUBLICS CHANNELS ///////////////////////////////////////////////////////////
    function createMessages() {
        const publicMessages = [];
        const progressBar = new ProgressBar(users.length);
        for (const user of users) {
            var tmp = Array.from({ length: gen.public_messageCount() }).map(() => {
                const d = randomDate() as Date;
                return {
                    content: randomProperty(messages),
                    username: user.username,
                    CreatedAt: d,
                    ReceivedAt: d,
                };
            });
            publicMessages.push(...tmp);
            progressBar.increment();
        }
        return publicMessages;
    }

    console.log(`PUBLIC CHANNEL CREATION (count: 3})`);
    const publicChannels: Array<Channel> = [
        {
            name: "#general",
            channelType: ChannelType.PUBLIC,
            subscribedUsers: { createMany: { data: usersNames, skipDuplicates: true } },
            messages: { createMany: { data: createMessages(), skipDuplicates: true } },
        },
        {
            name: "#event",
            channelType: ChannelType.PUBLIC,
            subscribedUsers: { createMany: { data: usersNames, skipDuplicates: true } },
            messages: { createMany: { data: createMessages(), skipDuplicates: true } },
        },
        {
            name: "#orga",
            channelType: ChannelType.PUBLIC,
            subscribedUsers: { createMany: { data: usersNames, skipDuplicates: true } },
            messages: { createMany: { data: createMessages(), skipDuplicates: true } },
        },
    ];
    for (const c of publicChannels)
        await prisma.channel.create({
            data: c as Channel,
            include: {
                subscribedUsers: true,
                messages: true,
            },
        } as any);

    const publicChannelsRet = await prisma.channel.findMany({ where: { channelType: "PUBLIC" } });

    // create public subscriptions for all users
    console.log(`    MESSAGE CREATION (count: ${publicChannelsRet.length * userCountReal * gen.public_messageCount()})`);
    console.log(`    SUBSCRIPTIONS CREATION (count: ${publicChannelsRet.length * userCountReal})`);
    let publicSub = [];
    var publicMessages = [];

    await prisma.subscription.createMany({ data: publicSub as Array<any>, skipDuplicates: true });
    await prisma.message.createMany({ data: publicMessages as Array<any>, skipDuplicates: true });

    ////////////////////////////////////////////////////////////////////////////////
    console.log(`USERS FOLLOWS CREATION (count: ~${userCountReal * userCountReal * follow_coef})`);
    function createFollowData(u1: string, u2: string) {
        return {
            followerId: u1,
            followingId: u2,
        };
    }
    var follows: Array<Follow> = [];

    for (const user of users) {
        for (const user2 of users) {
            if (user.username != user2.username && gen.follow()) follows.push(createFollowData(user.username, user2.username));
        }
    }
    await prisma.follows.createMany({ data: follows as Array<any>, skipDuplicates: true });

    console.log(`USERS FRIEND DETECTION`);
    var tmp = [];
    var ret = [];
    follows.forEach((elem) => {
        if (
            tmp.find((tmpelem) => {
                return elem.followerId == tmpelem.followingId && elem.followingId == tmpelem.followerId;
            })
        )
            ret.push(elem);
        else tmp.push(elem);
    });
    console.log(`ONE_TO_ONE CHANNEL CREATION (count: ~${ret.length})`);
    var onetoone_chan = [];
    ret.forEach((elem) => {
        onetoone_chan.push({
            name: findEmailByUsername(users, elem.followerId).email + findEmailByUsername(users, elem.followingId).email,
            channelType: ChannelType.ONE_TO_ONE,
        });
    });
    await prisma.channel.createMany({ data: onetoone_chan as Array<any>, skipDuplicates: true });
    const onetooneChannel = await prisma.channel.findMany({ where: { channelType: "ONE_TO_ONE" } });

    console.log(`ONE_TO_ONE CHANNEL SUBSCRIPTIONS CREATION (count: ~${ret.length * 2})`);
    var onetoone_sub = [];

    onetooneChannel.forEach((elem, i) => {
        onetoone_sub.push({
            username: ret[i].followerId,
            channelId: elem.id,
        });
        onetoone_sub.push({
            username: ret[i].followingId,
            channelId: elem.id,
        });
    });
    await prisma.subscription.createMany({ data: onetoone_sub as Array<any>, skipDuplicates: true });

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    // match history

    const users_scores: UserScore[] = users.map((user: User) => {
        return {
            username: user.username,
            victoriesAsPOne: 0,
            victoriesAsPTwo: 0,
            defeatsAsPOne: 0,
            defeatsAsPTwo: 0,
        } as UserScore;
    });

    const match_history: Game[] = [];

    const progressBarMatch = new ProgressBar(users_scores.length);
    users_scores.forEach((p1: UserScore) => {
        users_scores.forEach((p2: UserScore) => {
            if (p1.username == p2.username) return;
            for (let i = 0; i < Math.floor(Math.random() * match_per_user); i++) {
                const match: Game = {
                    score_playerOne: Math.floor(Math.random() * 7),
                    score_playerTwo: Math.floor(Math.random() * 7),
                    playerOneName: p1.username,
                    playerTwoName: p2.username,
                };
                if (match.score_playerOne > match.score_playerTwo) {
                    p1.victoriesAsPOne += 1;
                    p2.defeatsAsPTwo += 1;
                } else {
                    p1.defeatsAsPOne += 1;
                    p2.victoriesAsPTwo += 1;
                }
                match_history.push(match);
            }
        });
        progressBarMatch.increment();
    });
    await prisma.game.createMany({ data: shuffle(match_history), skipDuplicates: true });

    const prismaPromise = [];
    users_scores.forEach(async (user: UserScore) => {
        prismaPromise.push(prisma.user.update({ where: { username: user.username }, data: user }));
    });
    await Promise.all(prismaPromise);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    // create private channel
    const copains = users.slice(0, 5);

    const copainChannel = await prisma.channel.create({
        data: {
            name: "copains",
            channelType: ChannelType.PRIVATE,
        },
    });

    var copainSub = [];

    copainSub.push({
        username: copains[0].username,
        channelId: copainChannel.id,
        role: Role.OWNER,
    });

    copainSub.push({
        username: copains[1].username,
        channelId: copainChannel.id,
        role: Role.ADMIN,
    });

    for (const user of copains.slice(2)) {
        copainSub.push({
            username: user.username,
            channelId: copainChannel.id,
            role: Role.USER,
        });
    }

    console.log(copainSub);
    await prisma.subscription.createMany({ data: copainSub, skipDuplicates: true });
}

main();
