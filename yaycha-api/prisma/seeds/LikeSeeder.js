const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function LikeSeeder() {
  const data=[];
  console.log("Post like seeding started....");

  for (let i = 0; i< 40; i++){
    const postId = faker.number.int({min: 1, max: 20});
    const userId = faker.number.int({min: 1, max: 10});

    data.push({postId, userId});  
  }
 
    await prisma.postLike.createMany({data});

  console.log("Post like seeding done.");
}

module.exports = { LikeSeeder };
