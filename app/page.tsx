'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Download, Sparkles, X, ChevronDown, ChevronRight, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import Image from 'next/image'

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [selectedStyle, setSelectedStyle] = useState(3)
  const [imageCount, setImageCount] = useState(1)
  const [showUploadNotice, setShowUploadNotice] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [errorType, setErrorType] = useState<'user' | 'system'>('user')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [styleRefUrl, setStyleRefUrl] = useState('')
  const [styleRefFile, setStyleRefFile] = useState<File | null>(null)
  const [styleRefPreview, setStyleRefPreview] = useState<string | null>(null)
  const [uploadCardRef] = useState<HTMLElement | null>(null)
  const [generatingProgress, setGeneratingProgress] = useState(0)
  const [generatingStage, setGeneratingStage] = useState<'upload' | 'queue' | 'generating' | 'complete'>('upload')
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0)
  const [showResultSection, setShowResultSection] = useState(false)

  const previewUrlRef = useRef<string | null>(null)
  const styleRefPreviewRef = useRef<string | null>(null)

  const styles = [
    { id: 3, name: '小清新', description: '通透柔光', preview: '/style-previews/style-3.png' },
    { id: 0, name: '复古漫画', description: '轻复古线条', preview: '/style-previews/style-0.png' },
    { id: 2, name: '二次元', description: '动漫质感', preview: '/style-previews/style-2.png' },
    { id: 1, name: '3D童话', description: '立体童话感', preview: '/style-previews/style-1.png' },
    { id: 7, name: '炫彩卡通', description: '高饱和卡通', preview: '/style-previews/style-7.png' },
    { id: 5, name: '国画古风', description: '水墨氛围', preview: '/style-previews/style-5.png' },
    { id: 4, name: '未来科技', description: '冷色霓虹', preview: '/style-previews/style-4.png' },
    { id: 8, name: '清雅国风', description: '淡雅国风', preview: '/style-previews/style-8.png' },
    { id: 14, name: '国风工笔', description: '细腻工笔', preview: '/style-previews/style-14.png' },
    { id: 31, name: '黏土世界', description: '黏土材质', preview: '/style-previews/style-31.png' },
    { id: 39, name: '冰箱贴世界', description: '趣味贴纸', preview: '/style-previews/style-39.png' },
    { id: -1, name: '自定义风格', description: '参考图风格', preview: '/style-previews/style--1.png' }
  ]

  // 释放 ObjectURL（内存优化）
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      if (styleRefPreview) URL.revokeObjectURL(styleRefPreview)
    }
  }, [])

  // Toast 自动关闭
  useEffect(() => {
    if (showUploadNotice) {
      const timer = setTimeout(() => setShowUploadNotice(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showUploadNotice])

  // 生成进度模拟
  useEffect(() => {
    if (isGenerating) {
      const stages = ['upload', 'queue', 'generating', 'complete'] as const
      let currentStageIndex = 0
      const progressInterval = setInterval(() => {
        if (generatingProgress < 100) {
          setGeneratingProgress(prev => {
            const newProgress = prev + 5
            if (newProgress >= 25 && generatingStage === 'upload') {
              setGeneratingStage('queue')
            } else if (newProgress >= 50 && generatingStage === 'queue') {
              setGeneratingStage('generating')
            }
            return newProgress
          })
        } else {
          clearInterval(progressInterval)
        }
      }, 300)

      return () => clearInterval(progressInterval)
    } else {
      setGeneratingProgress(0)
      setGeneratingStage('upload')
    }
  }, [isGenerating, generatingStage])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 验证文件大小
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('图片大小不能超过 10MB，请选择更小的图片')
      setErrorType('user')
      return
    }

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      setErrorMessage('仅支持 JPG、PNG、WebP 格式的图片')
      setErrorType('user')
      return
    }

    // 释放旧的 ObjectURL
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }

    const newPreviewUrl = URL.createObjectURL(file)
    setUploadedImage(file)
    setPreviewUrl(newPreviewUrl)
    previewUrlRef.current = newPreviewUrl
    setShowUploadNotice(true)
    setErrorMessage('')
    setErrorType('user')
  }

  const handleGenerate = async (styleOverride?: number, fileOverride?: File) => {
    const fileToUse = fileOverride || uploadedImage
    if (!fileToUse) {
      setErrorMessage('请先上传照片')
      setErrorType('user')
      // 滚动到上传区域
      document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // 高亮上传区域
      const uploadCard = document.getElementById('upload-card')
      uploadCard?.classList.add('ring-2', 'ring-red-400')
      setTimeout(() => uploadCard?.classList.remove('ring-2', 'ring-red-400'), 2000)
      return
    }

    setIsGenerating(true)
    setErrorMessage('')
    setShowResultSection(false)

    try {
      const formData = new FormData()
      if (fileToUse) {
        formData.append('image', fileToUse)
      }
      const styleToUse = styleOverride ?? selectedStyle
      if (styleToUse === -1 && !styleRefUrl && !styleRefFile) {
        setErrorMessage('自定义风格需要上传参考图或填写参考图 URL（二选一）')
        setErrorType('user')
        setIsGenerating(false)
        return
      }
      formData.append('styleIndex', styleToUse.toString())
      if (styleToUse === -1 && styleRefUrl) {
        formData.append('styleRefUrl', styleRefUrl)
      }
      if (styleToUse === -1 && styleRefFile) {
        formData.append('styleRefFile', styleRefFile)
      }
      formData.append('count', imageCount.toString())

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedImages(data.images)
        setShowResultSection(true)
        setSelectedPreviewIndex(0)
        // 滚动到结果区域
        setTimeout(() => {
          document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 300)
      } else {
        const errorMsg = data.error || '生成失败，请重试'
        setErrorMessage(errorMsg)
        setErrorType('system')

        // 分层错误处理
        if (errorMsg.includes('大小') || errorMsg.includes('格式') || errorMsg.includes('URL')) {
          setErrorType('user')
        } else {
          setErrorType('system')
        }
      }
    } catch (error) {
      console.error('生成失败：', error)
      setErrorMessage('网络连接失败，请检查网络后重试')
      setErrorType('system')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `ai-avatar-style-${selectedStyle}-${index + 1}-${Date.now()}.png`
    link.click()
  }

  const handleStyleSelect = (styleId: number) => {
    setSelectedStyle(styleId)
    if (styleId !== -1) {
      setStyleRefUrl('')
      setStyleRefFile(null)
      setStyleRefPreview(null)
      setErrorMessage('')
    }
  }

  const handleStyleRefUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 释放旧的 ObjectURL
    if (styleRefPreviewRef.current) {
      URL.revokeObjectURL(styleRefPreviewRef.current)
    }

    const newPreviewUrl = URL.createObjectURL(file)
    setStyleRefFile(file)
    setStyleRefPreview(newPreviewUrl)
    styleRefPreviewRef.current = newPreviewUrl
    setErrorMessage('')
    setErrorType('user')
  }

  const handleHeroCTAClick = () => {
    if (!uploadedImage) {
      // 滚动到上传区域
      document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // 高亮上传区域
      const uploadCard = document.getElementById('upload-card')
      uploadCard?.classList.add('ring-2', 'ring-purple-400')
      setTimeout(() => uploadCard?.classList.remove('ring-2', 'ring-purple-400'), 2000)
    } else {
      // 滚动到生成区域
      document.getElementById('generate-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleRetry = () => {
    setErrorMessage('')
    setErrorType('user')
    handleGenerate()
  }

  return (
    <div className="min-h-screen bg-[#F7F5FF] text-[#1E293B]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(171,131,255,0.22),_transparent_55%)]" />
      <div className="relative">
        {/* Toast 通知（移动端底部优化） */}
        {showUploadNotice && (
          <div
            role="alert"
            aria-live="polite"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:top-20 sm:left-auto sm:translate-x-0 sm:right-6 z-50 rounded-full bg-[#0F172A] text-white px-4 py-2 text-sm shadow-lg flex items-center gap-2 animate-[slideUp_0.3s_ease-out]"
          >
            <CheckCircle className="w-4 h-4 text-green-400" />
            上传成功，已准备生成
            <button
              onClick={() => setShowUploadNotice(false)}
              className="ml-2 hover:opacity-70"
              aria-label="关闭通知"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="border-b border-[#E8E6F5] bg-white/70 backdrop-blur">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center shadow-[0_10px_24px_rgba(124,58,237,0.25)]">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold tracking-wide text-[#1B103B]">AI Avatar</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#64748B] hover:text-[#7C3AED] hover:bg-purple-50"
                onClick={() => setShowHelpModal(true)}
              >
                帮助
              </Button>
            </div>
          </div>
        </div>

        {/* 帮助弹窗 */}
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-[#1B103B]">使用说明</h3>
                  <button
                    onClick={() => setShowHelpModal(false)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                    aria-label="关闭"
                  >
                    <X className="w-5 h-5 text-[#6B7280]" />
                  </button>
                </div>
                <div className="space-y-4 text-sm text-[#4B5563]">
                  <div>
                    <h4 className="font-medium text-[#1F1440] mb-2">📸 第一步：上传照片</h4>
                    <p>支持 JPG、PNG、WebP 格式，建议使用清晰的正脸照片，大小不超过 10MB。</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1F1440] mb-2">🎨 第二步：选择风格</h4>
                    <p>从 12 种预设风格中选择，或上传参考图实现自定义风格。</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1F1440] mb-2">⚡ 第三步：生成头像</h4>
                    <p>点击生成按钮，等待约 15 秒即可获得高质量的 AI 头像。</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1F1440] mb-2">💡 提示</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>生成结果链接有效期 24 小时，请及时下载</li>
                      <li>自定义风格时，参考图优先使用上传的文件</li>
                      <li>生成数量越多，耗时越久</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#6D28D9] shadow-sm">
                在线免费 AI 头像生成器
              </span>
              <h1 className="text-4xl sm:text-5xl font-semibold mb-4 text-[#1B103B] mt-4">
                AI 头像生成器
              </h1>
              <p className="text-lg text-[#6B7280] mb-6">
                上传照片，选择风格，约 15 秒生成高清 AI 头像
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="px-3 py-1 rounded-full border border-[#E8E6F5] text-sm text-[#4B5563] bg-white">上传优先</div>
                <div className="px-3 py-1 rounded-full border border-[#E8E6F5] text-sm text-[#4B5563] bg-white">多种风格</div>
                <div className="px-3 py-1 rounded-full border border-[#E8E6F5] text-sm text-[#4B5563] bg-white">高清输出</div>
              </div>
              <Button
                onClick={handleHeroCTAClick}
                className="bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-lg hover:shadow-xl transition-shadow"
              >
                立即生成头像
              </Button>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-[0_30px_80px_rgba(124,58,237,0.18)] border border-[#EFEAFB]">
              <div className="text-sm text-[#6B7280] mb-3">上传后预览</div>
              <div className="aspect-[4/3] rounded-2xl bg-[#F3F0FF] border border-[#E8E6F5] flex items-center justify-center text-[#9CA3AF] overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="上传预览" className="h-full w-full object-cover" />
                ) : (
                  '预览图区域'
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <span className="flex-1 rounded-full bg-[#F3F0FF] text-center text-xs text-[#6D28D9] py-2">小清新</span>
                <span className="flex-1 rounded-full bg-[#F3F0FF] text-center text-xs text-[#6D28D9] py-2">国画古风</span>
                <span className="flex-1 rounded-full bg-[#F3F0FF] text-center text-xs text-[#6D28D9] py-2">黏土世界</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="space-y-4">
            {/* 上传区域 */}
            <Card
              id="upload-card"
              className="bg-white border border-[#EFEAFB] shadow-[0_20px_60px_rgba(124,58,237,0.12)] transition-all duration-200"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Upload className="w-4 h-4 text-[#6D28D9]" /> 第一步：上传照片
                </CardTitle>
                <CardDescription className="text-[#6B7280]">
                  建议清晰正脸，支持 JPG/PNG/WebP，最大 10MB
                </CardDescription>
              </CardHeader>
              <CardContent>
                <label className="block w-full cursor-pointer">
                  <div className="rounded-2xl border-2 border-dashed border-[#D7CCFF] bg-[#F5F1FF] px-6 py-12 text-center transition-colors hover:border-[#7C3AED] hover:bg-[#F3F0FF]/50">
                    {previewUrl ? (
                      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#E8E6F5] bg-white">
                        <img src={previewUrl} alt="上传预览" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Upload className="w-7 h-7 text-[#6D28D9]" />
                        <div className="text-sm text-[#1F1440] font-medium">点击上传照片</div>
                        <div className="text-xs text-[#6B7280]">支持 JPG/PNG/WebP，最大 10MB</div>
                      </div>
                    )}
                  </div>
                  <Input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </CardContent>
            </Card>

            {uploadedImage ? (
              <>
                {/* 生成区域 */}
                <div
                  id="generate-section"
                  className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 transition-all duration-500 ease-out"
                >
                  <Card className="bg-white border border-[#EFEAFB] shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Sparkles className="w-4 h-4 text-[#6D28D9]" /> 第二步：选择风格
                      </CardTitle>
                      <CardDescription className="text-[#6B7280]">
                        选好风格后点击生成按钮
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {styles.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => !isGenerating && handleStyleSelect(style.id)}
                            disabled={isGenerating}
                            className={`group rounded-xl border px-2 py-3 text-left text-xs transition-all ${
                              selectedStyle === style.id
                                ? 'border-[#7C3AED] bg-[#F3F0FF] shadow-md'
                                : 'border-[#E8E6F5] bg-white text-[#4B5563] hover:border-[#7C3AED] hover:shadow-sm'
                            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]`}
                          >
                            <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-[#E8E6F5] bg-white mb-2 relative">
                              <img
                                src={style.preview}
                                alt={style.name}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              {selectedStyle === style.id && (
                                <div className="absolute top-1 right-1 bg-[#7C3AED] text-white rounded-full p-1">
                                  <CheckCircle className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                            <div className="font-medium text-sm text-[#1F1440]">{style.name}</div>
                            <div className="text-[#6B7280] mt-1">{style.description}</div>
                          </button>
                        ))}
                      </div>

                      {/* 自定义风格 */}
                      {selectedStyle === -1 && (
                        <div className="space-y-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4">
                          <label className="block text-xs font-medium text-[#1F1440]">
                            上传风格参考图（优先）
                          </label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleStyleRefUpload}
                            disabled={isGenerating}
                            className="bg-white border-[#E2E8F0] focus:border-[#7C3AED]"
                          />
                          {styleRefPreview && (
                            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-[#E8E6F5] bg-white">
                              <img
                                src={styleRefPreview}
                                alt="风格参考图预览"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <label className="block text-xs font-medium text-[#1F1440]">
                            或填写参考图 URL（可选）
                          </label>
                          <Input
                            type="url"
                            placeholder="https://example.com/style.jpg"
                            value={styleRefUrl}
                            onChange={(e) => setStyleRefUrl(e.target.value)}
                            disabled={isGenerating}
                            className="bg-white border-[#E2E8F0] focus:border-[#7C3AED]"
                          />
                        </div>
                      )}

                      {/* 生成数量 Slider */}
                      <div>
                        <div className="flex items-center justify-between text-xs text-[#6B7280] mb-2">
                          <span className="font-medium">生成数量</span>
                          <span className="text-[#7C3AED] font-semibold">{imageCount} 张</span>
                        </div>
                        <div className="relative pt-1">
                          <Slider
                            value={[imageCount]}
                            onValueChange={(value) => !isGenerating && setImageCount(value[0])}
                            min={1}
                            max={4}
                            step={1}
                            disabled={isGenerating}
                            className={isGenerating ? 'opacity-50' : ''}
                          />
                          {/* 刻度 */}
                          <div className="flex justify-between text-xs text-[#9CA3AF] mt-1">
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                            <span>4</span>
                          </div>
                        </div>
                        <p className="text-xs text-[#94A3B8] mt-1">数量越多耗时越久</p>
                      </div>

                      {/* 生成按钮 */}
                      <Button
                        onClick={() => handleGenerate()}
                        disabled={isGenerating}
                        className="w-full h-11 text-base font-medium bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-shadow"
                      >
                        {isGenerating ? (
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 animate-spin" />
                            生成中...
                          </span>
                        ) : (
                          '开始生成头像'
                        )}
                      </Button>

                      {/* 说明 */}
                      <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3 text-xs text-[#64748B]">
                        <p className="flex items-start gap-2">
                          <Clock className="w-4 h-4 mt-0.5 text-[#7C3AED]" />
                          <span>预计耗时 15 秒左右，结果链接有效期 24 小时，请及时下载。</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 实时预览卡片（改为生成进度） */}
                  <Card className="bg-white border border-[#EFEAFB] shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">
                        {isGenerating ? '生成进度' : '实时预览'}
                      </CardTitle>
                      <CardDescription className="text-[#6B7280]">
                        {isGenerating
                          ? '正在生成您的头像...'
                          : '生成结果会展示在这里'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isGenerating ? (
                        <div className="aspect-square rounded-xl border border-[#E8E6F5] bg-[#F5F1FF] flex flex-col items-center justify-center p-6 space-y-4">
                          {/* 进度条 */}
                          <div className="w-full">
                            <div className="flex justify-between text-xs text-[#6B7280] mb-2">
                              <span>总进度</span>
                              <span>{generatingProgress}%</span>
                            </div>
                            <div className="h-2 bg-white rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] transition-all duration-300 ease-out"
                                style={{ width: `${generatingProgress}%` }}
                              />
                            </div>
                          </div>
                          {/* 阶段提示 */}
                          <div className="space-y-2 w-full">
                            <div
                              className={`flex items-center gap-2 text-sm ${
                                generatingStage === 'upload' || generatingStage === 'queue' || generatingStage === 'generating' || generatingStage === 'complete'
                                  ? 'text-[#7C3AED]'
                                  : 'text-[#9CA3AF]'
                              }`}
                            >
                              {generatingStage === 'upload' || generatingStage === 'queue' || generatingStage === 'generating' || generatingStage === 'complete' ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              <span>上传图片</span>
                            </div>
                            <div
                              className={`flex items-center gap-2 text-sm ${
                                generatingStage === 'queue' || generatingStage === 'generating' || generatingStage === 'complete'
                                  ? 'text-[#7C3AED]'
                                  : 'text-[#9CA3AF]'
                              }`}
                            >
                              {generatingStage === 'queue' || generatingStage === 'generating' || generatingStage === 'complete' ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              <span>排队处理</span>
                            </div>
                            <div
                              className={`flex items-center gap-2 text-sm ${
                                generatingStage === 'generating' || generatingStage === 'complete'
                                  ? 'text-[#7C3AED]'
                                  : 'text-[#9CA3AF]'
                              }`}
                            >
                              {generatingStage === 'generating' || generatingStage === 'complete' ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              <span>AI 生成中...</span>
                            </div>
                          </div>
                          {/* 预计时间 */}
                          <div className="text-xs text-[#9CA3AF] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            预计还需 {15 - (generatingProgress * 0.15).toFixed(0)} 秒
                          </div>
                        </div>
                      ) : generatedImages.length > 0 ? (
                        <div className="aspect-square rounded-xl overflow-hidden border border-[#E8E6F5] relative">
                          <img
                            src={generatedImages[selectedPreviewIndex]}
                            alt={`Preview ${selectedPreviewIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {generatedImages.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                              {selectedPreviewIndex + 1}/{generatedImages.length}
                            </div>
                          )}
                        </div>
                      ) : errorMessage ? (
                        <div className="aspect-square rounded-xl border border-dashed border-[#FCA5A5] bg-[#FEF2F2] flex flex-col items-center justify-center gap-3 p-4 text-center">
                          <AlertCircle className="w-8 h-8 text-[#B91C1C]" />
                          <div className="text-sm text-[#B91C1C] font-medium">{errorMessage}</div>
                          {errorType === 'user' ? (
                            <div className="text-xs text-[#9CA3AF] space-y-1">
                              <p>请检查：</p>
                              <ul className="text-left list-disc list-inside space-y-1">
                                <li>图片是否在 10MB 以内</li>
                                <li>格式是否为 JPG/PNG/WebP</li>
                                {selectedStyle === -1 && <li>是否提供了参考图</li>}
                              </ul>
                            </div>
                          ) : (
                            <div className="text-xs text-[#9CA3AF]">
                              系统繁忙或网络异常，请稍后重试
                            </div>
                          )}
                          <Button
                            size="sm"
                            onClick={handleRetry}
                            className="bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
                          >
                            重试生成
                          </Button>
                        </div>
                      ) : (
                        <div className="aspect-square rounded-xl border border-dashed border-[#D7CCFF] bg-[#F5F1FF] flex flex-col items-center justify-center text-sm text-[#9CA3AF] space-y-2">
                          <Sparkles className="w-8 h-8" />
                          <span>选择风格后点击生成</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-sm text-[#94A3B8] py-4 text-center">
                上传照片后，会显示风格选择与生成按钮。
              </div>
            )}

            {/* 生成结果区域 */}
            {generatedImages.length > 0 && showResultSection && (
              <div
                id="result-section"
                className="mt-6 animate-[fadeInUp_0.6s_ease-out]"
              >
                <Card className="bg-white border border-[#EFEAFB] shadow-[0_20px_60px_rgba(124,58,237,0.12)]">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      生成结果
                    </CardTitle>
                    <CardDescription className="text-[#6B7280]">
                      点击图片切换预览，或点击下载保存头像
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* 主预览图 */}
                    <div className="aspect-[4/3] w-full rounded-xl overflow-hidden border-2 border-[#7C3AED] mb-4 relative">
                      <img
                        src={generatedImages[selectedPreviewIndex]}
                        alt={`Generated ${selectedPreviewIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        当前预览
                      </div>
                    </div>
                    {/* 缩略图网格 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {generatedImages.map((imageUrl, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedPreviewIndex(index)}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                            selectedPreviewIndex === index
                              ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20'
                              : 'border-[#E8E6F5] hover:border-[#7C3AED]'
                          } group`}
                        >
                          <img
                            src={imageUrl}
                            alt={`Generated ${index + 1}`}
                            className="w-full aspect-square object-cover"
                          />
                          {selectedPreviewIndex === index && (
                            <div className="absolute inset-0 bg-[#7C3AED]/10 flex items-center justify-center">
                              <div className="bg-[#7C3AED] text-white rounded-full p-1">
                                <CheckCircle className="w-4 h-4" />
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownload(imageUrl, index)
                              }}
                              className="w-full bg-white/90 border-white/90 hover:bg-white text-[#1F1440] text-xs"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              下载
                            </Button>
                          </div>
                        </button>
                      ))}
                    </div>
                    {/* 批量下载 */}
                    <div className="mt-4 flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() => generatedImages.forEach((img, idx) => handleDownload(img, idx))}
                        className="border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3F0FF]"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        下载全部图片
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 添加全局动画 */}
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}
