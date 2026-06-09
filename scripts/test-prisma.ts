import { prisma } from "../lib/prisma";

async function main() {
  const rows = await prisma.taiwanStock.findMany({
    take: 5,
  });

  console.log(rows);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });