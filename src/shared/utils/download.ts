import { axiosInstance, requestHooks } from '@/shared/request'

/**
 * 文件下载工具
 *
 * 统一处理下载文件名解析、Blob 保存及下载接口响应。
 */

/**
 * 从 Content-Disposition 响应头中提取文件名。
 * 优先解析 RFC 5987 格式的 filename*，其次使用普通 filename。
 */
function fileNameFromHeader(header?: string): string {
  if (!header) return ''
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header)
  if (encoded?.[1]) return decodeURIComponent(encoded[1])
  const plain = /filename="?([^";]+)"?/i.exec(header)
  return plain?.[1] ? decodeURIComponent(plain[1]) : ''
}

/** 将 Blob 转换为浏览器下载操作，并使用指定文件名保存。 */
export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

/**
 * 通过 GET 接口下载文件。
 *
 * - 优先使用响应头中的文件名，没有时使用 fallbackName。
 * - 响应内容为空时返回 empty。
 * - 后端返回 JSON 业务错误时通知用户并返回 failed。
 * - 下载成功后返回 saved。
 */
export async function downloadFile(
  url: string,
  params: object,
  fallbackName: string,
): Promise<'saved' | 'empty' | 'failed'> {
  const res = await axiosInstance.get<Blob>(url, {
    params,
    responseType: 'blob',
    rawResponse: true,
  })
  const blob = res.data
  if (!blob || blob.size === 0) return 'empty'

  // Blob 下载接口也可能返回 JSON 格式的业务错误。
  if (blob.type.includes('application/json')) {
    const body = JSON.parse(await blob.text()) as { code?: number; msg?: string }
    if (body.code !== undefined && body.code !== 0) {
      requestHooks.notifyError(body.msg ?? '')
      return 'failed'
    }
  }

  const header = res.headers['content-disposition'] as string | undefined
  saveBlob(blob, fileNameFromHeader(header) || fallbackName)
  return 'saved'
}
