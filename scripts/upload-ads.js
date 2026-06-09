// upload-ads.js — sobe vídeos e cria anúncios na campanha BATCH03 [CHAT]
const fs = require('node:fs')
const https = require('node:https')
const path = require('node:path')

const TOKEN      = 'EAAWXdN0BrFMBRuDIrUyYvQdiyeACzRSZCTk5wGE0qgUWqVKLKBAQgATZCd7f3stMaq86Qe6tjQq150orpDRhBStGVjKj86tgdec6MOaQ68cCaSG2zSaJvlEP5WPZARc0zJM7flQpE0TQtbigTqoYfirKWMPjdzsZASLJ4ZBLfHCFZBtR9PD6CpgqQ7vzouOYOZARlx1'
const ACCT       = '1140705603244752'
const PAGE_ID    = '110072495247809'
const IG_ID      = '17841451572883055'
const LINK       = 'https://workshop.growthtap.com.br/chat'
const URL_TAGS   = 'utm_source=MetaAds&utm_medium={{adset.name}}&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{placement}}&utm_id={{campaign.id}}|{{adset.id}}|{{ad.id}}'
const ADSETS     = [
  { id: '120249295558990702', name: 'ENGAJAMENTO_IG' },
  { id: '120249295560170702', name: 'ABERTO' },
]
const VIDEOS = [
  { file: '/Users/isaacsantos/Downloads/IMG_2658.mov', slug: 'CCGT-AD15-IMG2658' },
  { file: '/Users/isaacsantos/Downloads/IMG_2656.mov', slug: 'CCGT-AD16-IMG2656' },
]
const CHUNK_SIZE = 10 * 1024 * 1024 // 10 MB

// ── helpers ─────────────────────────────────────────────────────────────────

function graphRequest(method, endpoint, body, isForm = false) {
  return new Promise((resolve, reject) => {
    const host = (method !== 'GET' && endpoint.startsWith('/advideos')) ? 'graph-video.facebook.com' : 'graph.facebook.com'
    const url  = new URL(`https://${host}/v21.0${endpoint}`)

    if (method === 'GET') {
      const opts = { hostname: url.hostname, path: url.pathname + url.search, method: 'GET' }
      const req = https.request(opts, res => {
        const chunks = []
        res.on('data', c => chunks.push(c))
        res.on('end', () => {
          try { resolve(JSON.parse(Buffer.concat(chunks).toString())) }
          catch (e) { reject(e) }
        })
      })
      req.on('error', reject)
      req.end()
      return
    }

    let reqBody, contentType
    if (isForm) {
      // multipart/form-data
      const boundary = `----FormBoundary${Date.now().toString(16)}`
      const parts = []
      for (const [k, v] of Object.entries(body)) {
        if (v instanceof Buffer) {
          parts.push(Buffer.concat([
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${k}"; filename="chunk"\r\nContent-Type: application/octet-stream\r\n\r\n`),
            v,
            Buffer.from('\r\n'),
          ]))
        } else {
          parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`))
        }
      }
      parts.push(Buffer.from(`--${boundary}--\r\n`))
      reqBody = Buffer.concat(parts)
      contentType = `multipart/form-data; boundary=${boundary}`
    } else {
      reqBody = JSON.stringify(body)
      contentType = 'application/json'
    }

    const opts = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': contentType, 'Content-Length': reqBody.length },
    }

    const req = https.request(opts, res => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())) }
        catch (e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.write(reqBody)
    req.end()
  })
}

// ── upload chunked ───────────────────────────────────────────────────────────

async function uploadVideo(filePath, name) {
  const fileSize = fs.statSync(filePath).size
  console.log(`\n📤 Upload: ${path.basename(filePath)} (${(fileSize/1024/1024).toFixed(1)} MB)`)

  // 1. Start
  const start = await graphRequest('POST', `/act_${ACCT}/advideos`, {
    upload_phase: 'start',
    file_size: fileSize,
    name,
    access_token: TOKEN,
  })
  if (!start.video_id) throw new Error(`Start failed: ${JSON.stringify(start)}`)
  const videoId        = start.video_id
  const uploadSessionId = start.upload_session_id
  console.log(`  ✓ Session aberta — video_id: ${videoId}`)

  // 2. Transfer chunks
  const fd = fs.openSync(filePath, 'r')
  let startOffset = parseInt(start.start_offset)
  let endOffset   = parseInt(start.end_offset)

  while (startOffset < fileSize) {
    const chunkLen = Math.min(CHUNK_SIZE, endOffset - startOffset)
    const buf = Buffer.alloc(chunkLen)
    fs.readSync(fd, buf, 0, chunkLen, startOffset)

    const pct = ((startOffset / fileSize) * 100).toFixed(1)
    process.stdout.write(`  ⏳ ${pct}% enviado...\r`)

    const res = await graphRequest('POST', `/act_${ACCT}/advideos`, {
      upload_phase: 'transfer',
      start_offset: startOffset,
      end_offset: endOffset,
      upload_session_id: uploadSessionId,
      video_id: videoId,
      access_token: TOKEN,
      video_file_chunk: buf,
    }, true)

    if (res.error) { fs.closeSync(fd); throw new Error(`Transfer failed: ${JSON.stringify(res.error)}`) }
    startOffset = parseInt(res.start_offset)
    endOffset   = parseInt(res.end_offset)
  }
  fs.closeSync(fd)
  process.stdout.write('  ✓ 100% enviado       \n')

  // 3. Finish
  const finish = await graphRequest('POST', `/act_${ACCT}/advideos`, {
    upload_phase: 'finish',
    video_id: videoId,
    upload_session_id: uploadSessionId,
    access_token: TOKEN,
  })
  if (!finish.success) throw new Error(`Finish failed: ${JSON.stringify(finish)}`)
  console.log(`  ✓ Vídeo processado — ID: ${videoId}`)
  return videoId
}

// ── creative + ad ────────────────────────────────────────────────────────────

async function getVideoThumbnail(videoId) {
  const res = await graphRequest('GET', `/${videoId}?fields=thumbnails&access_token=${TOKEN}`, {})
  const thumbs = res.thumbnails?.data || []
  const preferred = thumbs.find(t => t.is_preferred) || thumbs[0]
  if (!preferred) throw new Error(`No thumbnail for video ${videoId}`)
  return preferred.uri
}

async function createCreative(videoId, thumbnailUrl, adName) {
  const res = await graphRequest('POST', `/act_${ACCT}/adcreatives`, {
    access_token: TOKEN,
    name: adName,
    object_story_spec: JSON.stringify({
      page_id: PAGE_ID,
      instagram_user_id: IG_ID,
      video_data: {
        video_id: videoId,
        image_url: thumbnailUrl,
        call_to_action: { type: 'LEARN_MORE', value: { link: LINK } },
      },
    }),
    url_tags: URL_TAGS,
  })
  if (!res.id) throw new Error(`Creative failed: ${JSON.stringify(res)}`)
  console.log(`  ✓ Criativo: ${adName} → ${res.id}`)
  return res.id
}

async function createAd(adsetId, creativeId, adName) {
  const res = await graphRequest('POST', `/act_${ACCT}/ads`, {
    access_token: TOKEN,
    name: adName,
    adset_id: adsetId,
    creative: JSON.stringify({ creative_id: creativeId }),
    status: 'PAUSED',
  })
  if (!res.id) throw new Error(`Ad failed: ${JSON.stringify(res)}`)
  console.log(`  ✓ Anúncio: ${adName} → ${res.id}`)
  return res.id
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Subindo vídeos e criando anúncios — BATCH03 [CHAT]\n')

  // 1. Vídeos já enviados — reusar IDs
  const videoIds = ['27194064523594403', '1626599328415383']
  const thumbUrls = []
  for (const vid of videoIds) {
    process.stdout.write(`  ⏳ Buscando thumbnail do vídeo ${vid}...\r`)
    thumbUrls.push(await getVideoThumbnail(vid))
    console.log(`  ✓ Thumbnail obtida — vídeo ${vid}`)
  }

  // 2. Para cada conjunto, criar creative + ad para cada vídeo
  for (const adset of ADSETS) {
    console.log(`\n📦 Conjunto: ${adset.name}`)
    for (let i = 0; i < VIDEOS.length; i++) {
      const adName     = `${VIDEOS[i].slug}-${adset.name}`
      const creativeId = await createCreative(videoIds[i], thumbUrls[i], adName)
      await createAd(adset.id, creativeId, adName)
    }
  }

  console.log('\n✅ Pronto! 4 anúncios criados (2 vídeos × 2 conjuntos), todos PAUSADOS.')
}

main().catch(err => { console.error('\n❌ Erro:', err.message); process.exit(1) })
