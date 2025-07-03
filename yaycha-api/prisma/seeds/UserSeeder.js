const {PrismaClient} = require("@prisma/client");
const {faker} = require("@faker-js/faker");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

// Avatar service base URL for profile pictures
const AVATAR_BASE_URL = "https://avatar-placeholder.iran.liara.run/public";
// Picsum base URL for cover photos
const COVER_BASE_URL = "https://picsum.photos";

async function UserSeeder() {
    const password = await bcrypt.hash('password', 10);
    console.log("User seeding started...");

    for(let i = 0; i<10; i++){
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        const name = `${firstName} ${lastName}`;
        const username = `${firstName}${lastName[0]}`.toLowerCase();
        const bio = faker.person.bio();
        
        // Generate random avatar number (1-100)
        const avatarNumber = faker.number.int({ min: 1, max: 100 });
        const profilePicture = `${AVATAR_BASE_URL}/${avatarNumber}`;
        
        // Generate random cover photo (using Picsum with random ID and fixed size)
        const randomPicsumId = faker.number.int({ min: 1, max: 1000 });
        const coverPhoto = `${COVER_BASE_URL}/id/${randomPicsumId}/1500/500`;

        await prisma.user.upsert({
            where: { username },
            update: {},
            create: {
                name,
                username,
                bio,
                password,
                profilePicture,
                coverPhoto
            },
        });
    }

    console.log("User seeding done.");
}

module.exports = {UserSeeder};