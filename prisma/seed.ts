import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main(){
  const email=process.env.ADMIN_EMAIL||"admin@tong-an.local";
  const password=process.env.ADMIN_PASSWORD||"ChangeMe123!";
  const passwordHash=await bcrypt.hash(password,12);
  await prisma.user.upsert({where:{email},update:{passwordHash,role:"ADMIN"},create:{email,name:"Tong An Admin",passwordHash,role:"ADMIN"}});
  for(const name of ["Landscape","Portrait","Nature","Architecture"]){await prisma.category.upsert({where:{slug:name.toLowerCase()},update:{},create:{name,slug:name.toLowerCase()}})}
}
main().finally(()=>prisma.$disconnect());
