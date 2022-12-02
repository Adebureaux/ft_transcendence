import { Prisma, User } from "@prisma/client"

export const userProfileQuery = Prisma.validator<Prisma.UserArgs>()({
	select: {
		username: true,
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