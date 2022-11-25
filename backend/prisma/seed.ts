import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const userData: Prisma.UserCreateInput[] = [
  {
    username: 'adeburea',
	  email: 'adeburea@student.42.fr',
  },
  {
    username: 'rballage',
    email: 'rballage@student.42.fr',
  },
  {
	  username: 'tharchen',
	  email: 'tharchen@student.42.fr',
  },
  {
	  username: 'leCaca',
	  email: 'leCaca@student.42.fr',
  },
  {
	  username: 'admin',
	  email: 'admin@student.42.fr',
  },
  {
	  username: 'guestman',
	  email: 'guest@student.42.fr',
  },
  {
	  username: 'HelloTheDude',
	  email: 'hello@student.42.fr',
  },
  {
	  username: 'BigBoss',
	  email: 'BigBoss@student.42.fr',
  },
  {
	  username: 'Victor',
	  email: 'victor@student.42.fr',
  },
  {
	  username: 'Alice99',
	  email: 'alice99student.42.fr',
  },
  {
	  username: 'dracula',
	  email: 'dracula_luv_blood@student.42.fr',
  },
  {
	  username: 'Jasper',
	  email: 'cantseeme@student.42.fr',
  },
  {
	  username: 'PongMaster',
	  email: 'ping@student.42.fr',
  },
]

// const messages


async function main() {
  console.log(`Start seeding ...`)
  for (const u of userData) {
	try {
		const user = await prisma.user.create({
			data: u,
		})
		console.log(`Created user with name:  ${user.username}`)
	} catch (error) {
		
	}

  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
