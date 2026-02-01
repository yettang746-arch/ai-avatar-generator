import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File | null
    const prompt = formData.get('prompt') as string | null
    const count = parseInt(formData.get('count') as string || '1')

    console.log('生成参数:', { hasImage: !!image, prompt, count })

    // 获取配置
    const zhipuApiKey = process.env.NEXT_PUBLIC_ZHIPU_API_KEY

    if (!zhipuApiKey) {
      return NextResponse.json(
        { success: false, error: '智谱 API Key 未配置' },
        { status: 500 }
      )
    }

    // 生成图片的提示词
    const fullPrompt = prompt || '高质量头像，专业风格，高质量，详细'

    // 调用智谱 AI CogView API 生成图片
    const generatedImages: string[] = []

    // 生成指定数量的图片
    for (let i = 0; i < count; i++) {
      try {
        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${zhipuApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'cogview-3',
            prompt: fullPrompt,
            size: '1024x1024',
            n: 1
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('智谱 API 错误:', errorText)
          throw new Error(`智谱 API 返回错误: ${response.status}`)
        }

        const data = await response.json()

        if (data.data && data.data[0] && data.data[0].url) {
          generatedImages.push(data.data[0].url)
          console.log(`成功生成第 ${i + 1} 张图片`)
        } else {
          console.error('API 返回数据格式异常:', data)
          throw new Error('API 返回数据格式异常')
        }

        // 避免请求过快
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`生成第 ${i + 1} 张图片失败:`, error)
        // 如果某张图片生成失败，继续生成其他图片
        continue
      }
    }

    if (generatedImages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '所有图片生成失败，请重试'
        },
        { status: 500 }
      )
    }

    // 返回成功响应
    return NextResponse.json({
      success: true,
      images: generatedImages,
      message: `成功生成 ${generatedImages.length} 张图片${generatedImages.length < count ? `（共请求 ${count} 张）` : ''}`,
      params: {
        hasImage: !!image,
        prompt: fullPrompt,
        count,
        generated: generatedImages.length
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('生成失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: '生成失败，请重试',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
