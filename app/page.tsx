'use client'

import { useState } from 'react'
import { Upload, Download, Wand2, Sparkles, User, Zap, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [selectedStyle, setSelectedStyle] = useState('realistic')
  const [imageCount, setImageCount] = useState(1)
  const [prompt, setPrompt] = useState('高质量头像，专业风格')

  const styles = [
    { id: 'realistic', name: '真实风格', icon: User, description: '高质量写实头像' },
    { id: 'anime', name: '动漫风格', icon: Sparkles, description: '二次元动漫头像' },
    { id: 'artistic', name: '艺术风格', icon: Wand2, description: '油画、水彩艺术' },
    { id: 'vintage', name: '复古风格', icon: Zap, description: '胶片、宝丽来' },
    { id: 'cyberpunk', name: '赛博朋克', icon: Sparkles, description: '未来科技风格' },
    { id: 'fantasy', name: '幻想风格', icon: User, description: '奇幻冒险风格' },
    { id: 'minimalist', name: '极简风格', icon: User, description: '简洁现代风格' },
  ]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedImage(file)
    }
  }

  const handleGenerate = async () => {
    if (!uploadedImage && !prompt) {
      alert('请先上传照片或输入描述')
      return
    }

    setIsGenerating(true)

    try {
      const formData = new FormData()
      if (uploadedImage) {
        formData.append('image', uploadedImage)
      }
      formData.append('prompt', `${selectedStyle}风格，${prompt}`)
      formData.append('count', imageCount.toString())

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedImages(data.images)
      } else {
        alert('生成失败：' + data.error)
      }
    } catch (error) {
      console.error('生成失败：', error)
      alert('生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `ai-avatar-${Date.now()}.png`
    link.click()
  }

  const handleDownloadAll = () => {
    generatedImages.forEach((imageUrl, index) => {
      setTimeout(() => handleDownload(imageUrl), index * 500)
    })
  }

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="border-b bg-white/10 backdrop-blur-sm dark:bg-gray-800/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                AI Avatar Generator
              </span>
            </div>
            <Button variant="ghost" size="sm">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              AI 头像 & 照片生成器
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-6">
              基于智谱 AI (GLM-4-CogView)，普通人也能轻松、快速地生成各种风格的 AI 头像和艺术照片
            </p>
            <div className="flex items-center justify-center space-x-6 mb-8">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">8 种风格</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">30 秒生成</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wand2 className="w-5 h-5 text-pink-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">免费额度</span>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left Column - Upload & Settings */}
            <div className="space-y-6">
              {/* Upload Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-purple-600" />
                    <span>上传照片</span>
                  </CardTitle>
                  <CardDescription>
                    上传你的照片，AI 将基于照片生成各种风格的头像和照片
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        选择照片文件
                      </label>
                      <div className="flex items-center space-x-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      支持 JPG、PNG、WebP 格式，最大 10MB
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Style Selection Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wand2 className="w-5 h-5 text-blue-600" />
                    <span>选择风格</span>
                  </CardTitle>
                  <CardDescription>
                    选择 1-8 种风格，AI 将根据选择的风格生成头像
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {styles.map((style) => (
                      <div
                        key={style.id}
                        onClick={() => handleStyleSelect(style.id)}
                        className={`cursor-pointer rounded-lg p-4 border-2 transition-all
                          ${selectedStyle === style.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                          }`}
                      >
                        <style.icon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                        <div className="text-center">
                          <div className="text-sm font-medium mb-1">{style.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{style.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Prompt Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-pink-600" />
                    <span>描述提示</span>
                  </CardTitle>
                  <CardDescription>
                    输入额外的描述，让 AI 更好地理解你的需求（可选）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      type="text"
                      placeholder="例如：高质量头像，专业风格，微笑"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Settings Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span>生成设置</span>
                  </CardTitle>
                  <CardDescription>
                    调整生成数量和其他参数
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">
                          生成数量
                        </label>
                        <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                          {imageCount} 张
                        </span>
                      </div>
                      <Slider
                        value={[imageCount]}
                        onValueChange={(value) => setImageCount(value[0])}
                        min={1}
                        max={4}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>1 张</span>
                        <span>4 张</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      当前免费额度：每天 100 张生成次数
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || (!uploadedImage && !prompt)}
                className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                    <span>生成中...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    <span>开始生成</span>
                  </div>
                )}
              </Button>
            </div>

            {/* Right Column - Results */}
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-pink-600" />
                    <span>生成结果</span>
                  </CardTitle>
                  <CardDescription>
                    生成成功的头像和照片将在这里显示
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedImages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Upload className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                      <div className="space-y-2">
                        <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                          还没有生成结果
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          上传照片或输入描述，然后点击"开始生成"
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {generatedImages.map((imageUrl, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <div className="aspect-square w-full mb-4 rounded-lg overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={`Generated avatar ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(imageUrl)}
                              className="flex-1"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              下载
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(imageUrl)
                                alert('已复制图片链接到剪贴板')
                              }}
                              className="flex-1"
                            >
                              复制链接
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {generatedImages.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            onClick={handleDownloadAll}
                            className="w-full"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            下载全部 ({generatedImages.length} 张)
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  为什么选择我们？
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">简单易用</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">普通人也能轻松使用</div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">快速生成</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">30 秒即可完成</div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Wand2 className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">多种风格</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">8 种风格可选</div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">完全免费</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">每天 100 张免费额度</div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">安全可靠</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">国内 AI 服务，数据安全</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">
                立即体验 AI 头像生成器
              </h2>
              <p className="mb-6 text-lg">
                无需等待，立即上传照片，30 秒即可生成高质量 AI 头像
              </p>
              <Button
                onClick={() => document.getElementById('file-input')?.click()}
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                <Upload className="w-5 h-5 mr-2" />
                立即开始
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-white/10 backdrop-blur-sm dark:bg-gray-800/10 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <div className="mb-4">
              Powered by{' '}
              <span className="font-semibold text-purple-600">智谱 AI (GLM-4-CogView)</span>
            </div>
            <div className="flex items-center justify-center space-x-6">
              <a href="#" className="hover:text-purple-600 transition-colors">
                使用条款
              </a>
              <span className="text-gray-400">|</span>
              <a href="#" className="hover:text-purple-600 transition-colors">
                隐私政策
              </a>
              <span className="text-gray-400">|</span>
              <a href="#" className="hover:text-purple-600 transition-colors">
                联系我们
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
