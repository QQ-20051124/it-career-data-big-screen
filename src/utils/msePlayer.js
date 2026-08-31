// 按需加载 mp4box，若未安装则失败时回退到普通播放（不影响构建）
let MP4Box = null
try {
  // eslint-disable-next-line
  MP4Box = require('mp4box')
} catch (e) {
  // 运行环境缺依赖：build/dev 都不报错，调用 playMp4ViaMse 时自动回退
  MP4Box = null
}

/**
 * MSE（MediaSource）直喂数据播放器。
 *
 * 背景：<video> 元素无论使用网络 URL 还是 blob: URL，Chrome 播放器管线在
 * 开始播放时都会内部迁移资源读取器，旧读取器被中止即在控制台记录一条
 * net::ERR_ABORTED（媒体元素固有行为，常规写法无法规避）。
 *
 * MSE 由 JS 通过 SourceBuffer 直接喂入 demux 后的 MP4 分段数据，
 * 完全绕开媒体资源加载管线，从根源上不存在会被中止的资源请求
 * （YouTube / B站 Web 播放器同款架构）。
 *
 * @param {HTMLVideoElement} videoEl 目标 video 元素（应已设置 muted）
 * @param {ArrayBuffer} arrayBuffer 完整 MP4 文件数据
 * @returns {Promise<boolean>} true=MSE 播放已启动；false=失败（调用方应回退普通 blob 播放）
 */
export function playMp4ViaMse (videoEl, arrayBuffer) {
  return new Promise((resolve) => {
    let settled = false
    const done = (ok) => { if (!settled) { settled = true; resolve(ok) } }
    const fallback = () => done(false)

    try {
      if (!window.MediaSource || typeof MediaSource.isTypeSupported !== 'function') return fallback('no-mse-api')
      if (!MP4Box || typeof MP4Box.createFile !== 'function') return fallback('mp4box-missing')

      // mp4box 要求输入 buffer 带 fileStart 标记
      const buf = arrayBuffer
      buf.fileStart = 0

      const mp4file = MP4Box.createFile()
      let mse = null
      let sb = null
      let initSegments = []
      let initAppended = false
      let endedStream = false

      mp4file.onError = fallback

      mp4file.onReady = (info) => {
        try {
          const track = (info.tracks || []).find(t => t.type === 'video' || t.video)
          if (!track || !track.codec || !track.id) return fallback('no-video-track-or-codec:' + JSON.stringify(info.tracks || []).slice(0, 200))

          const mime = 'video/mp4; codecs="' + track.codec + '"'
          if (!MediaSource.isTypeSupported(mime)) return fallback('codec-unsupported:' + mime)

          mse = new MediaSource()
          const mseUrl = URL.createObjectURL(mse)
          // 记录到元素上，供调用方在卸载时 revokeObjectURL 释放
          videoEl._mseObjectUrl = mseUrl
          videoEl.src = mseUrl

          mse.addEventListener('sourceopen', () => {
            try {
              sb = mse.addSourceBuffer(mime)
              try { sb.mode = 'sequence' } catch (e) { /* 部分 SB 不支持，忽略 */ }

              // 分段回调：appendBuffer 必须等上一次 updateend，否则抛 InvalidStateError
              const pendingToSb = []
              const appendWhenIdle = (buffer, isLast) => {
                pendingToSb.push({ buffer, isLast })
                pump()
              }
              let pumping = false
              const pump = () => {
                if (pumping || !sb || !pendingToSb.length) return
                if (sb.updating) return
                const item = pendingToSb.shift()
                pumping = true
                const onUpd = () => {
                  sb.removeEventListener('updateend', onUpd)
                  pumping = false
                  if (item.isLast && !pendingToSb.length && !endedStream) {
                    endedStream = true
                    try { if (mse.readyState === 'open') mse.endOfStream() } catch (e) { /* 忽略 */ }
                    const p = videoEl.play()
                    if (p && p.catch) p.catch(() => { /* 自动播放策略拦截时静默 */ })
                    done(true)
                    return
                  }
                  pump()
                }
                sb.addEventListener('updateend', onUpd)
                try {
                  sb.appendBuffer(item.buffer)
                } catch (e) {
                  sb.removeEventListener('updateend', onUpd)
                  pumping = false
                  fallback()
                }
              }

              mp4file.onSegment = (trackId, sourceBuffer, segmentBuffer, sampleNum, isLast) => {
                if (sourceBuffer !== sb) return
                appendWhenIdle(segmentBuffer, isLast)
              }

              // 设置分段选项后初始化分段（生成 init segment），随后启动提取
              mp4file.setSegmentOptions(track.id, sb, { nbSamples: 500 })
              initSegments = mp4file.initializeSegmentation() || []

              // 先追加 init segment（ftyp+moov），完成后再由 onSegment 追加 moof+mdat
              if (!initSegments.length) return fallback('no-init-segment')
              const first = initSegments.shift()
              initAppended = true
              appendWhenIdle(first.buffer, false)

              mp4file.start()
            } catch (e) {
              fallback()
            }
          })

          mse.addEventListener('error', fallback)
        } catch (e) {
          fallback()
        }
      }

      // 开始解析（onReady / onSegment 为异步回调）
      mp4file.appendBuffer(buf)
      // init segment 依赖 onReady 后的 initializeSegmentation，若解析未产出视频轨则由 onError/onReady 兜底
      if (!initAppended) {
        // appendBuffer 后 onReady 会同步/异步触发；此处无需额外操作
      }
    } catch (e) {
      fallback()
    }
  })
}
