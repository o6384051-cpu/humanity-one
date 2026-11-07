import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'ahmed@humanity.one' },
    update: {},
    create: { email: 'ahmed@humanity.one', name: 'أحمد محمد', passwordHash, role: 'ADMIN' },
  })

  await prisma.project.createMany({
    data: [
      { userId: user.id, title: 'مشروع الطاقة النظيفة', description: 'حلول مستدامة', progress: 75 },
      { userId: user.id, title: 'الزراعة الذكية', description: 'ري ذكي', progress: 40 },
    ],
  })

  await prisma.task.createMany({
    data: [
      { userId: user.id, title: 'مراجعة تقرير المناخ', priority: 'high' },
      { userId: user.id, title: 'إكمال مشروع الطاقة', priority: 'medium' },
    ],
  })
}
main().catch(e => console.error(e)).finally(async () => await prisma.$disconnect())
