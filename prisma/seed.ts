import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data...')

  // 1. Roles
  const rolesData = ['ADMIN', 'PENGELOLA_BMN', 'PENANGGUNG_JAWAB_RUANGAN', 'PENGGUNA_BMN', 'PIMPINAN']
  const roles = await Promise.all(rolesData.map(name => 
    prisma.role.upsert({ where: { name }, update: {}, create: { name } })
  ))
  const getRole = (name: string) => roles.find(r => r.name === name)!.id

  // 2. Units
  const unit = await prisma.unit.upsert({
    where: { code: 'BPS-SULTRA-01' },
    update: {},
    create: { code: 'BPS-SULTRA-01', name: 'BPS Provinsi Sulawesi Tenggara' }
  })

  // 3. Locations and Rooms
  const location = await prisma.location.upsert({
    where: { code: 'LOC-01' },
    update: {},
    create: { code: 'LOC-01', name: 'Gedung Utama BPS Sultra' }
  })

  const room1 = await prisma.room.upsert({
    where: { code: 'R-IT' },
    update: {},
    create: { code: 'R-IT', name: 'Ruang IT / Server', locationId: location.id }
  })

  // 4. Categories & Asset Types
  const catElektronik = await prisma.category.upsert({
    where: { code: 'CAT-ELK' },
    update: {},
    create: { code: 'CAT-ELK', name: 'Elektronik & IT' }
  })
  
  const typeLaptop = await prisma.assetType.upsert({
    where: { code: 'TYP-LAP' },
    update: {},
    create: { code: 'TYP-LAP', name: 'Laptop', categoryId: catElektronik.id }
  })

  // 5. Users
  const password = await bcrypt.hash('password123', 10)
  
  const users = [
    { email: 'admin@bps.go.id', username: 'admin', name: 'Administrator', roleId: getRole('ADMIN') },
    { email: 'pengelola@bps.go.id', username: 'pengelola', name: 'Pengelola BMN Sultra', roleId: getRole('PENGELOLA_BMN') },
    { email: 'pj@bps.go.id', username: 'pjruangan', name: 'PJ Ruangan IT', roleId: getRole('PENANGGUNG_JAWAB_RUANGAN') },
    { email: 'user@bps.go.id', username: 'userbmn', name: 'Pegawai BPS', roleId: getRole('PENGGUNA_BMN') },
    { email: 'pimpinan@bps.go.id', username: 'pimpinan', name: 'Kepala BPS Sultra', roleId: getRole('PIMPINAN') },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password, unitId: unit.id }
    })
  }

  // 6. Assets (Dummy)
  const assetsCount = await prisma.asset.count()
  if (assetsCount === 0) {
    for (let i = 1; i <= 20; i++) {
      const condition = i % 5 === 0 ? "RUSAK_RINGAN" : (i % 7 === 0 ? "RUSAK_BERAT" : "BAIK")
      const status = condition === "RUSAK_BERAT" ? "DALAM_PEMELIHARAAN" : (i % 3 === 0 ? "DIPINJAM" : "TERSEDIA")
      
      await prisma.asset.create({
        data: {
          assetCode: `A00${i}`,
          nup: `1000${i}`,
          name: `Laptop BPS ${i}`,
          categoryId: catElektronik.id,
          assetTypeId: typeLaptop.id,
          brand: 'Lenovo',
          type: 'ThinkPad T14',
          serialNumber: `SN-LN-123${i}`,
          acquisitionYear: 2023,
          acquisitionDate: new Date('2023-01-15'),
          acquisitionValue: 15000000,
          locationId: location.id,
          roomId: room1.id,
          unitId: unit.id,
          condition,
          status,
          qrCode: `QR-A00${i}`
        }
      })
    }
  }

  console.log('Seed completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
