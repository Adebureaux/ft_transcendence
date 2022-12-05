import { Prisma } from "@prisma/client"

export const userProfileQuery = Prisma.validator<Prisma.UserArgs>()({
	select: {
		username: true,
		victoriesAsPOne:true,
		victoriesAsPTwo:true,
		defeatsAsPOne:true,
		defeatsAsPTwo:true,

		// avatars: {
		// 	select: {
		// 		linkThumbnail: true,
		// 		linkMedium: true,
		// 		linkLarge: true
		// 	},
		// },
	}
});


export const userWholeQuery = Prisma.validator<Prisma.UserArgs>()({
	select: {
		username: true,
		email : true,
		TwoFA : true,
		createdAt : true,
		updatedAt : true,
		victoriesAsPOne:true,
		victoriesAsPTwo:true,
		defeatsAsPOne:true,
		defeatsAsPTwo:true,
		avatars: {
			select: {
				linkThumbnail: true,
				linkMedium: true,
				linkLarge: true
			},
		},
		channelSubscriptions : {select: {
			channelId: true,
			role: true
		}},
		followedBy : {select:{
			followerId: true
		}},
		following : {select:{
			followingId: true
		}},
		blocking : {select:{
			blockingId:true
		}}
	}
});


export type UserProfile = Prisma.UserGetPayload<typeof userProfileQuery>

export type UserWhole = Prisma.UserGetPayload<typeof userWholeQuery>

export interface IGames {
    total:  number;
    result: IResultGames[];
}

export interface IResultGames {
    id:              string;
    finishedAt:      Date;
    startedAt:       Date;
    score_playerOne: number;
    score_playerTwo: number;
    playerOneName:   string;
    playerTwoName:   string;
}
