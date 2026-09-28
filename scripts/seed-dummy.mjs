import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Menjalankan proses seeding data dummy lanjutan...')

  // 1. Dapatkan referensi User
  const admin = await prisma.user.findFirst({ where: { username: 'admin' } })
  const pengelola = await prisma.user.findFirst({ where: { username: 'pengelola' } })
  const pegawai = await prisma.user.findFirst({ where: { username: 'userbmn' } })
  
  if (!admin || !pengelola || !pegawai) {
    console.error('⚠️ Silakan jalankan `npx prisma db seed` terlebih dahulu untuk membuat user dasar.')
    return
  }

  // 2. Buat Kategori Baru (Kendaraan, Mebel)
  const catKendaraan = await prisma.category.upsert({
    where: { code: 'CAT-KDR' },
    update: {},
    create: { code: 'CAT-KDR', name: 'Kendaraan' }
  })
  
  const catMebel = await prisma.category.upsert({
    where: { code: 'CAT-MBL' },
    update: {},
    create: { code: 'CAT-MBL', name: 'Mebel & Furnitur' }
  })
  
  const typeMobil = await prisma.assetType.upsert({
    where: { code: 'TYP-MOB' },
    update: {},
    create: { code: 'TYP-MOB', name: 'Mobil', categoryId: catKendaraan.id }
  })
  
  const typeMotor = await prisma.assetType.upsert({
    where: { code: 'TYP-MOT' },
    update: {},
    create: { code: 'TYP-MOT', name: 'Motor', categoryId: catKendaraan.id }
  })

  const loc = await prisma.location.findFirst()
  const room = await prisma.room.findFirst()
  const unit = await prisma.unit.findFirst()

  if (!loc || !room || !unit) {
    console.error('⚠️ Silakan jalankan `npx prisma db seed` terlebih dahulu.')
    return
  }

  console.log('📦 Membuat aset Kendaraan dan Mebel...')
  
  // Aset Kendaraan
  const mobil = await prisma.asset.upsert({
    where: { assetCode: 'K-001' },
    update: {},
    create: {
      assetCode: 'K-001', nup: '20001', name: 'Mobil Dinas Operasional',
      categoryId: catKendaraan.id, assetTypeId: typeMobil.id, brand: 'Toyota', type: 'Innova Zenix',
      serialNumber: 'DT 1024 GO', acquisitionYear: 2024, acquisitionValue: 450000000,
      locationId: loc.id, roomId: room.id, unitId: unit.id,
      condition: 'BAIK', status: 'TERSEDIA', qrCode: 'QR-K001'
    }
  })

  const motor = await prisma.asset.upsert({
    where: { assetCode: 'K-002' },
    update: {},
    create: {
      assetCode: 'K-002', nup: '20002', name: 'Motor Dinas Lapangan',
      categoryId: catKendaraan.id, assetTypeId: typeMotor.id, brand: 'Honda', type: 'PCX 160',
      serialNumber: 'DT 5531 XY', acquisitionYear: 2023, acquisitionValue: 32000000,
      locationId: loc.id, roomId: room.id, unitId: unit.id,
      condition: 'RUSAK_RINGAN', status: 'PEMELIHARAAN', qrCode: 'QR-K002'
    }
  })

  // 3. Buat Data Peminjaman (Borrowings)
  console.log('🔄 Membuat riwayat peminjaman...')
  await prisma.borrowing.deleteMany({}) // Reset borrowings
  
  await prisma.borrowing.create({
    data: {
      assetId: mobil.id,
      userId: pegawai.id,
      purpose: 'Perjalanan dinas ke luar kota (Kunjungan Daerah)',
      borrowDate: new Date(new Date().setDate(new Date().getDate() - 2)),
      estReturnDate: new Date(new Date().setDate(new Date().getDate() + 3)),
      status: 'DISETUJUI'
    }
  })

  // Cari laptop untuk dipinjam
  const laptop = await prisma.asset.findFirst({ where: { name: { contains: 'Laptop' }, status: 'TERSEDIA' } })
  if (laptop) {
    await prisma.borrowing.create({
      data: {
        assetId: laptop.id,
        userId: pegawai.id,
        purpose: 'Rapat koordinasi teknis di Bappeda',
        borrowDate: new Date(),
        estReturnDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        status: 'MENUNGGU_PERSETUJUAN'
      }
    })
    
    await prisma.borrowing.create({
      data: {
        assetId: laptop.id,
        userId: admin.id,
        purpose: 'Presentasi hasil sensus',
        borrowDate: new Date(new Date().setDate(new Date().getDate() - 10)),
        estReturnDate: new Date(new Date().setDate(new Date().getDate() - 8)),
        status: 'DIKEMBALIKAN'
      }
    })
  }

  // 4. Buat Data Maintenance
  console.log('🔧 Membuat riwayat maintenance (perbaikan)...')
  await prisma.maintenance.deleteMany({}) // Reset maintenance
  
  await prisma.maintenance.create({
    data: {
      assetId: motor.id,
      type: 'KURATIF',
      technician: 'Bengkel Resmi Honda',
      date: new Date(),
      description: 'Ganti oli dan perbaikan rem depan (blong saat dipakai dinas)',
      cost: 450000,
      status: 'DALAM_PROSES'
    }
  })

  await prisma.maintenance.create({
    data: {
      assetId: mobil.id,
      type: 'PREVENTIF',
      technician: 'Toyota Kalla',
      date: new Date(new Date().setDate(new Date().getDate() - 30)),
      description: 'Service rutin 10.000 KM',
      action: 'Ganti oli, filter oli, balancing',
      cost: 1200000,
      status: 'SELESAI',
      completionDate: new Date(new Date().setDate(new Date().getDate() - 29))
    }
  })

  // 5. Buat Data Sensus (Stock Opname)
  console.log('📋 Membuat data Sensus BMN...')
  await prisma.sensusRecord.deleteMany({})
  await prisma.sensus.deleteMany({})
  
  const sensus = await prisma.sensus.create({
    data: {
      year: new Date().getFullYear(),
      period: 'Semester 2',
      status: 'AKTIF',
      notes: 'Sensus rutin untuk mengecek keberadaan fisik aset IT dan Kendaraan',
      startDate: new Date(new Date().setDate(new Date().getDate() - 5))
    }
  })

  // Buat record sensus untuk 5 aset pertama
  const assetsToScan = await prisma.asset.findMany({ take: 5 })
  for (const asset of assetsToScan) {
    await prisma.sensusRecord.create({
      data: {
        sensusId: sensus.id,
        assetId: asset.id,
        status: 'DITEMUKAN',
        scannedBy: admin.id,
        notes: asset.condition === 'BAIK' ? 'Aset ada dan sesuai' : 'Aset ada tapi perlu perbaikan',
        scannedAt: new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 4)))
      }
    })
  }

  // Update jumlah aset dipegang user (Opsional, trigger atau relasi sudah meng-handle ini jika di query dinamis)
  // Tapi kita update manual 'userId' di asset agar muncul di 'Aset yang Dipegang' di halaman Users.
  await prisma.asset.update({
    where: { id: mobil.id },
    data: { userId: pegawai.id, status: 'DIPINJAM' }
  })
  
  if (laptop) {
     await prisma.asset.update({
       where: { id: laptop.id },
       data: { userId: admin.id }
     })
  }

  // 6. Buat Data Assessment
  console.log('🔍 Membuat data Assessment (Penilaian)...')
  await prisma.assessment.deleteMany({})

  await prisma.assessment.create({
    data: {
      assetId: mobil.id,
      assessorId: admin.id,
      assessmentDate: new Date(new Date().setDate(new Date().getDate() - 20)),
      physicalCond: 'BAIK',
      functionality: 'BERFUNGSI_BAIK',
      feasibility: 'SANGAT_LAYAK',
      damageLevel: '0%',
      notes: 'Mesin masih sangat halus, body mulus tidak ada penyok.',
      recommendation: 'Lanjutkan perawatan preventif rutin.',
      result: 'LAYAK_PAKAI'
    }
  })

  await prisma.assessment.create({
    data: {
      assetId: motor.id,
      assessorId: pengelola.id,
      assessmentDate: new Date(new Date().setDate(new Date().getDate() - 10)),
      physicalCond: 'RUSAK_RINGAN',
      functionality: 'BERFUNGSI_SEBAGIAN',
      feasibility: 'LAYAK_DENGAN_PERBAIKAN',
      damageLevel: '25%',
      notes: 'Rem blong dan shockbreaker depan bocor.',
      recommendation: 'Segera bawa ke bengkel resmi.',
      estCost: 450000,
      result: 'PERLU_PERBAIKAN'
    }
  })

  // 7. Buat Data Pengaduan (Complaints)
  console.log('📢 Membuat data Pengaduan Kerusakan (Complaints)...')
  await prisma.complaint.deleteMany({})

  await prisma.complaint.create({
    data: {
      assetId: laptop?.id || mobil.id,
      reporterId: pegawai.id,
      damageType: 'Layar Blank / Mati Total',
      description: 'Saat dinyalakan, layar hanya hitam saja padahal lampu indikator menyala. Tolong segera dicek karena ada data penting.',
      incidentDate: new Date(new Date().setDate(new Date().getDate() - 1)),
      priority: 'HIGH',
      status: 'OPEN'
    }
  })

  await prisma.complaint.create({
    data: {
      assetId: motor.id,
      reporterId: pegawai.id,
      damageType: 'Rem Blong (Insiden Lapangan)',
      description: 'Hampir kecelakaan karena rem depan tidak berfungsi saat turun gunung di daerah Konawe. Motor sudah diamankan di kantor kecamatan terdekat.',
      incidentDate: new Date(new Date().setDate(new Date().getDate() - 5)),
      priority: 'CRITICAL',
      status: 'IN_PROGRESS'
    }
  })

  console.log('✅ Berhasil menginjeksi data dummy yang saling terhubung!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
