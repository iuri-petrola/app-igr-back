import "../src/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  //await prisma.photo.deleteMany();

  await prisma.photo.createMany({
    data: [
      {
        title: "Mensagem de Esperanca",
        imageUrl: "/uploads/mensagem-esperanca.jpg"
      },
      {
        title: "Palavra de Fe",
        imageUrl: "/uploads/palavra-fe.jpg"
      }
    ]
  });

}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
