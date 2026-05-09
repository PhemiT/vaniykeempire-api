require('dotenv').config()
const mongoose = require('mongoose')
const Content  = require('./src/models/Content')

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected')

  const audios = await Content.find({ type: 'audio', fileUrl: { $exists: true } })
  console.log(`Found ${audios.length} audio documents`)

  for (const doc of audios) {
    doc.previewUrl = doc.fileUrl.replace('/upload/', '/upload/eo_20/')
    await doc.save()
    console.log(`Updated: ${doc.title}`)
  }

  console.log('Done')
  await mongoose.disconnect()
}

migrate().catch(console.error)